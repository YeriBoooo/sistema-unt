import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { OfertasService } from './ofertas.service';
import { PostulacionesService } from './postulaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('ofertas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OfertasController {
  constructor(
    private readonly ofertasService: OfertasService,
    private readonly postulacionesService: PostulacionesService,
  ) {}

  @Post()
  @Roles('admin', 'coordinador', 'empresa')
  create(@Body() createOfertaDto: any) {
    return this.ofertasService.create(createOfertaDto);
  }

  @Get()
  async findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.ofertasService.findAll(parseInt(page), parseInt(limit));
  }

  @Get('mis-postulaciones')
  @Roles('estudiante')
  async misPostulaciones(@CurrentUser() user: any) {
    const estudiante = await this.ofertasService.getEstudianteByUsuarioId(user.id);
    return this.postulacionesService.findAllByEstudiante(estudiante.id);
  }

  @Get('postulaciones/asesor')
  @Roles('asesor')
  async postulacionesAsesor(@CurrentUser() user: any) {
    const asesor = await this.ofertasService.getAsesorByUsuarioId(user.id);
    return this.postulacionesService.findAllByAsesor(asesor.id);
  }

  @Get(':id/postulaciones')
  @Roles('admin', 'coordinador')
  async getPostulacionesByOferta(@Param('id') id: string) {
    return this.ofertasService.getPostulacionesByOferta(parseInt(id));
  }

  @Get(':id/mi-postulacion')
  @Roles('estudiante')
  async miPostulacion(@Param('id') id: string, @CurrentUser() user: any) {
    const estudiante = await this.ofertasService.getEstudianteByUsuarioId(user.id);
    return this.ofertasService.findPostulacionByOfertaAndEstudiante(parseInt(id), estudiante.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ofertasService.findOne(parseInt(id));
  }

  @Post(':id/postular')
  @Roles('estudiante')
  async postular(@Param('id') id: string, @CurrentUser() user: any) {
    const estudiante = await this.ofertasService.getEstudianteByUsuarioId(user.id);
    return this.ofertasService.postular(parseInt(id), estudiante.id);
  }

  @Patch(':id')
  @Roles('admin', 'coordinador')
  update(@Param('id') id: string, @Body() updateOfertaDto: any) {
    return this.ofertasService.update(parseInt(id), updateOfertaDto);
  }

  @Delete(':id')
  @Roles('admin', 'coordinador')
  remove(@Param('id') id: string) {
    return this.ofertasService.remove(parseInt(id));
  }

  @Patch('postulaciones/:postulacionId/estado')
  @Roles('admin', 'coordinador', 'asesor')
  async updateEstadoPostulacion(
    @Param('postulacionId') postulacionId: string,
    @Body('estado') estado: string,
  ) {
    return this.postulacionesService.updateEstado(parseInt(postulacionId), estado as any);
  }

  @Patch('postulaciones/:postulacionId/asesor')
  @Roles('admin', 'coordinador')
  async asignarAsesor(
    @Param('postulacionId') postulacionId: string,
    @Body('asesor_id') asesorId: number,
  ) {
    return this.ofertasService.asignarAsesor(parseInt(postulacionId), asesorId);
  }
}