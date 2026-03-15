import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../modules/audit/audit.service';

export const AUDIT_KEY = 'audit_action';

export interface AuditMeta {
  action: string;
  tableName: string;
}

/**
 * Decorator to mark a controller method for automatic audit logging.
 * Usage: @Auditable({ action: 'CREATE', tableName: 'products' })
 */
export function Auditable(meta: AuditMeta) {
  return (_target: any, _key: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(AUDIT_KEY, meta, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly auditService: AuditService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const meta: AuditMeta | undefined = this.reflector.get<AuditMeta>(
      AUDIT_KEY,
      context.getHandler(),
    );

    if (!meta) {
      return next.handle();
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const ip = req.ip;
    const userAgent = req.headers?.['user-agent'];

    return next.handle().pipe(
      tap((responseData) => {
        const recordId =
          responseData?.id || responseData?.data?.id || req.params?.id || null;

        const SENSITIVE_KEYS = [
          'password',
          'passwordHash',
          'oldPassword',
          'newPassword',
          'currentPassword',
          'refreshToken',
          'token',
        ];
        const diff = ['CREATE', 'UPDATE'].includes(meta.action)
          ? Object.fromEntries(
              Object.entries(req.body || {}).filter(
                ([k]) => !SENSITIVE_KEYS.includes(k),
              ),
            )
          : null;

        this.auditService
          .create({
            actorId: user?.id || null,
            action: meta.action,
            tableName: meta.tableName,
            recordId: recordId || null,
            diff: diff || null,
            ipAddress: ip,
            userAgent: userAgent,
          })
          .catch(() => {
            // Audit logging should never break the main request
          });
      }),
    );
  }
}
