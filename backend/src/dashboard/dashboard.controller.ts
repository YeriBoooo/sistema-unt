import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @Roles('admin', 'coordinador')
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('practicas-por-mes')
  @Roles('admin', 'coordinador')
  async getPracticasPorMes(@Query('year') year?: string) {
    const yearNumber = year ? parseInt(year) : new Date().getFullYear();
    return this.dashboardService.getPracticasPorMes(yearNumber);
  }

  @Get('tesis-por-estado')
  @Roles('admin', 'coordinador')
  async getTesisPorEstado() {
    return this.dashboardService.getTesisPorEstado();
  }

  @Get('estudiante')
  @Roles('estudiante')
  async getEstudianteDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getEstudianteDashboard(user.id);
  }
}