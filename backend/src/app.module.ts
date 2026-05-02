import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { EstudiantesModule } from './estudiantes/estudiantes.module';
import { AsesoresModule } from './asesores/asesores.module';
import { EmpresasModule } from './empresas/empresas.module';
import { OfertasModule } from './ofertas/ofertas.module';
import { SeguimientoModule } from './seguimiento/seguimiento.module';
import { TesisModule } from './tesis/tesis.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportesModule } from './reportes/reportes.module';
import { UploadsController } from './uploads/uploads.controller';
import { PostulacionesController } from './postulaciones/postulaciones.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EstudiantesModule,
    AsesoresModule,
    EmpresasModule,
    OfertasModule,
    SeguimientoModule,
    TesisModule,
    DashboardModule,
    ReportesModule,
  ],
  controllers: [UploadsController, PostulacionesController],
})
export class AppModule {}