import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { EstudiantesService } from './estudiantes.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('estudiantes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstudiantesController {
  constructor(private readonly estudiantesService: EstudiantesService) {}

  @Post()
  @Roles('admin')
  create(@Body() createEstudianteDto: CreateEstudianteDto) {
    return this.estudiantesService.create(createEstudianteDto);
  }

  @Get()
  @Roles('admin', 'coordinador')
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.estudiantesService.findAll(parseInt(page), parseInt(limit));
  }

  @Get(':id')
  @Roles('admin', 'coordinador', 'asesor')
  findOne(@Param('id') id: string) {
    return this.estudiantesService.findOne(parseInt(id));
  }

  @Patch(':id')
  @Roles('admin', 'coordinador')  // ✅ Permitir también a coordinadores
  update(@Param('id') id: string, @Body() updateEstudianteDto: UpdateEstudianteDto) {
    return this.estudiantesService.update(parseInt(id), updateEstudianteDto);
  }

  @Delete(':id')
  @Roles('admin')  // ✅ Solo admin puede eliminar
  remove(@Param('id') id: string) {
    return this.estudiantesService.remove(parseInt(id));
  }
}