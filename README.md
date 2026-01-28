# Lumen EMS

Sistema de gestión y monitoreo de energía desarrollado con Next.js 15.

## Descripción

Lumen EMS es una plataforma de monitoreo energético que permite visualizar telemetría de dispositivos, incluyendo métricas de potencia, voltaje, corriente, energía y más. La aplicación se integra con ThingsBoard para la gestión de dispositivos y datos en tiempo real.

## Características

- Visualización de gráficos interactivos con amCharts 4
- Monitoreo en tiempo real de métricas eléctricas
- Filtrado avanzado por dispositivos, métricas y rangos de tiempo
- Interfaz responsiva con soporte para dispositivos móviles
- Sistema de autenticación de usuarios
- Gestión jerárquica de clientes y activos

## Stack Tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Componentes UI | Radix UI + shadcn/ui |
| Gráficos | amCharts 4 |
| Estado | Zustand |
| Backend IoT | ThingsBoard |
| Cache | Redis |

## Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd lumen-ems

# Instalar dependencias
npm install
```

## Configuración

Crear un archivo `.env.local` con las siguientes variables de entorno:

```env
EMS_GROUP_ID=<group-id>
REDIS_URL=<redis-url>
TB_API=<thingsboard-api-url>
```

## Desarrollo

Ejecutar el servidor de desarrollo:

```bash
npm run dev
```

Acceder a [http://localhost:3000](http://localhost:3000) en el navegador.

## Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (main)/            # Rutas principales
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI base
│   ├── sidebar/          # Componentes del sidebar
│   └── filter-sidebar/   # Filtros de telemetría
├── features/             # Módulos por funcionalidad
│   ├── auth/            # Autenticación
│   ├── chart/           # Gráficos
│   ├── telemetry/       # Telemetría y métricas
│   ├── devices/         # Dispositivos
│   ├── asset/           # Activos
│   └── customer/        # Clientes
├── lib/                  # Utilidades y configuración
│   ├── thingsboard/     # Cliente ThingsBoard
│   └── auth/            # Gestión de sesión
└── public/              # Archivos estáticos
```

## Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Hacer fork del repositorio
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Realizar los cambios y hacer commit (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir un Pull Request

### Convenciones de Commits

Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de errores
- `docs:` Cambios en documentación
- `style:` Cambios de formato (no afectan lógica)
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests
- `chore:` Tareas de mantenimiento

## Autor

**Axl Santos** - Ingeniero en Software

- GitHub: [@fallenxl](https://github.com/fallenxl)

## Licencia

© 2019-2026 Lumen. Todos los derechos reservados.
