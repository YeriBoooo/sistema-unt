import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvanceDto } from './dto/create-avance.dto';
import { RevisarAvanceDto } from './dto/revisar-avance.dto';

@Injectable()
export class AvancesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.avanceTesis.findMany({
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(avanceId: number) {
    const avance = await this.prisma.avanceTesis.findUnique({
      where: { id: avanceId },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
            asesor_principal: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
    if (!avance) throw new NotFoundException('Avance no encontrado');
    return avance;
  }

  async findByTesis(tesisId: number) {
    return this.prisma.avanceTesis.findMany({
      where: { tesis_id: tesisId },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
      orderBy: { fecha_entrega: 'desc' },
    });
  }

  async create(tesisId: number, dto: CreateAvanceDto) {
    const tesis = await this.prisma.tesis.findUnique({
      where: { id: tesisId },
      include: {
        estudiante: {
          include: {
            usuario: true,
          },
        },
      },
    });
    if (!tesis) throw new NotFoundException('Tesis no encontrada');
    
    return this.prisma.avanceTesis.create({
      data: {
        tesis_id: tesisId,
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        fecha_entrega: new Date(dto.fecha_entrega),
        estado: 'entregado',
      },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
  }

  async createWithFile(tesisId: number, data: { tipo: string; descripcion: string; fecha_entrega: Date; archivo_url?: string }) {
    const tesis = await this.prisma.tesis.findUnique({
      where: { id: tesisId },
    });
    if (!tesis) throw new NotFoundException('Tesis no encontrada');
    
    return this.prisma.avanceTesis.create({
      data: {
        tesis_id: tesisId,
        tipo: data.tipo,
        descripcion: data.descripcion,
        fecha_entrega: data.fecha_entrega,
        archivo_url: data.archivo_url,
        estado: 'entregado',
      },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
  }

  async revisar(avanceId: number, dto: RevisarAvanceDto) {
    const avance = await this.prisma.avanceTesis.findUnique({
      where: { id: avanceId },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
    if (!avance) throw new NotFoundException('Avance no encontrado');
    
    return this.prisma.avanceTesis.update({
      where: { id: avanceId },
      data: {
        estado: dto.estado,
        observaciones: dto.observaciones,
      },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
  }

  async update(avanceId: number, dto: Partial<CreateAvanceDto>) {
    const avance = await this.prisma.avanceTesis.findUnique({
      where: { id: avanceId },
    });
    if (!avance) throw new NotFoundException('Avance no encontrado');
    
    return this.prisma.avanceTesis.update({
      where: { id: avanceId },
      data: {
        tipo: dto.tipo,
        descripcion: dto.descripcion,
        fecha_entrega: dto.fecha_entrega ? new Date(dto.fecha_entrega) : undefined,
      },
      include: {
        tesis: {
          include: {
            estudiante: {
              include: {
                usuario: true,
              },
            },
          },
        },
      },
    });
  }

  async remove(avanceId: number) {
    const avance = await this.prisma.avanceTesis.findUnique({
      where: { id: avanceId },
    });
    if (!avance) throw new NotFoundException('Avance no encontrado');
    
    return this.prisma.avanceTesis.delete({
      where: { id: avanceId },
    });
  }
}