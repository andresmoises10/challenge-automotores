import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TipoSujeto, VALIDATION_MESSAGES } from '../../config';
import { IsCUIT } from '../../common/decorators/validation.decorator';

export class CreateSujetoDto {
  @ApiProperty({
    example: '20123456789',
    description: 'CUIT de 11 dígitos. Validación módulo 11 (AFIP).',
  })
  @IsCUIT()
  cuit: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo o razón social (3-255 caracteres)',
    minLength: 3,
    maxLength: 255,
  })
  @IsString({ message: 'Nombre debe ser un string' })
  @MinLength(3, { message: 'Nombre debe tener mínimo 3 caracteres' })
  @MaxLength(255, { message: 'Nombre debe tener máximo 255 caracteres' })
  nombre: string;

  @ApiProperty({
    enum: TipoSujeto,
    example: TipoSujeto.PERSONA_FISICA,
    description: 'Tipo de sujeto: PERSONA_FISICA o PERSONA_JURIDICA',
  })
  @IsEnum(TipoSujeto, { message: VALIDATION_MESSAGES.TIPO_SUJETO_INVALID })
  tipo: TipoSujeto;
}
