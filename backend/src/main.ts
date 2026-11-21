import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set explicit JSON and urlencoded body parser limits to safely handle image base64 payloads up to 10MB
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Configure CORS: support FRONTEND_URL if provided, else reflect requesting origin
  const frontendUrlEnv = process.env.FRONTEND_URL;
  const allowedOrigins = frontendUrlEnv
    ? frontendUrlEnv.split(',').map((origin) => origin.trim())
    : true;

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
}
bootstrap();
