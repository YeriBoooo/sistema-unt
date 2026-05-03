import { PartialType } from '@nestjs/mapped-types';
import { CreateEstudianteDto } from './create-estudiante.dto';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateUsuarioDto {
  @IsOptional()
  nombres?: string;

  @IsOptional()
  apellidos?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  dni?: string;

  @IsOptional()
  telefono?: string;

  @IsOptional()
  password?: string; // ✅ Opcional
}

export class UpdateEstudianteDto {
  @IsOptional()
  codigo_universitario?: string;

  @IsOptional()
  ciclo?: string;

  @IsOptional()
  escuela_id?: number;

  @IsOptional()
  resolucion_practicas?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateUsuarioDto)
  usuario?: UpdateUsuarioDto;
}