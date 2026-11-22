import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { getCorsOrigins } from './config/cors.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CalTrack does not need proxy-derived client IPs. Keeping this disabled also
  // prevents forwarded-address spoofing from influencing application policy.
  app.getHttpAdapter().getInstance().set('trust proxy', false);

  app.use((request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    response.setHeader('Cache-Control', 'no-store');
    const contentEncoding = request.headers['content-encoding'];
    if (contentEncoding && contentEncoding.toLowerCase() !== 'identity') {
      response.status(415).json({
        statusCode: 415,
        message: 'Compressed request bodies are not supported',
        error: 'Unsupported Media Type',
      });
      return;
    }
    next();
  });

  // The largest supported request is the bounded base64 image endpoint.
  app.use(json({ limit: '8mb' }));
  app.use(urlencoded({ extended: false, limit: '8mb' }));

  // Configure CORS: enforce strict origin validation in production
  const allowedOrigins = getCorsOrigins();

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();
