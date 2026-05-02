import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('postulaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostulacionesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles('admin', 'coordinador')
  async findAll(@Query('estado') estado?: string) {
    const where: any = {};
    if (estado && estado !== 'todos') {
      where.estado = estado;
    }
    
    const data = await this.prisma.postulacion.findMany({
      where,
      include: {
        estudiante: {
          include: { usuario: true }
        },
        oferta: {
          include: { empresa: true }
        }
      },
      orderBy: { created_at: 'desc' },
    });
    
    return { data };
  }
}