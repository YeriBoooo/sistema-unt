import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        skip,
        take: limit,
        include: { usuario: true, escuela: true },
        where: filters,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.estudiante.count({ where: filters }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: { usuario: true, escuela: true, postulaciones: { include: { oferta: true } }, tesis: true },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  async create(createDto: CreateEstudianteDto) {
    // Asume que usuario ya está creado, pero en registro se crea automáticamente
    return this.prisma.estudiante.create({
      data: {
        usuario_id: createDto.usuario_id,
        codigo_universitario: createDto.codigo_universitario,
        escuela_id: createDto.escuela_id,
        ciclo: createDto.ciclo,
        resolucion_practicas: createDto.resolucion_practicas,
      },
      include: { usuario: true },
    });
  }

  async update(id: number, updateDto: UpdateEstudianteDto) {
    await this.findOne(id);
    return this.prisma.estudiante.update({
      where: { id },
      data: updateDto,
      include: { usuario: true },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.estudiante.delete({ where: { id } });
  }

async subirDocumento(id: number, file: any) {
    // Implementar subida a S3 y guardar URL en el campo correspondiente (ej. resolucion_practicas)
    // Por simplicidad, se guarda en local
    const url = `/uploads/${file.filename}`;
    await this.prisma.estudiante.update({
      where: { id },
      data: { resolucion_practicas: url },
    });
    return { url };
  }
}
