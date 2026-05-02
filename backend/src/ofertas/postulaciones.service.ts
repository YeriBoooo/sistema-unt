import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EstadoPostulacion } from '@prisma/client';

@Injectable()
export class PostulacionesService {
  constructor(private prisma: PrismaService) {}

  async findAllByEstudiante(estudianteId: number) {
    return this.prisma.postulacion.findMany({
      where: { estudiante_id: estudianteId },
      include: { 
        oferta: { 
          include: { empresa: true } 
        }, 
        seguimiento: true 
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findAllByAsesor(asesorId: number) {
    return this.prisma.postulacion.findMany({
      where: { asesor_academico_id: asesorId },
      include: { 
        estudiante: { 
          include: { usuario: true } 
        }, 
        oferta: { 
          include: { empresa: true } 
        }, 
        seguimiento: true 
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async updateEstado(id: number, estado: EstadoPostulacion) {
    const postulacion = await this.prisma.postulacion.findUnique({ where: { id } });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    return this.prisma.postulacion.update({
      where: { id },
      data: { estado },
    });
  }
}