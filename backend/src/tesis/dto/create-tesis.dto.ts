import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreateTesisDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  resumen?: string;

  @IsInt()
  asesor_principal_id: number;
}