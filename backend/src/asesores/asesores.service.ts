import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AsesoresService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.asesor.findMany({
        skip,
        take: limit,
        include: { usuario: true, escuela: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.asesor.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const asesor = await this.prisma.asesor.findUnique({
      where: { id },
      include: { usuario: true, escuela: true },
    });
    if (!asesor) throw new NotFoundException('Asesor no encontrado');
    return asesor;
  }

  async findByUsuarioId(usuarioId: number) {
    return this.prisma.asesor.findUnique({
      where: { usuario_id: usuarioId },
      include: { usuario: true, escuela: true },
    });
  }
async findByEstudiante(estudianteId: number) {
  return this.prisma.tesis.findMany({
    where: { estudiante_id: estudianteId },
    include: {
      asesor_principal: { include: { usuario: true } },
      jurados: { include: { asesor: { include: { usuario: true } } } },
      avances: true,
      acta: true,
    },
    orderBy: { created_at: 'desc' },
  });
}

async getEstudianteByUsuarioId(usuarioId: number) {
  const estudiante = await this.prisma.estudiante.findUnique({
    where: { usuario_id: usuarioId },
  });
  if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
  return estudiante;
}
  async findAllDisponibles() {
    return this.prisma.asesor.findMany({
      include: { usuario: true, escuela: true },
    });
  }
}