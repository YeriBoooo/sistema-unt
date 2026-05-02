import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateEstudianteDto {
  @IsInt()
  usuario_id: number;

  @IsString()
  codigo_universitario: string;

  @IsInt()
  escuela_id: number;

  @IsOptional()
  @IsString()
  ciclo?: string;

  @IsOptional()
  @IsString()
  resolucion_practicas?: string;
}