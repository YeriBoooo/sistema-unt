import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConveniosService {
  constructor(private prisma: PrismaService) {}

  async findByEmpresa(empresaId: number) {
    return this.prisma.convenio.findMany({
      where: { empresa_id: empresaId },
      orderBy: { fecha_inicio: 'desc' },
    });
  }

  async create(data: any) {
    return this.prisma.convenio.create({
      data: {
        empresa_id: data.empresa_id,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: new Date(data.fecha_fin),
        tipo: data.tipo,
        archivo_pdf: data.archivo_pdf,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.convenio.update({
      where: { id },
      data: {
        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
        tipo: data.tipo,
        estado: data.estado,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.convenio.delete({ where: { id } });
  }
}