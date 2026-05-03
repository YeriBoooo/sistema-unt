import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateEstudianteDto) {
    const { usuario, codigo_universitario, ciclo, escuela_id, resolucion_practicas } = createDto;
    
    const hashedPassword = await bcrypt.hash(usuario.password, 10);

    return this.prisma.$transaction(async (prisma) => {
      const user = await prisma.usuario.create({
        data: {
          email: usuario.email,
          password: hashedPassword,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          dni: usuario.dni,
          telefono: usuario.telefono,
          roles: {
            create: {
              rol: { connect: { nombre: 'estudiante' } }
            }
          }
        }
      });

      const estudiante = await prisma.estudiante.create({
        data: {
          usuario_id: user.id,
          codigo_universitario,
          ciclo,
          escuela_id,
          resolucion_practicas,
        },
        include: { usuario: true, escuela: true }
      });

      return estudiante;
    });
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        skip,
        take: limit,
        include: {
          usuario: true,
          escuela: true,
          postulaciones: { include: { oferta: true } },
          tesis: true
        },
        orderBy: { created_at: 'desc' }
      }),
      this.prisma.estudiante.count()
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        usuario: true,
        escuela: true,
        postulaciones: { include: { oferta: true } },
        tesis: true
      }
    });

    if (!estudiante) {
      throw new NotFoundException(`Estudiante con ID ${id} no encontrado`);
    }

    return estudiante;
  }

  async update(id: number, updateDto: UpdateEstudianteDto) {
    await this.findOne(id);

    const { usuario, codigo_universitario, ciclo, escuela_id, resolucion_practicas } = updateDto;

    return this.prisma.$transaction(async (prisma) => {
      if (usuario) {
        const estudianteActual = await prisma.estudiante.findUnique({
          where: { id },
          select: { usuario_id: true }
        });

        await prisma.usuario.update({
          where: { id: estudianteActual.usuario_id },
          data: {
            nombres: usuario.nombres,
            apellidos: usuario.apellidos,
            email: usuario.email,
            dni: usuario.dni,
            telefono: usuario.telefono,
          }
        });
      }

      const estudiante = await prisma.estudiante.update({
        where: { id },
        data: {
          codigo_universitario,
          ciclo,
          escuela_id,
          resolucion_practicas,
        },
        include: { usuario: true, escuela: true }
      });

      return estudiante;
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    
    return this.prisma.$transaction(async (prisma) => {
      const estudiante = await prisma.estudiante.delete({
        where: { id },
        include: { usuario: true }
      });
      
      await prisma.usuario.delete({
        where: { id: estudiante.usuario_id }
      });
      
      return { message: 'Estudiante eliminado correctamente' };
    });
  }
}