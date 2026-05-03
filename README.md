# Sistema UNT — Gestión de Prácticas Preprofesionales y Tesis

> Plataforma web institucional para la gestión digital de prácticas preprofesionales y proyectos de tesis de la **Universidad Nacional de Trujillo — Escuela de Ingeniería de Sistemas**.

---

## Demo en vivo

**[https://sistema-unt.vercel.app](https://sistema-unt.vercel.app)**

---

## Tecnologías principales

- **Frontend:** Next.js 15 + React 19
- **Estilos:** Tailwind CSS + shadcn/ui
- **Backend:** NestJS + TypeScript
- **Base de datos:** PostgreSQL 15 (Supabase)
- **ORM:** Prisma ORM
- **Autenticación:** JWT + Cookies HttpOnly
- **Reportes:** Puppeteer (PDF)
- **Gráficos:** Recharts

---

## Infraestructura

| Componente    | Plataforma | URL                                              |
|---------------|------------|--------------------------------------------------|
| Frontend      | Vercel     | https://sistema-unt.vercel.app                   |
| Backend       | Railway    | https://sistema-unt-production.up.railway.app    |
| Base de datos | Supabase   | PostgreSQL gestionado con backups automáticos    |

---

## Credenciales de prueba

| Rol           | Correo electrónico                    | Contraseña |
|---------------|---------------------------------------|------------|
| Administrador | admin@unt.edu.pe                      | admin123   |
| Asesor        | lmartinez@unt.edu.pe                  | admin123   |
| Estudiante    | lcastillo@unitru.edu.pe               | admin123   |
| Empresa       | recursos@intercorp.com                | admin123   |
| Coordinador   | coordinador.sistemas@unt.edu.pe       | admin123   |

> **Nota:** Credenciales solo para evaluación. Se recomienda cambiarlas antes del uso operativo real.

---

## Funcionalidades por rol

### Administrador
- Dashboard con métricas globales en tiempo real
- CRUD completo de estudiantes, asesores y empresas
- Gestión y aprobación de ofertas de práctica
- Supervisión de tesis: asignación de asesores, jurados y actas de sustentación
- Gestión de postulaciones y cambios de estado
- Generación de reportes en PDF con filtros de fecha

### Asesor / Docente
- Dashboard con resumen de estudiantes asignados
- Seguimiento de prácticas: horas acumuladas, informes y evaluación final
- Revisión de avances de tesis: aprobar u observar con comentarios por entregable

### Estudiante
- Panel personal con estado de práctica, tesis y postulación activa
- Búsqueda y postulación a ofertas disponibles
- Registro de horas cumplidas y subida de informes de actividades
- Subida de avances de tesis y visualización de observaciones del asesor

### Representante de Empresa
- Dashboard con resumen de ofertas publicadas
- Creación y gestión de sus propias ofertas de práctica
- Visualización de candidatos postulantes por oferta

---

## Estructura del proyecto

```
sistema-unt/
├── frontend/                  # Next.js 15 (App Router)
│   ├── app/
│   │   ├── (auth)/login/      # Inicio de sesión
│   │   ├── dashboard/         # Panel principal
│   │   ├── practicas/         # Módulo prácticas
│   │   ├── tesis/             # Módulo tesis
│   │   ├── estudiantes/       # Gestión estudiantes
│   │   ├── empresas/          # Gestión empresas
│   │   └── reportes/          # Reportes PDF
│   ├── components/
│   │   ├── ui/                # Componentes shadcn/ui
│   │   └── layouts/           # Sidebar y Header
│   └── lib/
│       ├── api/               # Cliente HTTP centralizado
│       └── hooks/             # useAuth, useOfertas, etc.
├── backend/                   # NestJS
│   ├── src/
│   │   ├── auth/              # Autenticación JWT + RBAC
│   │   ├── estudiantes/       # CRUD estudiantes
│   │   ├── asesores/          # CRUD asesores
│   │   ├── empresas/          # CRUD empresas + convenios
│   │   ├── ofertas/           # Ofertas + postulaciones
│   │   ├── seguimiento/       # Horas + evaluación
│   │   ├── tesis/             # Tesis + avances + actas
│   │   ├── dashboard/         # Estadísticas
│   │   └── reportes/          # Generación PDF
│   └── prisma/
│       └── schema.prisma      # Modelo de datos
├── docker-compose.yml
└── .github/
    └── workflows/             # CI/CD con GitHub Actions
```

---

## Ejecutar en local con Docker

```bash
# 1. Clonar el repositorio
git clone https://github.com/YeriBoooo/sistema-unt.git
cd sistema-unt

# 2. Configurar variables de entorno
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
# Edita los archivos .env con tus credenciales

# 3. Levantar todos los servicios
docker-compose up -d

# 4. Ejecutar migraciones de base de datos
docker exec -it sistema-unt-backend npx prisma migrate dev

# 5. Abrir en el navegador
# http://localhost:3000
```

---

## Pruebas

```bash
# Pruebas unitarias (backend)
cd backend && npm run test

# Pruebas end-to-end
cd frontend && npm run test:e2e
```

---

## Autora

**Geraldine Daniela Rojas Villegas**
[@YeriBoooo](https://github.com/YeriBoooo) · Universidad Nacional de Trujillo

---

## Licencia

Proyecto de uso académico — **Universidad Nacional de Trujillo**, Facultad de Ingeniería de Sistemas, 2025.
