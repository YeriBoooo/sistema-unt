import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmpresasService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.empresa.findMany({
        skip,
        take: limit,
        include: { convenios: true, ofertas: true },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.empresa.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const empresa = await this.prisma.empresa.findUnique({
      where: { id },
      include: { convenios: true, ofertas: true },
    });
    if (!empresa) throw new NotFoundException('Empresa no encontrada');
    return empresa;
  }

  async create(data: any) {
    return this.prisma.empresa.create({
      data,
    });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.empresa.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.empresa.delete({ where: { id } });
  }
}