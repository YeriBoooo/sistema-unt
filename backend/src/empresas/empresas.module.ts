import { Module } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { ConveniosService } from './convenios.service';
import { EmpresasController } from './empresas.controller';

@Module({
  controllers: [EmpresasController],
  providers: [EmpresasService, ConveniosService],
  exports: [EmpresasService, ConveniosService],
})
export class EmpresasModule {}