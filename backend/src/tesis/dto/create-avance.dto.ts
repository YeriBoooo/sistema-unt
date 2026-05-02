import { IsString, IsIn, IsDateString, IsOptional } from 'class-validator';

export class CreateAvanceDto {
  @IsIn(['capitulo', 'articulo', 'informe'])
  tipo: string;

  @IsString()
  descripcion: string;

  @IsDateString()
  fecha_entrega: string;

  @IsOptional()
  @IsString()
  archivo_url?: string;
}