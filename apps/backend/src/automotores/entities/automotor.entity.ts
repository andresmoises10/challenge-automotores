import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SujetoEntity } from '../../sujetos/entities/sujeto.entity';

@Entity('automotores')
@Index('idx_dominio', ['dominio'], { unique: true })
@Index('idx_chasis', ['chasis'], { unique: true })
@Index('idx_motor', ['motor'], { unique: true })
@Index('idx_sujeto_id', ['sujeto_id'])
export class AutomotorEntity {
  @ApiProperty({ example: 1, description: 'ID único del automotor' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ example: 'ABC123', description: 'Dominio del vehículo (AAA999 o AA999AA)' })
  @Column({ type: 'varchar', length: 7, unique: true, nullable: false })
  dominio: string;

  @ApiProperty({ example: 'ABC123XYZ456789', description: 'Número de chasis (único, 6-20 caracteres)' })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  chasis: string;

  @ApiProperty({ example: 'DEF456XYZ789012', description: 'Número de motor (único, 6-20 caracteres)' })
  @Column({ type: 'varchar', length: 20, unique: true, nullable: false })
  motor: string;

  @ApiProperty({ example: 'Blanco', description: 'Color del vehículo' })
  @Column({ type: 'varchar', length: 50, nullable: false })
  color: string;

  @ApiProperty({ example: '202401', description: 'Fecha de fabricación formato YYYYMM (no futura)' })
  @Column({ type: 'varchar', length: 6, nullable: false })
  fechaFabricacion: string;

  @ApiProperty({ example: 1, description: 'ID del sujeto propietario (FK)' })
  @Column({ type: 'integer', nullable: false })
  sujeto_id: number;

  @ApiPropertyOptional({ type: () => SujetoEntity, description: 'Sujeto propietario (incluido en listados)' })
  @ManyToOne(() => SujetoEntity, (sujeto) => sujeto.automotores, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'sujeto_id' })
  sujeto: SujetoEntity;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Fecha de creación' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;
}
