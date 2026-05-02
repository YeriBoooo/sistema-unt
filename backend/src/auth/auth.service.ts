import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import type { Response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.usuario.findUnique({
      where: { email },
      include: { 
        roles: { include: { rol: true } },
        estudiante: true,
        asesor: true,
      },
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto, res: Response) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    // Extraer roles como array de strings
    const roles = user.roles?.map(r => r.rol?.nombre) || [];

    const payload = {
      sub: user.id,
      email: user.email,
      roles: roles,
    };
    const token = this.jwtService.sign(payload);

    (res as any).cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Devolver usuario con formato limpio
    return {
      user: {
        id: user.id,
        email: user.email,
        nombres: user.nombres,
        apellidos: user.apellidos,
        dni: user.dni,
        telefono: user.telefono,
        roles: roles,
        estudiante: user.estudiante,
        asesor: user.asesor,
      }
    };
  }

  async register(registerDto: RegisterDto) {
    const { email, password, nombres, apellidos, dni, telefono, rol, ...extra } = registerDto;

    const existing = await this.prisma.usuario.findFirst({
      where: { OR: [{ email }, { dni }] },
    });
    if (existing) throw new BadRequestException('Email o DNI ya registrado');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombres,
        apellidos,
        dni,
        telefono,
        roles: {
          create: {
            rol: { connect: { nombre: rol as any } },
          },
        },
      },
    });

    if (rol === 'estudiante') {
      await this.prisma.estudiante.create({
        data: {
          usuario_id: user.id,
          codigo_universitario: extra.codigo_universitario!,
          escuela_id: extra.escuela_id!,
          ciclo: extra.ciclo,
        },
      });
    } else if (rol === 'asesor') {
      await this.prisma.asesor.create({
        data: {
          usuario_id: user.id,
          escuela_id: extra.escuela_id!,
          especialidad: extra.especialidad,
        },
      });
    }

    return this.sanitizeUser(user);
  }

  async me(userId: number) {
    const user = await this.prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { rol: true } },
        estudiante: { include: { escuela: true } },
        asesor: { include: { escuela: true } },
      },
    });
    if (!user) throw new UnauthorizedException();

    // Extraer roles como array de strings
    const roles = user.roles?.map(r => r.rol?.nombre) || [];

    // Devolver usuario con formato limpio
    return {
      id: user.id,
      email: user.email,
      nombres: user.nombres,
      apellidos: user.apellidos,
      dni: user.dni,
      telefono: user.telefono,
      roles: roles,
      estudiante: user.estudiante,
      asesor: user.asesor,
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!valid) throw new BadRequestException('Contraseña actual incorrecta');

    const newHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.prisma.usuario.update({
      where: { id: userId },
      data: { password: newHash },
    });

    return { message: 'Contraseña actualizada' };
  }

  async logout(res: Response) {
    (res as any).clearCookie('access_token');
    return { message: 'Sesión cerrada' };
  }

  private sanitizeUser(user: any) {
    const { password, ...rest } = user;
    return rest;
  }
}