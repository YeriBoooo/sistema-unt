import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarHorasDto } from './dto/registrar-horas.dto';
import { EvaluarDto } from './dto/evaluar.dto';

@Injectable()
export class SeguimientoService {
  constructor(private prisma: PrismaService) {}

  // ✅ MÉTODO FALTANTE - Obtener estudiante por usuario ID
  async getEstudianteByUsuarioId(usuarioId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { usuario_id: usuarioId },
    });
    if (!estudiante) throw new NotFoundException('Estudiante no encontrado');
    return estudiante;
  }

  async getByPostulacion(postulacionId: number) {
    const seguimiento = await this.prisma.seguimientoPractica.findUnique({
      where: { postulacion_id: postulacionId },
    });
    if (!seguimiento) {
      // Crear automáticamente si no existe
      return this.prisma.seguimientoPractica.create({
        data: { postulacion_id: postulacionId },
      });
    }
    return seguimiento;
  }

  async registrarHoras(postulacionId: number, dto: RegistrarHorasDto, esEstudiante: boolean) {
    const seguimiento = await this.getByPostulacion(postulacionId);
    
    // Validar que las horas no excedan el total
    const horasActuales = seguimiento?.horas_cumplidas || 0;
    const horasTotales = seguimiento?.horas_totales || 300;
    const nuevasHoras = horasActuales + dto.horas_cumplidas;
    
    if (nuevasHoras > horasTotales) {
      throw new Error(`No puedes exceder las ${horasTotales} horas totales. Te quedan ${horasTotales - horasActuales} horas.`);
    }

    const updateData: any = { horas_cumplidas: nuevasHoras };
    if (esEstudiante) {
      updateData.informe_estudiante = dto.informe;
    } else {
      updateData.informe_asesor = dto.informe;
    }
    
    return this.prisma.seguimientoPractica.update({
      where: { id: seguimiento.id },
      data: updateData,
    });
  }

  async evaluar(postulacionId: number, dto: EvaluarDto) {
    const seguimiento = await this.getByPostulacion(postulacionId);
    return this.prisma.seguimientoPractica.update({
      where: { id: seguimiento.id },
      data: {
        evaluacion: dto.evaluacion,
        fecha_evaluacion: new Date(),
      },
    });
  }

  async finalizarPractica(postulacionId: number) {
    const postulacion = await this.prisma.postulacion.update({
      where: { id: postulacionId },
      data: { estado: 'finalizado' },
    });
    return postulacion;
  }
}