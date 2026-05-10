import { Controller, Post, Body, UseGuards, Res } from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import type { Response } from 'express';

@Controller('reportes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Post('practicas')
  @Roles('admin', 'coordinador', 'secretaria')
  async generarPracticas(@Body() filtros: any, @Res() res: Response) {
    const pdf = await this.reportesService.generarReportePracticas(filtros);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte_practicas.pdf',
    });
    res.send(pdf);
  }

  @Post('tesis')
  @Roles('admin', 'coordinador', 'secretaria')
  async generarTesis(@Body() filtros: any, @Res() res: Response) {
    const pdf = await this.reportesService.generarReporteTesis(filtros);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte_tesis.pdf',
    });
    res.send(pdf);
  }

  @Post('convenios')
  @Roles('admin', 'coordinador', 'secretaria')
  async generarConvenios(@Body() filtros: any, @Res() res: Response) {
    const pdf = await this.reportesService.generarReporteConvenios(filtros);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=reporte_convenios.pdf',
    });
    res.send(pdf);
  }
}