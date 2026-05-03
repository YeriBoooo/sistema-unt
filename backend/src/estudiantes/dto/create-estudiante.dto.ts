import { IsInt, IsOptional, IsString, IsEmail, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class UsuarioDto {
  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsString()
  telefono?: string;
}

export class CreateEstudianteDto {
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

  @ValidateNested()
  @Type(() => UsuarioDto)
  usuario: UsuarioDto;
}