import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalValidationPipe } from './common/pipes/global-validation.pipe';
import { SecurityConfig } from './config/security.config';
import helmet from 'helmet';
import * as compression from 'compression';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const winstonLogger = WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: isProduction
          ? winston.format.combine(
              winston.format.timestamp(),
              winston.format.json(),
            )
          : winston.format.combine(
              winston.format.colorize(),
              winston.format.timestamp({ format: 'HH:mm:ss' }),
              winston.format.printf(
                ({ timestamp, level, message, context }) =>
                  `${timestamp} [${context || 'App'}] ${level}: ${message}`,
              ),
            ),
      }),
    ],
  });

  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
    rawBody: true,
  });

  // Enable graceful shutdown hooks (SIGTERM, SIGINT)
  app.enableShutdownHooks();

  if (process.env.TRUST_PROXY === 'true') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }
  // Security middleware
  app.use(helmet(SecurityConfig.helmet));

  // Gzip compression
  app.use(compression());

  app.enableCors(SecurityConfig.cors);

  // Global validation pipe with strict validation
  app.useGlobalPipes(new GlobalValidationPipe());

  // Swagger documentation — disabled in production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('LabVerse API')
      .setDescription('LabVerse E-Commerce Platform API')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  winstonLogger.log(`Application is running on: http://localhost:${port}`);
  if (!isProduction) {
    winstonLogger.log(`Swagger docs available at: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
