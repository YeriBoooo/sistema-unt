import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [estudiantesEnPractica, tesisEnCurso, conveniosActivos, ofertasAbiertas] = await Promise.all([
      this.prisma.postulacion.count({ where: { estado: { in: ['aceptado', 'en_curso'] } } }),
      this.prisma.tesis.count({ where: { estado: { not: 'culminado' } } }),
      this.prisma.convenio.count({ where: { estado: 'vigente' } }),
      this.prisma.ofertaPractica.count({ where: { estado: 'abierta' } }),
    ]);
    return { estudiantesEnPractica, tesisEnCurso, conveniosActivos, ofertasAbiertas };
  }

  async getPracticasPorMes(year: number) {
    const start = new Date(`${year}-01-01`);
    const end = new Date(`${year}-12-31`);
    const result = await this.prisma.$queryRaw<any[]>`
      SELECT 
        EXTRACT(MONTH FROM fecha_postulacion) as mes,
        COUNT(*) as cantidad
      FROM postulacion
      WHERE fecha_postulacion BETWEEN ${start} AND ${end}
      GROUP BY mes
      ORDER BY mes
    `;
    return result.map(r => ({ mes: r.mes, cantidad: Number(r.cantidad) }));
  }

  async getTesisPorEstado() {
    const estados = await this.prisma.tesis.groupBy({
      by: ['estado'],
      _count: { id: true },
    });
    return estados.map(e => ({ estado: e.estado, cantidad: e._count.id }));
  }

  async getEstudianteDashboard(usuarioId: number) {
    // Obtener el estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { usuario_id: usuarioId },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Postulación activa
    const postulacionActiva = await this.prisma.postulacion.findFirst({
      where: { 
        estudiante_id: estudiante.id, 
        estado: { in: ['postulado', 'aceptado', 'en_curso'] } 
      },
      include: { 
        oferta: { 
          include: { empresa: true } 
        },
        seguimiento: true
      },
      orderBy: { created_at: 'desc' },
    });

    // Horas de práctica
    let horasPractica = { cumplidas: 0, totales: 300 };
    
    if (postulacionActiva?.seguimiento) {
      horasPractica = {
        cumplidas: postulacionActiva.seguimiento.horas_cumplidas || 0,
        totales: postulacionActiva.seguimiento.horas_totales || 300,
      };
    } else {
      const seguimiento = await this.prisma.seguimientoPractica.findFirst({
        where: { postulacion: { estudiante_id: estudiante.id } },
      });
      if (seguimiento) {
        horasPractica = {
          cumplidas: seguimiento.horas_cumplidas || 0,
          totales: seguimiento.horas_totales || 300,
        };
      }
    }

    // Tesis activa
    const tesisActiva = await this.prisma.tesis.findFirst({
      where: { 
        estudiante_id: estudiante.id, 
        estado: { not: 'culminado' } 
      },
      orderBy: { created_at: 'desc' },
    });

    // Próximos avances
    const proximosAvances = await this.prisma.avanceTesis.findMany({
      where: { 
        tesis: { estudiante_id: estudiante.id }, 
        fecha_entrega: { gte: new Date() },
        estado: { not: 'aprobado' }
      },
      orderBy: { fecha_entrega: 'asc' },
      take: 5,
    });

    return {
      postulacionActiva,
      horasPractica,
      tesisActiva,
      proximosAvances,
    };
  }
}