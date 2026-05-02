import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';

export class RegistrarHorasDto {
  @IsInt()
  @Min(0)
  @Max(1000)
  horas_cumplidas: number;

  @IsOptional()
  @IsString()
  informe?: string;
}