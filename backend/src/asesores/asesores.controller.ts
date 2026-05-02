import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { AsesoresService } from './asesores.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('asesores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsesoresController {
  constructor(private readonly asesoresService: AsesoresService) {}

  @Get()
  @Roles('admin', 'coordinador')
  findAll(@Query('page') page = '1', @Query('limit') limit = '10') {
    return this.asesoresService.findAll(parseInt(page), parseInt(limit));
  }

  // ✅ CORREGIDO: Permitir acceso a estudiantes también
  @Get('disponibles')
  @Roles('admin', 'coordinador', 'estudiante')  // 👈 Agrega 'estudiante' aquí
  findAllDisponibles() {
    return this.asesoresService.findAllDisponibles();
  }

  @Get(':id')
  @Roles('admin', 'coordinador')
  findOne(@Param('id') id: string) {
    return this.asesoresService.findOne(parseInt(id));
  }
}