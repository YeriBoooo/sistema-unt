\# 🎓 Sistema UNT — Gestión de Prácticas Preprofesionales y Tesis



\[!\[Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge\&logo=vercel\&logoColor=white)](https://sistema-unt.vercel.app)

\[!\[Railway](https://img.shields.io/badge/Railway-131415?style=for-the-badge\&logo=railway\&logoColor=white)](https://railway.app)

\[!\[Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge\&logo=supabase\&logoColor=white)](https://supabase.com)

\[!\[TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge\&logo=typescript\&logoColor=white)](https://www.typescriptlang.org/)

\[!\[Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge\&logo=nextdotjs\&logoColor=white)](https://nextjs.org/)

\[!\[NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge\&logo=nestjs\&logoColor=white)](https://nestjs.com/)



> Plataforma web institucional para la gestión digital de prácticas preprofesionales y proyectos de tesis de la \*\*Universidad Nacional de Trujillo — Escuela de Ingeniería de Sistemas\*\*.



\---



\## 🌐 Demo en vivo



🔗 \*\*\[https://sistema-unt.vercel.app](https://sistema-unt.vercel.app)\*\*



\---



\## 📋 Credenciales de acceso por rol



| Rol | Correo electrónico | Contraseña |

|-----|-------------------|------------|

| 👑 Administrador | admin@unt.edu.pe | admin123 |

| 👨‍🏫 Asesor | lmartinez@unt.edu.pe | admin123 |

| 👨‍🎓 Estudiante | lcastillo@unitru.edu.pe | admin123 |

| 🏢 Empresa | recursos@intercorp.com | admin123 |

| 📋 Coordinador | coordinador.sistemas@unt.edu.pe | admin123 |



> ⚠️ Credenciales solo para evaluación. Se recomienda cambiarlas antes del uso operativo real.



\---



\## ✨ Funcionalidades por rol



\### 👑 Administrador

\- Dashboard con métricas globales en tiempo real

\- CRUD completo de estudiantes, asesores y empresas

\- Gestión y aprobación de ofertas de práctica

\- Supervisión de todas las tesis: asignación de asesores, jurados y actas de sustentación

\- Gestión de postulaciones y cambios de estado

\- Generación de reportes en PDF con filtros de fecha



\### 👨‍🏫 Asesor / Docente

\- Dashboard con resumen de estudiantes asignados

\- Seguimiento de prácticas: horas acumuladas, informes y evaluación final

\- Revisión de avances de tesis: aprobar u observar con comentarios por entregable



\### 👨‍🎓 Estudiante

\- Panel personal con estado de práctica, tesis y postulación activa

\- Búsqueda y postulación a ofertas disponibles

\- Registro de horas cumplidas y subida de informes de actividades

\- Subida de avances de tesis y visualización de observaciones del asesor



\### 🏢 Representante de Empresa

\- Dashboard con resumen de ofertas publicadas

\- Creación y gestión de sus propias ofertas de práctica

\- Visualización de candidatos que postularon a cada oferta



\---



\## 🛠️ Stack tecnológico



| Capa | Tecnología | Descripción |

|------|-----------|-------------|

| \*\*Frontend\*\* | Next.js 15 + React 19 | App Router, SSR, componentes de servidor |

| \*\*Estilos\*\* | Tailwind CSS + shadcn/ui | UI accesible, responsive y moderna |

| \*\*Backend\*\* | NestJS + TypeScript | API REST modular de alto rendimiento |

| \*\*Base de datos\*\* | PostgreSQL 15 | Motor relacional robusto y confiable |

| \*\*ORM\*\* | Prisma ORM | Acceso tipado y seguro a la base de datos |

| \*\*Autenticación\*\* | JWT + Cookies HttpOnly | Sesiones seguras con CORS configurado |

| \*\*Reportes\*\* | Puppeteer | Generación automática de PDF |

| \*\*Gráficos\*\* | Recharts | Gráficos interactivos para el dashboard |



\---



\## ☁️ Infraestructura de despliegue



| Componente | Plataforma | URL / Notas |

|------------|-----------|-------------|

| Frontend | \*\*Vercel\*\* | https://sistema-unt.vercel.app |

| Backend | \*\*Railway\*\* | https://sistema-unt-production.up.railway.app |

| Base de datos | \*\*Supabase\*\* | PostgreSQL gestionado con backups automáticos |



\---



\## 📁 Estructura del proyecto



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

&#x20;   └── workflows/             # CI/CD con GitHub Actions

```



\---



\## 🐳 Ejecutar en local con Docker



```bash

\# 1. Clonar el repositorio

git clone https://github.com/YeriBoooo/sistema-unt.git

cd sistema-unt



\# 2. Configurar variables de entorno

cp backend/.env.example backend/.env

cp frontend/.env.local.example frontend/.env.local

\# Edita los archivos .env con tus credenciales



\# 3. Levantar todos los servicios

docker-compose up -d



\# 4. Ejecutar migraciones de base de datos

docker exec -it sistema-unt-backend npx prisma migrate dev



\# 5. Abrir en el navegador

\# http://localhost:3000

```



\---



\## 🧪 Pruebas



```bash

\# Pruebas unitarias (backend)

cd backend \&\& npm run test



\# Pruebas end-to-end

cd frontend \&\& npm run test:e2e

```



\---



\## 👩‍💻 Autora



\*\*Geraldine Daniela Rojas Villegas\*\*  

\[@YeriBoooo](https://github.com/YeriBoooo) · Universidad Nacional de Trujillo



\---



\## 📄 Licencia



Proyecto de uso académico — \*\*Universidad Nacional de Trujillo\*\*, Facultad de Ingeniería de Sistemas, 2025.



\---



⭐ Si te fue útil, no olvides dejar una estrella al repositorio.

