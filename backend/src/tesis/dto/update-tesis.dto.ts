import { PartialType } from '@nestjs/mapped-types';
import { CreateTesisDto } from './create-tesis.dto';
import { IsIn, IsDateString, IsOptional } from 'class-validator';

export class UpdateTesisDto extends PartialType(CreateTesisDto) {
  @IsOptional()
  @IsIn(['propuesta', 'desarrollo', 'sustentacion', 'culminado'])
  estado?: 'propuesta' | 'desarrollo' | 'sustentacion' | 'culminado';

  @IsOptional()
  @IsDateString()
  fecha_sustentacion?: string;
}