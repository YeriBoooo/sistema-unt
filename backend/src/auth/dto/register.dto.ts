import { IsEmail, IsString, MinLength, IsOptional, IsIn, IsInt } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsString()
  @IsIn(['admin', 'coordinador', 'asesor', 'estudiante', 'empresa'])
  rol: string;

  @IsOptional()
  codigo_universitario?: string;

  @IsOptional()
  @IsInt()
  escuela_id?: number;

  @IsOptional()
  ciclo?: string;

  @IsOptional()
  especialidad?: string;
}