import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Función principal: bootstrapea la aplicación NestJS
 *
 * Configuración:
 * 1. Crea instancia de NestJS
 * 2. Configura prefijo global de API
 * 3. Configura Swagger (documentación automática)
 * 4. Inicia servidor en puerto 3030
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  // ============ SWAGGER CONFIGURATION ============

  /**
   * Configuración de Swagger
   * Documenta automáticamente los endpoints
   *
   * Acceso: http://localhost:3030/api/docs
   */
  const config = new DocumentBuilder()
    .setTitle('Automotores API')
    .setDescription(
      'API para gestión de sujetos (propietarios) y automotores (vehículos). ' +
        'Incluye validación de CUIT, dominio, chasis, motor y fecha de fabricación.',
    )
    .setVersion('1.0.0')
    .addTag('Sujetos', 'Endpoints para gestión de personas físicas y jurídicas')
    .addTag(
      'Automotores',
      'Endpoints para gestión de vehículos y sus propietarios',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // ============ SERVER START ============

  const port = process.env.PORT || 3030;
  await app.listen(port);

  console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║           🚗 AUTOMOTORES API INICIADO 🚗              ║
    ║                                                        ║
    ║   Servidor corriendo en: http://localhost:${port}       ║
    ║   Swagger docs: http://localhost:${port}/api/docs      ║
    ║                                                        ║
    ║   Endpoints:                                           ║
    ║   - GET/POST   /api/sujetos                            ║
    ║   - GET        /api/sujetos/by-cuit?cuit=...          ║
    ║   - GET/POST/PUT/DELETE /api/automotores              ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap().catch((error) => {
  console.error('Error iniciando aplicación:', error);
  process.exit(1);
});
