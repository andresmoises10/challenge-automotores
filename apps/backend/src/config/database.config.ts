import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SujetoEntity } from '../sujetos/entities/sujeto.entity';
import { AutomotorEntity } from '../automotores/entities/automotor.entity';

/**
 * Configuración de TypeORM para PostgreSQL 16
 *
 * En desarrollo (NODE_ENV=development):
 * - synchronize: true → crea/sincroniza automáticamente las tablas
 * - logging: true → muestra las queries SQL en consola
 *
 * En producción (NODE_ENV=production):
 * - synchronize: false → requiere migraciones explícitas
 * - logging: false → sin queries en consola
 */
export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'automotores_db',

    // Entidades → TypeORM las escanea automáticamente
    entities: [SujetoEntity, AutomotorEntity],

    // En dev: crea tablas automáticamente. En prod: usa migraciones.
    synchronize: !isProduction,

    // Logging: muestra las queries SQL (útil en desarrollo)
    logging: !isProduction,

    // Timezone (Argentina)
    extra: {
      timezone: 'America/Argentina/Cordoba',
    },
  };
};
