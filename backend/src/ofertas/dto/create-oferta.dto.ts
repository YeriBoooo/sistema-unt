import { IsString, IsInt, IsDateString, IsIn, IsOptional } from 'class-validator';

export class CreateOfertaDto {
  @IsInt()
  empresa_id: number;

  @IsString()
  titulo: string;

  @IsString()
  descripcion: string;

  @IsOptional()
  @IsString()
  requisitos?: string;

  @IsDateString()
  fecha_inicio: string;

  @IsDateString()
  fecha_fin: string;

  @IsInt()
  vacantes: number;

  @IsIn(['presencial', 'remota', 'hibrida'])
  modalidad: string;
}