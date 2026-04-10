import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getDatabaseConfig } from './config/database.config';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { SujetosModule } from './sujetos/sujetos.module';
import { AutomotolesModule } from './automotores/automotores.module';

/**
 * Módulo raíz de la aplicación
 *
 * Configura:
 * 1. Variables de entorno (.env)
 * 2. Conexión a PostgreSQL (TypeORM)
 * 3. Pipes globales (validación de DTOs)
 * 4. Filtros globales (manejo de excepciones)
 * 5. Módulos de features (Sujetos, Automotores)
 *
 * Flujo de request:
 * 1. Request llega
 * 2. ValidationPipe valida DTO → si error, lanza BadRequestException
 * 3. ValidationExceptionFilter captura → devuelve 422 con fieldErrors
 * 4. Si pasa validación, llega al controlador
 * 5. Controlador delega al servicio
 * 6. Servicio accede a DB a través de TypeORM
 * 7. Response se devuelve al cliente
 */
@Module({
  imports: [
    /**
     * ConfigModule: Lee variables de .env
     * Ejemplo: process.env.DB_HOST, DB_PORT, DB_USERNAME, etc.
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    /**
     * TypeOrmModule: Conexión a PostgreSQL
     * getDatabaseConfig() lee del .env y retorna opciones TypeORM
     */
    TypeOrmModule.forRoot(getDatabaseConfig()),

    /**
     * Feature modules
     */
    SujetosModule,
    AutomotolesModule,
  ],

  controllers: [AppController],

  /**
   * Pipes globales: se ejecutan antes de cada request
   *
   * ValidationPipe:
   * - Valida DTOs automáticamente (class-validator)
   * - Si hay error, lanza BadRequestException
   * - whitelist: true → elimina propiedades no declaradas en DTO
   * - forbidNonWhitelisted: true → error si envían propiedad extra
   * - transform: true → convierte tipos (string '10' → number 10)
   */
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },

    /**
     * Filtros globales: capturan excepciones después de que ocurren
     *
     * ValidationExceptionFilter:
     * - Captura BadRequestException (errores de validación)
     * - Mapea a respuesta 422 con fieldErrors
     * - Coincide con el contrato del CLAUDE.md
     */
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
