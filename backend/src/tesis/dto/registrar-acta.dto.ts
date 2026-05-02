import { IsDateString, IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class RegistrarActaDto {
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  lugar?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(20)
  nota_final?: number;
}