import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTesisDto } from './dto/create-tesis.dto';
import { UpdateTesisDto } from './dto/update-tesis.dto';
import { AsignarJuradoDto } from './dto/asignar-jurado.dto';
import { RegistrarActaDto } from './dto/registrar-acta.dto';
import { EstadoTesis } from '@prisma/client';

@Injectable()
export class TesisService {
  constructor(private prisma: PrismaService) {}

  // ==================== MÉTODOS PARA ESTUDIANTE ====================
  
  async getEstudianteByUsuarioId(usuarioId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  async findByEstudiante(estudianteId: number) {
    return this.prisma.tesis.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        asesor_principal: {
          include: { usuario: true }
        },
        avances: true
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ==================== MÉTODOS PARA ASESOR ====================
  
  async getAsesorByUsuarioId(usuarioId: number) {
    const asesor = await this.prisma.asesor.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!asesor) throw new NotFoundException('Asesor no encontrado');
    return asesor;
  }

  async findByAsesor(asesorId: number) {
    return this.prisma.tesis.findMany({
      where: { asesor_principal_id: asesorId },
      include: {
        estudiante: {
          include: { usuario: true }
        },
        avances: true
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // ==================== MÉTODOS GENERALES ====================
  
  async findAll(page = 1, limit = 10, filters?: any) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.tesis.findMany({
        skip,
        take: limit,
        include: { 
          estudiante: { 
            include: { 
              usuario: true 
            } 
          }, 
          asesor_principal: { 
            include: { 
              usuario: true 
            } 
          } 
        },
        where: filters,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.tesis.count({ where: filters }),
    ]);
    return { data, total, page, limit };
  }

  async findOne(id: number) {
    const tesis = await this.prisma.tesis.findUnique({
      where: { id },
      include: {
        estudiante: {
          include: { 
            usuario: true,
            escuela: true
          }
        },
        asesor_principal: {
          include: { 
            usuario: true,
            escuela: true
          }
        },
        jurados: {
          include: { 
            asesor: {
              include: { 
                usuario: true,
                escuela: true
              }
            } 
          }
        },
        avances: {
          orderBy: { fecha_entrega: 'desc' }
        },
        acta: true,
      },
    });
    if (!tesis) throw new NotFoundException('Tesis no encontrada');
    return tesis;
  }

  async create(estudianteId: number, createDto: CreateTesisDto) {
    const existing = await this.prisma.tesis.findFirst({
      where: { estudiante_id: estudianteId, estado: { not: 'culminado' } },
    });
    if (existing) throw new BadRequestException('Ya tienes una tesis en proceso');

    return this.prisma.tesis.create({
      data: {
        titulo: createDto.titulo,
        resumen: createDto.resumen,
        estudiante_id: estudianteId,
        asesor_principal_id: createDto.asesor_principal_id,
        fecha_inicio: new Date(),
        estado: 'propuesta',
      },
      include: { 
        asesor_principal: {
          include: { usuario: true }
        },
        estudiante: {
          include: { usuario: true }
        }
      },
    });
  }

  async update(id: number, updateDto: UpdateTesisDto) {
    await this.findOne(id);
    return this.prisma.tesis.update({
      where: { id },
      data: updateDto,
      include: { 
        estudiante: { include: { usuario: true } },
        asesor_principal: { include: { usuario: true } }
      },
    });
  }

  async asignarJurado(tesisId: number, juradoDto: AsignarJuradoDto) {
    await this.findOne(tesisId);
    const existing = await this.prisma.juradoTesis.findFirst({
      where: { tesis_id: tesisId, rol: juradoDto.rol },
    });
    if (existing) throw new BadRequestException(`Ya hay un jurado con rol ${juradoDto.rol}`);

    return this.prisma.juradoTesis.create({
      data: {
        tesis_id: tesisId,
        asesor_id: juradoDto.asesor_id,
        rol: juradoDto.rol,
      },
      include: {
        asesor: {
          include: { usuario: true }
        }
      }
    });
  }

  async removerJurado(juradoId: number) {
    const jurado = await this.prisma.juradoTesis.findUnique({
      where: { id: juradoId },
    });
    if (!jurado) throw new NotFoundException('Jurado no encontrado');
    
    return this.prisma.juradoTesis.delete({
      where: { id: juradoId },
    });
  }

  async registrarActa(tesisId: number, actaDto: RegistrarActaDto, file?: any) {
    await this.findOne(tesisId);
    let archivoUrl: string | undefined;
    if (file) {
      archivoUrl = `/uploads/${file.filename}`;
    }

    return this.prisma.actaSustentacion.create({
      data: {
        tesis_id: tesisId,
        fecha: new Date(actaDto.fecha),
        lugar: actaDto.lugar,
        nota_final: actaDto.nota_final,
        archivo_acta_pdf: archivoUrl,
      },
      include: {
        tesis: {
          include: {
            estudiante: { include: { usuario: true } }
          }
        }
      }
    });
  }

  async getActa(tesisId: number) {
    return this.prisma.actaSustentacion.findUnique({
      where: { tesis_id: tesisId },
      include: {
        tesis: {
          include: {
            estudiante: { include: { usuario: true } }
          }
        }
      }
    });
  }

  async cambiarEstado(id: number, nuevoEstado: string) {
    const tesis = await this.prisma.tesis.findUnique({
      where: { id },
    });
    if (!tesis) throw new NotFoundException('Tesis no encontrada');
    
    const estadosValidos: EstadoTesis[] = ['propuesta', 'desarrollo', 'sustentacion', 'culminado'];
    if (!estadosValidos.includes(nuevoEstado as EstadoTesis)) {
      throw new BadRequestException(`Estado inválido. Debe ser: ${estadosValidos.join(', ')}`);
    }
    
    return this.prisma.tesis.update({
      where: { id },
      data: { estado: nuevoEstado as EstadoTesis },
      include: { 
        estudiante: { include: { usuario: true } },
        asesor_principal: { include: { usuario: true } }
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.tesis.delete({ where: { id } });
  }
}