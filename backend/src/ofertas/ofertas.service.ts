import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { UpdateOfertaDto } from './dto/update-oferta.dto';
import { EstadoPostulacion } from '@prisma/client';

@Injectable()
export class OfertasService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.ofertaPractica.findMany({
        skip,
        take: limit,
        include: { empresa: true },
        where: filters,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.ofertaPractica.count({ where: filters }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const oferta = await this.prisma.ofertaPractica.findUnique({
      where: { id },
      include: { empresa: true, postulaciones: { include: { estudiante: { include: { usuario: true } } } } },
    });
    if (!oferta) throw new NotFoundException('Oferta no encontrada');
    return oferta;
  }

  async create(createDto: CreateOfertaDto) {
    return this.prisma.ofertaPractica.create({
      data: {
        empresa_id: createDto.empresa_id,
        titulo: createDto.titulo,
        descripcion: createDto.descripcion,
        requisitos: createDto.requisitos,
        fecha_inicio: new Date(createDto.fecha_inicio),
        fecha_fin: new Date(createDto.fecha_fin),
        vacantes: createDto.vacantes,
        modalidad: createDto.modalidad,
        estado: 'abierta',
      },
      include: { empresa: true },
    });
  }

  async update(id: number, updateDto: UpdateOfertaDto) {
    await this.findOne(id);
    return this.prisma.ofertaPractica.update({
      where: { id },
      data: updateDto,
      include: { empresa: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.ofertaPractica.delete({ where: { id } });
  }

  async postular(ofertaId: number, estudianteId: number) {
    const oferta = await this.prisma.ofertaPractica.findUnique({ where: { id: ofertaId } });
    if (!oferta || oferta.estado !== 'abierta') throw new BadRequestException('Oferta no disponible');
    
    const existing = await this.prisma.postulacion.findFirst({
      where: { 
        estudiante_id: estudianteId, 
        estado: { in: [EstadoPostulacion.postulado, EstadoPostulacion.aceptado, EstadoPostulacion.en_curso] } 
      },
    });
    if (existing) throw new BadRequestException('Ya tienes una postulación activa');
    
    return this.prisma.postulacion.create({
      data: {
        oferta_id: ofertaId,
        estudiante_id: estudianteId,
        estado: EstadoPostulacion.postulado,
      },
    });
  }

  async asignarAsesor(postulacionId: number, asesorId: number) {
    const postulacion = await this.prisma.postulacion.findUnique({ where: { id: postulacionId } });
    if (!postulacion) throw new NotFoundException('Postulación no encontrada');
    
    return this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: { asesor_academico_id: asesorId, estado: EstadoPostulacion.aceptado },
    });
  }

  async findPostulacionByOfertaAndEstudiante(ofertaId: number, estudianteId: number) {
    const postulacion = await this.prisma.postulacion.findFirst({
      where: { 
        oferta_id: ofertaId, 
        estudiante_id: estudianteId 
      },
      include: { seguimiento: true },
    });
    return postulacion;
  }

  async getEstudianteByUsuarioId(usuarioId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  async getAsesorByUsuarioId(usuarioId: number) {
    const asesor = await this.prisma.asesor.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!asesor) throw new NotFoundException('Asesor no encontrado');
    return asesor;
  }

  // ✅ NUEVO MÉTODO: Obtener postulaciones por oferta
  async getPostulacionesByOferta(ofertaId: number) {
    const postulaciones = await this.prisma.postulacion.findMany({
      where: { oferta_id: ofertaId },
      include: {
        estudiante: {
          include: {
            usuario: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    return postulaciones;
  }
}