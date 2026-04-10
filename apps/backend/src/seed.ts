import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SujetoEntity } from './sujetos/entities/sujeto.entity';
import { AutomotorEntity } from './automotores/entities/automotor.entity';
import { TipoSujeto } from './config/constants';
import * as dotenv from 'dotenv';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5433'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'automotores_db',
  entities: [SujetoEntity, AutomotorEntity],
  synchronize: true,
  logging: false,
});

const SUJETOS = [
  { cuit: '20123456786', nombre: 'Juan Pérez',        tipo: TipoSujeto.PERSONA_FISICA    },
  { cuit: '27304567894', nombre: 'María García',       tipo: TipoSujeto.PERSONA_FISICA    },
  { cuit: '30678901233', nombre: 'Carlos López',        tipo: TipoSujeto.PERSONA_FISICA    },
];

const AUTOMOTORES = [
  { dominio: 'ABC123', chasis: 'CHS001ABC123', motor: 'MOT001DEF456', color: 'Blanco',   fechaFabricacion: '202001', cuit: '20123456786' },
  { dominio: 'DE456FG', chasis: 'CHS002DEF456', motor: 'MOT002GHI789', color: 'Negro',    fechaFabricacion: '201905', cuit: '27304567894' },
  { dominio: 'XYZ789', chasis: 'CHS003XYZ789', motor: 'MOT003JKL012', color: 'Rojo',     fechaFabricacion: '202205', cuit: '30678901233' },
];

async function seed() {
  await dataSource.initialize();
  console.log('✅ Conectado a la base de datos');

  const sujetoRepo    = dataSource.getRepository(SujetoEntity);
  const automotorRepo = dataSource.getRepository(AutomotorEntity);

  // ── Sujetos ──────────────────────────────────────────────────────────────
  console.log('\n📋 Creando sujetos...');
  const sujetoMap: Record<string, SujetoEntity> = {};

  for (const data of SUJETOS) {
    const existing = await sujetoRepo.findOneBy({ cuit: data.cuit });
    if (existing) {
      console.log(`  ⏭  Sujeto ${data.cuit} ya existe, se omite`);
      sujetoMap[data.cuit] = existing;
      continue;
    }
    const sujeto = sujetoRepo.create(data);
    const saved  = await sujetoRepo.save(sujeto);
    sujetoMap[data.cuit] = saved;
    console.log(`  ✅ ${data.nombre} (${data.cuit})`);
  }

  // ── Automotores ───────────────────────────────────────────────────────────
  console.log('\n🚗 Creando automotores...');

  for (const data of AUTOMOTORES) {
    const existing = await automotorRepo.findOneBy({ dominio: data.dominio });
    if (existing) {
      console.log(`  ⏭  Automotor ${data.dominio} ya existe, se omite`);
      continue;
    }
    const sujeto = sujetoMap[data.cuit];
    if (!sujeto) {
      console.warn(`  ⚠️  No se encontró sujeto con CUIT ${data.cuit}, se omite ${data.dominio}`);
      continue;
    }
    const automotor = automotorRepo.create({
      dominio:          data.dominio,
      chasis:           data.chasis,
      motor:            data.motor,
      color:            data.color,
      fechaFabricacion: data.fechaFabricacion,
      sujeto_id:        sujeto.id,
    });
    await automotorRepo.save(automotor);
    console.log(`  ✅ ${data.dominio} — ${data.color} (propietario: ${sujeto.nombre})`);
  }

  await dataSource.destroy();
  console.log('\n🎉 Seed completado\n');
}

seed().catch((err) => {
  console.error('❌ Error en el seed:', err);
  process.exit(1);
});
