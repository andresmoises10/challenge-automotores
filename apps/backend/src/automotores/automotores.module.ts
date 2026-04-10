import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AutomotorEntity } from './entities/automotor.entity';
import { AutomotolesService } from './automotores.service';
import { AutomotolesController } from './automotores.controller';
import { SujetosModule } from '../sujetos/sujetos.module';

/**
 * Módulo de Automotores
 *
 * Agrupa:
 * - Entidad (AutomotorEntity)
 * - Servicio (AutomotolesService)
 * - Controlador (AutomotolesController)
 *
 * Imports:
 * - SujetosModule → para acceder a SujetosService
 *   (necesario para validar que CUIT existe)
 *
 * Providers:
 * - AutomotolesService → inyectable en el controlador
 *
 * Exports:
 * - AutomotolesService → disponible en otros módulos (si es necesario)
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([AutomotorEntity]),
    SujetosModule, // ← Importa SujetosModule para usar SujetosService
  ],
  controllers: [AutomotolesController],
  providers: [AutomotolesService],
  exports: [AutomotolesService], // ← Opcional: otros módulos pueden usarlo
})
export class AutomotolesModule {}
