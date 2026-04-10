import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { AutomotorEntity } from '../../automotores/entities/automotor.entity';
import { TipoSujeto } from '../../config';

@Entity('sujetos')
export class SujetoEntity {
  @ApiProperty({ example: 1, description: 'ID único del sujeto' })
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ApiProperty({ example: '20123456789', description: 'CUIT de 11 dígitos (único)' })
  @Column({ type: 'varchar', length: 11, unique: true, nullable: false })
  cuit: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre o razón social' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  nombre: string;

  @ApiProperty({
    enum: TipoSujeto,
    example: TipoSujeto.PERSONA_FISICA,
    description: 'Tipo de sujeto',
  })
  @Column({ type: 'enum', enum: TipoSujeto, default: TipoSujeto.PERSONA_FISICA })
  tipo: TipoSujeto;

  @ApiHideProperty()
  @OneToMany(() => AutomotorEntity, (automotor) => automotor.sujeto, {
    cascade: ['insert', 'update'],
    eager: false,
    onDelete: 'CASCADE',
  })
  automotores: AutomotorEntity[];

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Fecha de creación' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z', description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;
}
