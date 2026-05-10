import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EmpresasService } from './empresas.service';
import { ConveniosService } from './convenios.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('empresas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EmpresasController {
  constructor(
    private readonly empresasService: EmpresasService,
    private readonly conveniosService: ConveniosService,
  ) {}

  @Get()
  @Roles('admin', 'coordinador', 'secretaria')
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.empresasService.findAll(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @Roles('admin', 'coordinador', 'secretaria')
  findOne(@Param('id') id: string) {
    return this.empresasService.findOne(parseInt(id));
  }

  @Post()
  @Roles('admin', 'coordinador')
  create(@Body() createEmpresaDto: any) {
    return this.empresasService.create(createEmpresaDto);
  }

  @Patch(':id')
  @Roles('admin', 'coordinador')
  update(@Param('id') id: string, @Body() updateEmpresaDto: any) {
    return this.empresasService.update(parseInt(id), updateEmpresaDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.empresasService.remove(parseInt(id));
  }

  // Convenios
  @Get(':id/convenios')
  @Roles('admin', 'coordinador', 'secretaria')
  getConvenios(@Param('id') id: string) {
    return this.conveniosService.findByEmpresa(parseInt(id));
  }

  @Post(':id/convenios')
  @Roles('admin', 'coordinador')
  createConvenio(@Param('id') id: string, @Body() createConvenioDto: any) {
    return this.conveniosService.create({ ...createConvenioDto, empresa_id: parseInt(id) });
  }

  @Patch('convenios/:convenioId')
  @Roles('admin', 'coordinador')
  updateConvenio(@Param('convenioId') convenioId: string, @Body() updateConvenioDto: any) {
    return this.conveniosService.update(parseInt(convenioId), updateConvenioDto);
  }

  @Delete('convenios/:convenioId')
  @Roles('admin')
  removeConvenio(@Param('convenioId') convenioId: string) {
    return this.conveniosService.remove(parseInt(convenioId));
  }
}