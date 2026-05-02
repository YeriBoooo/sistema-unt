import { IsString, IsOptional, IsIn } from 'class-validator';

export class RevisarAvanceDto {
  @IsIn(['entregado', 'revisado', 'observado', 'aprobado'])
  estado: string;

  @IsOptional()
  @IsString()
  observaciones?: string;
}