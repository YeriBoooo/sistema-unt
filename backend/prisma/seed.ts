import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Crear roles
  const roles = await prisma.rol.createMany({
    data: [
      { nombre: 'admin', descripcion: 'Administrador del sistema' },
      { nombre: 'coordinador', descripcion: 'Coordinador de facultad' },
      { nombre: 'asesor', descripcion: 'Asesor/docente' },
      { nombre: 'estudiante', descripcion: 'Estudiante' },
      { nombre: 'empresa', descripcion: 'Representante de empresa' },
    ],
    skipDuplicates: true,
  });

  // Crear usuario admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@unt.edu.pe' },
    update: {},
    create: {
      email: 'admin@unt.edu.pe',
      password: adminPassword,
      nombres: 'Administrador',
      apellidos: 'del Sistema',
      dni: '00000000',
      telefono: '999999999',
      roles: {
        create: {
          rol: { connect: { nombre: 'admin' } }
        }
      }
    },
  });

  // Crear algunas escuelas
  await prisma.escuela.createMany({
    data: [
      { nombre: 'Ingeniería de Sistemas', facultad: 'Ingeniería' },
      { nombre: 'Ingeniería Civil', facultad: 'Ingeniería' },
      { nombre: 'Administración', facultad: 'Ciencias Empresariales' },
    ],
    skipDuplicates: true,
  });

  console.log('Seed completado ✅');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });