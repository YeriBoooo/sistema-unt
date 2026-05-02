-- CreateEnum
CREATE TYPE "EstadoPostulacion" AS ENUM ('postulado', 'aceptado', 'rechazado', 'en_curso', 'finalizado');

-- CreateEnum
CREATE TYPE "EstadoTesis" AS ENUM ('propuesta', 'desarrollo', 'sustentacion', 'culminado');

-- CreateEnum
CREATE TYPE "RolNombre" AS ENUM ('admin', 'coordinador', 'asesor', 'estudiante', 'empresa');

-- CreateTable
CREATE TABLE "Rol" (
    "id" SERIAL NOT NULL,
    "nombre" "RolNombre" NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "Rol_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "telefono" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario_rol" (
    "usuario_id" INTEGER NOT NULL,
    "rol_id" INTEGER NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("usuario_id","rol_id")
);

-- CreateTable
CREATE TABLE "Escuela" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "facultad" TEXT NOT NULL,

    CONSTRAINT "Escuela_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiante" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "codigo_universitario" TEXT NOT NULL,
    "escuela_id" INTEGER NOT NULL,
    "ciclo" TEXT,
    "resolucion_practicas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "estudiante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asesor" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "escuela_id" INTEGER NOT NULL,
    "especialidad" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asesor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empresa" (
    "id" SERIAL NOT NULL,
    "ruc" TEXT NOT NULL,
    "razon_social" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email_contacto" TEXT,
    "representante" TEXT,
    "convenio_activo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Empresa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convenio" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "tipo" TEXT NOT NULL,
    "archivo_pdf" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'vigente',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Convenio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfertaPractica" (
    "id" SERIAL NOT NULL,
    "empresa_id" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "requisitos" TEXT,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "vacantes" INTEGER NOT NULL,
    "modalidad" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'abierta',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OfertaPractica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Postulacion" (
    "id" SERIAL NOT NULL,
    "oferta_id" INTEGER NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "asesor_academico_id" INTEGER,
    "fecha_postulacion" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" "EstadoPostulacion" NOT NULL DEFAULT 'postulado',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Postulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsesorPostulacion" (
    "id" SERIAL NOT NULL,
    "asesor_id" INTEGER NOT NULL,
    "postulacion_id" INTEGER NOT NULL,
    "asignado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AsesorPostulacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeguimientoPractica" (
    "id" SERIAL NOT NULL,
    "postulacion_id" INTEGER NOT NULL,
    "horas_cumplidas" INTEGER NOT NULL DEFAULT 0,
    "horas_totales" INTEGER NOT NULL DEFAULT 300,
    "informe_estudiante" TEXT,
    "informe_asesor" TEXT,
    "evaluacion" TEXT NOT NULL DEFAULT 'pendiente',
    "fecha_evaluacion" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeguimientoPractica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tesis" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "resumen" TEXT,
    "estudiante_id" INTEGER NOT NULL,
    "asesor_principal_id" INTEGER NOT NULL,
    "estado" "EstadoTesis" NOT NULL DEFAULT 'propuesta',
    "fecha_inicio" DATE,
    "fecha_sustentacion" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JuradoTesis" (
    "id" SERIAL NOT NULL,
    "tesis_id" INTEGER NOT NULL,
    "asesor_id" INTEGER NOT NULL,
    "rol" TEXT NOT NULL,

    CONSTRAINT "JuradoTesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvanceTesis" (
    "id" SERIAL NOT NULL,
    "tesis_id" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_entrega" DATE NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'entregado',
    "observaciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AvanceTesis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActaSustentacion" (
    "id" SERIAL NOT NULL,
    "tesis_id" INTEGER NOT NULL,
    "fecha" DATE NOT NULL,
    "lugar" TEXT,
    "nota_final" DOUBLE PRECISION,
    "archivo_acta_pdf" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActaSustentacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reporte" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT NOT NULL,
    "parametros" JSONB,
    "archivo_generado" BYTEA,
    "generado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generado_por" INTEGER,

    CONSTRAINT "Reporte_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rol_nombre_key" ON "Rol"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_dni_key" ON "usuario"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_usuario_id_key" ON "estudiante"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "estudiante_codigo_universitario_key" ON "estudiante"("codigo_universitario");

-- CreateIndex
CREATE UNIQUE INDEX "asesor_usuario_id_key" ON "asesor"("usuario_id");

-- CreateIndex
CREATE UNIQUE INDEX "Empresa_ruc_key" ON "Empresa"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "AsesorPostulacion_asesor_id_postulacion_id_key" ON "AsesorPostulacion"("asesor_id", "postulacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "SeguimientoPractica_postulacion_id_key" ON "SeguimientoPractica"("postulacion_id");

-- CreateIndex
CREATE UNIQUE INDEX "JuradoTesis_tesis_id_rol_key" ON "JuradoTesis"("tesis_id", "rol");

-- CreateIndex
CREATE UNIQUE INDEX "ActaSustentacion_tesis_id_key" ON "ActaSustentacion"("tesis_id");

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_rol" ADD CONSTRAINT "usuario_rol_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "Rol"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estudiante" ADD CONSTRAINT "estudiante_escuela_id_fkey" FOREIGN KEY ("escuela_id") REFERENCES "Escuela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asesor" ADD CONSTRAINT "asesor_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asesor" ADD CONSTRAINT "asesor_escuela_id_fkey" FOREIGN KEY ("escuela_id") REFERENCES "Escuela"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Convenio" ADD CONSTRAINT "Convenio_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfertaPractica" ADD CONSTRAINT "OfertaPractica_empresa_id_fkey" FOREIGN KEY ("empresa_id") REFERENCES "Empresa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_oferta_id_fkey" FOREIGN KEY ("oferta_id") REFERENCES "OfertaPractica"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Postulacion" ADD CONSTRAINT "Postulacion_asesor_academico_id_fkey" FOREIGN KEY ("asesor_academico_id") REFERENCES "asesor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsesorPostulacion" ADD CONSTRAINT "AsesorPostulacion_asesor_id_fkey" FOREIGN KEY ("asesor_id") REFERENCES "asesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AsesorPostulacion" ADD CONSTRAINT "AsesorPostulacion_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeguimientoPractica" ADD CONSTRAINT "SeguimientoPractica_postulacion_id_fkey" FOREIGN KEY ("postulacion_id") REFERENCES "Postulacion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tesis" ADD CONSTRAINT "Tesis_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiante"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tesis" ADD CONSTRAINT "Tesis_asesor_principal_id_fkey" FOREIGN KEY ("asesor_principal_id") REFERENCES "asesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuradoTesis" ADD CONSTRAINT "JuradoTesis_tesis_id_fkey" FOREIGN KEY ("tesis_id") REFERENCES "Tesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JuradoTesis" ADD CONSTRAINT "JuradoTesis_asesor_id_fkey" FOREIGN KEY ("asesor_id") REFERENCES "asesor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvanceTesis" ADD CONSTRAINT "AvanceTesis_tesis_id_fkey" FOREIGN KEY ("tesis_id") REFERENCES "Tesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActaSustentacion" ADD CONSTRAINT "ActaSustentacion_tesis_id_fkey" FOREIGN KEY ("tesis_id") REFERENCES "Tesis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reporte" ADD CONSTRAINT "Reporte_generado_por_fkey" FOREIGN KEY ("generado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
