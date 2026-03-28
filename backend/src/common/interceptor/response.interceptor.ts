import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        let responseData = data?.data !== undefined ? data.data : data;

        // When a service returns paginated data with meta (total, page, limit),
        // embed the pagination info inside the data field as { items, total, page, limit, totalPages }
        // so the frontend receives a consistent PaginatedResponse shape.
        const meta = data?.meta;
        if (
          meta &&
          meta.total !== undefined &&
          meta.page !== undefined &&
          Array.isArray(responseData)
        ) {
          const limit = meta.limit || 20;
          responseData = {
            items: responseData,
            total: meta.total,
            page: meta.page,
            limit,
            totalPages: Math.ceil(meta.total / limit),
          };
        } else if (data?.total !== undefined && Array.isArray(responseData)) {
          // Alternate pagination shape: { data: [...], total, query }
          const page = data.query?.page || 1;
          const limit = data.query?.limit || 20;
          responseData = {
            items: responseData,
            total: data.total,
            page,
            limit,
            totalPages: Math.ceil(data.total / limit),
          };
        }

        return {
          success: data?.success !== undefined ? data.success : true,
          message: data?.message || 'Operation successful',
          data: responseData,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
