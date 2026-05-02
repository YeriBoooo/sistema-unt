export class DashboardEstudianteDto {
  postulacionActiva: {
    id: number;
    estado: string;
    oferta: {
      id: number;
      titulo: string;
      empresa: { razon_social: string };
    };
    seguimiento?: {
      horas_cumplidas: number;
      horas_totales: number;
    };
  } | null;
  horasPractica: { cumplidas: number; totales: number };
  tesisActiva: {
    id: number;
    titulo: string;
    estado: string;
    fecha_inicio: Date;
  } | null;
  proximosAvances: Array<{
    id: number;
    descripcion: string;
    fecha_entrega: Date;
    tipo: string;
  }>;
}