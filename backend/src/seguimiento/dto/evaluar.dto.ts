import { IsIn } from 'class-validator';

export class EvaluarDto {
  @IsIn(['aprobado', 'desaprobado', 'pendiente'])
  evaluacion: string;
}