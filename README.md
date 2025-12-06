# Sistema de Gestión Escolar.

Sistema web desarrollado como proyecto escolar para la gestión integral de una institución educativa, permitiendo administrar usuarios, eventos académicos y generar reportes estadísticos.

## Descripción del Proyecto.

Este proyecto fue desarrollado con la guía del profesor como parte del aprendizaje de tecnologías web modernas. El sistema permite gestionar tres tipos de usuarios (administradores, maestros y alumnos) y facilita la organización de eventos académicos de la institución.

## Autor

**Eduardo**  
Proyecto desarrollado bajo la supervisión y asesoría del profesor.

## Tecnologías Utilizadas

### Frontend
- Angular 16.2.11 - Framework principal
- Angular Material - Componentes UI
- Bootstrap 5 - Estilos y responsive design
- Chart.js - Gráficas y estadísticas
- TypeScript - Lenguaje de programación

### Backend
- Django + Django REST Framework - API REST
- MySQL - Base de datos
- JWT - Autenticación

### Deploy
- Vercel - Frontend desplegado
- Railway - Backend desplegado

## Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 16.x
npm >= 8.x
Angular CLI 16.2.11
```

### Instalación Local

1. Clonar el repositorio
```bash
git clone https://github.com/edumtd/SistemaProyectoEGH.git
cd SistemaProyectoEGH
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno

El proyecto usa dos archivos de configuración:
- `src/environments/environment.ts` - Desarrollo local
- `src/environments/environment.prod.ts` - Producción

Para desarrollo local, asegúrate de tener el backend corriendo en `http://127.0.0.1:8000`

4. Ejecutar el servidor de desarrollo
```bash
ng serve
```

Navega a `http://localhost:4200/`

## Estructura del Proyecto

```
src/
├── app/
│   ├── screens/           # Páginas principales
│   │   ├── login-screen/
│   │   ├── administradores-screen/
│   │   ├── maestros-screen/
│   │   ├── alumnos-screen/
│   │   ├── eventos-academicos-screen/
│   │   └── graficas-screen/
│   ├── partials/          # Componentes reutilizables
│   │   ├── navbar/
│   │   ├── sidebar/
│   │   ├── registro-admin/
│   │   ├── registro-maestros/
│   │   ├── registro-alumnos/
│   │   └── registro-eventos/
│   ├── modals/            # Modales
│   ├── services/          # Servicios y lógica de negocio
│   ├── layouts/           # Layouts de la aplicación
│   └── interfaces/        # Interfaces TypeScript
├── environments/          # Configuración de entornos
└── assets/               # Recursos estáticos
```

## Funcionalidades Principales

### Gestión de Usuarios
- Registro y edición de administradores
- Registro y edición de maestros
- Registro y edición de alumnos
- Validación de datos (CURP, RFC, email, etc.)
- Sistema de autenticación con JWT

### Gestión de Eventos Académicos
- Crear, editar y eliminar eventos
- Asignar responsables (maestros/administradores)
- Definir público objetivo
- Gestión de fechas, horarios y ubicación

### Dashboard y Reportes
- Gráficas estadísticas de usuarios
- Visualización de datos con Chart.js
- Reportes de distribución por tipo de usuario

### Seguridad
- Autenticación basada en roles
- Protección de rutas con guards
- Sesiones persistentes con cookies

## Build

Para compilar el proyecto para producción:

```bash
npm run build
```

Los archivos se generarán en el directorio `dist/`

## Deploy

### Frontend (Vercel)
El frontend está desplegado automáticamente en Vercel:
- URL: https://sistemaproyectoegh10.vercel.app

Cada push a la rama `main` dispara un nuevo deployment automáticamente.

### Backend (Railway)
El backend está desplegado en Railway:
- URL: https://sistemaproyectoeghback-production.up.railway.app

## Aprendizajes del Proyecto

Durante el desarrollo de este proyecto, aprendí:

- Arquitectura de aplicaciones web modernas (Frontend/Backend separados)
- Desarrollo con Angular y componentes reutilizables
- Consumo de APIs REST con HttpClient
- Manejo de formularios reactivos y validaciones
- Autenticación y autorización con JWT
- Uso de Angular Material y Bootstrap
- Despliegue en plataformas cloud (Vercel, Railway)
- Versionamiento con Git y GitHub
- Trabajo con bases de datos relacionales

## Guía del Profesor

Este proyecto fue desarrollado siguiendo las mejores prácticas enseñadas en clase:

- Separación de responsabilidades (Services, Components, Guards)
- Código limpio y mantenible
- Validaciones del lado del cliente
- Manejo adecuado de errores
- Experiencia de usuario intuitiva

## Solución de Problemas

### El backend no responde
Verifica que el backend en Railway esté activo y que la URL en `environment.prod.ts` sea correcta.

### Error de CORS
Asegúrate de que el backend tenga configurado CORS para permitir peticiones desde el dominio de Vercel.

### Errores de autenticación
Limpia las cookies del navegador e intenta iniciar sesión nuevamente.

## Notas de Desarrollo

- El proyecto usa Angular Material para componentes UI
- Las validaciones incluyen: email, CURP, RFC, teléfono, fechas
- Los roles de usuario son: Administrador, Maestro, Alumno
- Se implementó lazy loading para optimizar la carga

## Contactos

Para dudas o sugerencias sobre el proyecto, contactar al desarrollador o al profesor responsable.
