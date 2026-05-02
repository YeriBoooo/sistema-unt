import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({
        skip,
        take: limit,
        include: {
          roles: { include: { rol: true } },
          estudiante: true,
          asesor: true,
        },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.usuario.count(),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id },
      include: {
        roles: { include: { rol: true } },
        estudiante: true,
        asesor: true,
      },
    });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.usuario.update({
      where: { id },
      data,
      include: { roles: { include: { rol: true } } },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.usuario.delete({ where: { id } });
  }

  async asignarRol(userId: number, rolNombre: string) {
    const rol = await this.prisma.rol.findUnique({ where: { nombre: rolNombre as any } });
    if (!rol) throw new NotFoundException('Rol no encontrado');

    return this.prisma.usuarioRol.create({
      data: {
        usuario_id: userId,
        rol_id: rol.id,
      },
    });
  }
}