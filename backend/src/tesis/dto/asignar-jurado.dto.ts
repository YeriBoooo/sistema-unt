import { IsInt, IsIn } from 'class-validator';

export class AsignarJuradoDto {
  @IsInt()
  asesor_id: number;

  @IsIn(['presidente', 'secretario', 'vocal'])
  rol: string;
}