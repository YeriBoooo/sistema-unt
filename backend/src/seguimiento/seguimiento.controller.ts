import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RegistrarHorasDto } from './dto/registrar-horas.dto';
import { EvaluarDto } from './dto/evaluar.dto';

@Controller('seguimiento')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeguimientoController {
  constructor(private readonly seguimientoService: SeguimientoService) {}

  @Get('postulacion/:postulacionId')
  async getByPostulacion(@Param('postulacionId') postulacionId: string) {
    return this.seguimientoService.getByPostulacion(parseInt(postulacionId));
  }

  @Post('postulacion/:postulacionId/horas')
  @Roles('estudiante')
  async registrarHorasEstudiante(
    @Param('postulacionId') postulacionId: string,
    @Body() registrarHorasDto: RegistrarHorasDto,
    @CurrentUser() user: any,
  ) {
    // Verificar que el estudiante sea el dueño de la postulación
    const estudiante = await this.seguimientoService.getEstudianteByUsuarioId(user.id);
    return this.seguimientoService.registrarHoras(
      parseInt(postulacionId),
      registrarHorasDto,
      true,
    );
  }

  @Post('postulacion/:postulacionId/horas-asesor')
  @Roles('asesor')
  async registrarHorasAsesor(
    @Param('postulacionId') postulacionId: string,
    @Body() registrarHorasDto: RegistrarHorasDto,
  ) {
    return this.seguimientoService.registrarHoras(
      parseInt(postulacionId),
      registrarHorasDto,
      false,
    );
  }

  @Post('postulacion/:postulacionId/evaluar')
  @Roles('asesor')
  async evaluar(
    @Param('postulacionId') postulacionId: string,
    @Body() evaluarDto: EvaluarDto,
  ) {
    return this.seguimientoService.evaluar(parseInt(postulacionId), evaluarDto);
  }

  @Post('postulacion/:postulacionId/finalizar')
  @Roles('asesor')
  async finalizarPractica(@Param('postulacionId') postulacionId: string) {
    return this.seguimientoService.finalizarPractica(parseInt(postulacionId));
  }
}