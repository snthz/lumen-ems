<p align="center">
  <img src="public/brand/lumen-logo.svg" alt="Lumen EMS" width="80" />
</p>

<h1 align="center">Lumen EMS</h1>

<p align="center">
  Plataforma de monitoreo y gestión energética construida con Next.js&nbsp;16, integrada con ThingsBoard.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/ThingsBoard-IoT-009688" />
</p>

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Despliegue con Docker](#despliegue-con-docker)
- [Guía de configuración de ThingsBoard](#guía-de-configuración-de-thingsboard)
- [White-labeling (personalización de marca)](#white-labeling-personalización-de-marca)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Convenciones](#convenciones)
- [Autor](#autor)
- [Licencia](#licencia)

---

## Descripción

**Lumen EMS** es una plataforma web de monitoreo energético que permite visualizar en tiempo real la telemetría de dispositivos eléctricos — potencia, voltaje, corriente, energía, factor de potencia y más. Se conecta a una instancia de [ThingsBoard](https://thingsboard.io/) como backend IoT y presenta los datos mediante gráficos interactivos, filtros avanzados y una interfaz moderna.

La aplicación soporta **multi-tenant**: un administrador (TENANT_ADMIN) configura clientes, assets y dispositivos desde ThingsBoard, y cada cliente (CUSTOMER_USER) solo ve los recursos que le fueron asignados.

---

## Características

| Área | Detalle |
|------|---------|
| **Gráficos interactivos** | Líneas, barras, gráficos apilados, pie charts y modo de comparación con amCharts 4 |
| **Telemetría en tiempo real** | Consulta métricas con agregaciones (AVG, SUM, MIN, MAX, NONE) y múltiples rangos de tiempo |
| **Filtros avanzados** | Selección de dispositivos, métricas, fases (sistema/fase), escalado automático de unidades |
| **Exportación** | Descarga de datos a Excel (.xlsx) directa desde los gráficos |
| **Multi-cliente** | Organización jerárquica: Grupos de clientes → Clientes → Assets → Dispositivos |
| **White-labeling** | Personalización completa de marca: nombre, logo, colores, fondo de login, favicon |
| **Página de ajustes** | Panel de administración con configuración general y de apariencia (solo TENANT_ADMIN) |
| **Guía de onboarding** | Documentación visual paso a paso para configurar ThingsBoard correctamente |
| **Autenticación JWT** | Login contra ThingsBoard, middleware de protección de rutas, refresco automático de token |
| **Responsivo** | Diseño adaptable a escritorio, tablet y móvil con sidebar colapsable |
| **Docker ready** | Dockerfile multi-stage optimizado + docker-compose con PostgreSQL |
| **Persistencia flexible** | PostgreSQL para producción o fallback a archivos JSON en disco |

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|------------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, React Compiler) |
| Lenguaje | TypeScript 5 |
| UI | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (Radix UI) |
| Gráficos | [amCharts 4](https://www.amcharts.com/) |
| Estado | [Zustand 5](https://zustand.docs.pmnd.rs/) |
| Backend IoT | [ThingsBoard](https://thingsboard.io/) (PE o CE) |
| Base de datos | [PostgreSQL 17](https://www.postgresql.org/) (opcional, via [postgres.js](https://github.com/porsager/postgres)) |
| Validación | [Zod 4](https://zod.dev/) |
| Autenticación | JWT (cookies httpOnly) |
| Contenedor | Docker (Bun para build, Node.js Alpine para runtime) |

---

## Arquitectura

```
┌─────────────┐       ┌──────────────┐       ┌──────────────────┐
│   Browser   │◄─────►│  Next.js App │◄─────►│   ThingsBoard    │
│  (React 19) │       │  (API Routes │       │   (REST API)     │
│             │       │   + SSR)     │       │                  │
└─────────────┘       └──────┬───────┘       └──────────────────┘
                             │
                    ┌────────┴────────┐
                    │  PostgreSQL 17  │  ← Opcional
                    │  (settings,     │    (fallback a archivos
                    │   archivos)     │     JSON en disco)
                    └─────────────────┘
```

**Flujo de datos:**

1. El usuario se autentica con credenciales de ThingsBoard → se obtiene un JWT que se almacena en cookie.
2. El middleware (`proxy.ts`) valida el JWT en cada request protegida.
3. Las API Routes del servidor consultan ThingsBoard usando el token del usuario.
4. El cliente renderiza gráficos con datos de telemetría usando amCharts 4.
5. La configuración de marca y ajustes se persisten en PostgreSQL (o archivos en disco como fallback).

---

## Requisitos previos

- **Node.js** ≥ 22 o **Bun** ≥ 1.0
- Una instancia de **ThingsBoard** accesible (Professional o Community Edition)
- **PostgreSQL 17** (opcional — sin base de datos la app funciona con archivos en disco)

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd lumen-ems
```

### 2. Instalar dependencias

```bash
# Con Bun (recomendado)
bun install

# O con npm
npm install
```

### 3. Configurar variables de entorno

```bash
cp .example.env .env.local
```

Edita `.env.local` con los valores de tu entorno (ver sección siguiente).

### 4. Ejecutar en desarrollo

```bash
bun dev
# o
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 5. Build de producción

```bash
bun run build
bun run start
```

---

## Variables de entorno

Copia `.env.example` como `.env.local` y completa los valores. A continuación se detalla cada variable:

### Obligatorias

| Variable | Descripción |
|----------|-------------|
| `TB_API` | URL base de la API de ThingsBoard (ej: `https://tb.example.com`). Usada del lado del servidor. |
| `NEXT_PUBLIC_TB_API` | Misma URL que `TB_API`. Se expone al cliente para llamadas directas (WebSocket, etc.). |
| `EMS_INDUSTRIES_GROUP_ID` | UUID del Entity Group de tipo Customer para clientes industriales. |
| `EMS_BILLING_GROUP_ID` | UUID del Entity Group de tipo Customer para clientes de facturación. |
| `EMS_MULTISITE_GROUP_ID` | UUID del Entity Group de tipo Customer para clientes multisitio. |

> **¿Dónde encuentro los Group IDs?**
> En ThingsBoard, navega a **Customers → Groups**, haz clic en el grupo y copia el UUID de la URL (o del detalle del grupo).

### Opcionales

| Variable | Default | Descripción |
|----------|---------|-------------|
| `DATABASE_URL` | — | Cadena de conexión PostgreSQL (ej: `postgres://user:pass@localhost:5432/lumen_ems`). Si se omite, la app usa almacenamiento en disco. |
| `DATA_DIR` | `/data` | Directorio para archivos JSON y uploads cuando no hay base de datos. En desarrollo puedes usar `./data`. |

### Ejemplo mínimo (sin base de datos)

```env
TB_API=https://thingsboard.miempresa.com
NEXT_PUBLIC_TB_API=https://thingsboard.miempresa.com
EMS_INDUSTRIES_GROUP_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
EMS_BILLING_GROUP_ID=b2c3d4e5-f6a7-8901-bcde-f12345678901
EMS_MULTISITE_GROUP_ID=c3d4e5f6-a7b8-9012-cdef-123456789012
DATA_DIR=./data
```

### Ejemplo completo (con PostgreSQL)

```env
TB_API=https://thingsboard.miempresa.com
NEXT_PUBLIC_TB_API=https://thingsboard.miempresa.com
EMS_INDUSTRIES_GROUP_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
EMS_BILLING_GROUP_ID=b2c3d4e5-f6a7-8901-bcde-f12345678901
EMS_MULTISITE_GROUP_ID=c3d4e5f6-a7b8-9012-cdef-123456789012
DATABASE_URL=postgres://lumen:secret@localhost:5432/lumen_ems
```

---

## Despliegue con Docker

El proyecto incluye un `Dockerfile` multi-stage optimizado y un `docker-compose.yml` con PostgreSQL.

### Usando docker-compose (recomendado)

```bash
# Crear archivo de entorno para Docker
cp .env.example .env

# Editar .env con tus valores (TB_API, Group IDs, etc.)
nano .env

# Levantar la aplicación + base de datos
docker compose up -d
```

Esto levanta:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `app` | 3000 | Aplicación Lumen EMS |
| `db` | 5432 | PostgreSQL 17 Alpine |

La base de datos se configura automáticamente con usuario `lumen`, contraseña `lumen` y base de datos `lumen_ems`. Los datos se persisten en volúmenes Docker (`pg-data` y `app-data`).

### Dockerfile standalone

```bash
# Build de la imagen
docker build \
  --build-arg NEXT_PUBLIC_TB_API=https://tb.example.com \
  -t lumen-ems .

# Ejecutar
docker run -p 3000:3000 \
  -e TB_API=https://tb.example.com \
  -e EMS_INDUSTRIES_GROUP_ID=... \
  -e EMS_BILLING_GROUP_ID=... \
  -e EMS_MULTISITE_GROUP_ID=... \
  -v lumen-data:/data \
  lumen-ems
```

> **Nota:** `NEXT_PUBLIC_TB_API` se debe pasar como build arg porque se inyecta en el bundle del cliente durante el build.

### Pipeline del Dockerfile

```
Stage 1 (deps)    → Bun: instala dependencias
Stage 2 (builder) → Bun: compila Next.js (output: standalone)
Stage 3 (runner)  → Node.js 22 Alpine: ejecuta server.js (~imagen final liviana)
```

---

## Guía de configuración de ThingsBoard

Para que Lumen EMS funcione correctamente, es necesario configurar ThingsBoard siguiendo una estructura jerárquica específica. La aplicación incluye una **guía visual interactiva** en `/onboarding` (accesible solo para administradores), pero aquí se resume el proceso completo.

### Estructura jerárquica

```
Customer Groups (EMS Industria, EMS Multisitio, EMS Facturación)
  └── Customers (clientes individuales)
        └── Asset Groups (compartidos con el customer)
              └── Assets (plantas, subestaciones, tableros, etc.)
                    └── Devices (medidores, sensores, etc.)
```

### Paso 1 — Crear grupos de clientes

En ThingsBoard → **Customers → Groups**, crea tres grupos:

| Grupo | Descripción |
|-------|-------------|
| **EMS Industria** | Clientes industriales |
| **EMS Multisitio** | Clientes con múltiples ubicaciones |
| **EMS Facturación** | Clientes con facturación |

Copia el UUID de cada grupo y configúralo en las variables de entorno correspondientes.

### Paso 2 — Agregar clientes

Dentro de cada grupo, agrega los clientes con el botón **Add Customer**. Completa nombre, correo y descripción.

> **Importante:** Debes compartir el *Customer Entity Group* con el cliente para que pueda visualizar sus recursos.

### Paso 3 — Configurar grupos de assets

1. Ve a **Assets → Groups** y crea un nuevo grupo de assets.
2. Comparte el grupo con el cliente correspondiente (botón **Share**) y asigna permisos.
3. Agrega los assets al grupo.
4. Para assets existentes, usa **Manage owner and groups** para asignarlos.

> **Importante:** Si un asset no pertenece al grupo compartido con el cliente, este no podrá visualizarlo.

### Paso 4 — Configurar dispositivos

Repite el proceso del paso 3 pero en **Devices → Groups**: crea un grupo, compártelo con el cliente y agrega los dispositivos.

### Paso 5 — Configurar relaciones

Las relaciones definen la jerarquía de la instalación:

```
Devices → Assets → Customer
```

#### 5.1 — Asset → Customer

Cada asset debe tener una relación **"Contains"** con su customer. Los assets también pueden relacionarse entre sí (ej: Planta → Subestación → Tablero).

**Atributos opcionales** en `Additional Info` del asset:

```json
{
  "name": "",         // Nombre personalizado (por defecto usa el del asset)
  "hasDevices": true  // false para assets sin dispositivos (oculta checkbox en UI)
}
```

#### 5.2 — Device → Asset

Cada dispositivo debe estar relacionado con al menos un asset. Un dispositivo puede pertenecer a varios assets.

**Atributos opcionales** en `Additional Info` de la relación:

```json
{
  "name": "",        // Nombre personalizado (por defecto usa el del dispositivo)
  "default": false   // true para que se muestre seleccionado en la primera carga
}
```

> **Nota:** Pueden existir assets relacionados entre sí para representar sub-niveles (Planta → Subestación → Tablero).

### Roles de usuario

| Scope | Rol | Permisos |
|-------|-----|----------|
| `TENANT_ADMIN` | Administrador | Acceso completo: ajustes, guía de configuración, todos los clientes |
| `CUSTOMER_USER` | Cliente | Solo ve sus propios assets y dispositivos |

---

## White-labeling (personalización de marca)

Los administradores (TENANT_ADMIN) pueden personalizar completamente la interfaz desde **Ajustes → Apariencia**:

| Opción | Descripción |
|--------|-------------|
| Nombre de la app | Aparece en el sidebar y en el título del navegador |
| Subtítulo | Texto secundario debajo del nombre en el sidebar |
| Título de página | Texto que aparece en la pestaña del navegador |
| Color primario | Color principal de la interfaz |
| Color de acento | Color secundario para acentos |
| Logo del sidebar | Logo que aparece en la barra lateral |
| Logo de login | Logo de la página de inicio de sesión |
| Fondo de login | Imagen de fondo de la pantalla de autenticación |
| Favicon | Ícono de la pestaña del navegador |

Los cambios se persisten en la base de datos (o en disco) y se aplican inmediatamente a todos los usuarios.

### Configuración general

Desde **Ajustes → General**, el administrador puede ver y gestionar:

- URL de la API de ThingsBoard
- IDs de los grupos de clientes
- Estado de la base de datos (PostgreSQL / archivo)
- Ejecutar migraciones de base de datos

---

## Estructura del proyecto

```
lumen-ems/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Layout y rutas de autenticación
│   │   └── auth/page.tsx         # Página de login
│   ├── (main)/                   # Layout y rutas principales (autenticadas)
│   │   ├── dashboard/page.tsx    # Dashboard principal
│   │   ├── settings/page.tsx     # Página de ajustes (TENANT_ADMIN)
│   │   └── onboarding/page.tsx   # Guía de configuración (TENANT_ADMIN)
│   └── api/                      # API Routes
│       ├── health/               # Health check
│       ├── settings/             # CRUD de ajustes
│       ├── files/                # Upload/descarga de archivos
│       └── setup/                # Migraciones de BD
│
├── components/                   # Componentes compartidos
│   ├── ui/                       # Primitivos shadcn/ui (Button, Input, Tabs, etc.)
│   ├── sidebar/                  # Sidebar con branding dinámico
│   └── filter-sidebar/           # Filtros de telemetría
│
├── features/                     # Módulos por dominio
│   ├── auth/                     # Autenticación (login, token provider)
│   ├── chart/                    # Gráficos (amCharts 4: línea, barra, pie, comparación)
│   ├── telemetry/                # Consultas de telemetría, hooks, tipos, utilidades
│   ├── asset/                    # Árbol de assets
│   ├── devices/                  # Dispositivos
│   └── customer/                 # Clientes
│
├── lib/                          # Capa de infraestructura
│   ├── config/env.ts             # Schema Zod de variables de entorno
│   ├── auth/                     # JWT, session store (Zustand), server actions
│   ├── branding/                 # Provider de marca + defaults
│   ├── db/                       # PostgreSQL + store con fallback a disco
│   ├── thingsboard/              # Cliente HTTP para ThingsBoard
│   └── services/                 # Tipos compartidos de API
│
├── public/                       # Archivos estáticos
│   ├── brand/                    # Logo por defecto
│   └── images/                   # Imágenes (login, onboarding)
│
├── proxy.ts                      # Middleware de autenticación
├── Dockerfile                    # Multi-stage: Bun (build) → Node.js Alpine (run)
├── docker-compose.yml            # App + PostgreSQL 17
├── .env.example                  # Plantilla de variables de entorno
└── package.json
```

---

## Métricas soportadas

La plataforma permite visualizar las siguientes categorías de telemetría:

| Categoría | Ejemplo de métricas |
|-----------|-------------------|
| Potencia activa | kW por fase y total |
| Energía activa | kWh acumulados |
| Voltaje | V por fase |
| Corriente | A por fase |
| Frecuencia | Hz |
| Factor de potencia | PF por fase y total |
| Potencia reactiva | kVAR por fase y total |
| Potencia aparente | kVA por fase y total |
| Energía exportada | kWh de exportación |
| Energía reactiva | kVARh |
| Energía aparente | kVAh |

Cada métrica soporta visualización por **fase individual** o por **sistema (trifásico)**, con agregaciones configurables (promedio, suma, mín, máx) y rangos de tiempo desde 1 día hasta 1 año.

---

## Convenciones

### Commits

Este proyecto sigue [Conventional Commits](https://www.conventionalcommits.org/):

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de errores |
| `docs:` | Cambios en documentación |
| `style:` | Cambios de formato (no afectan lógica) |
| `refactor:` | Refactorización de código |
| `test:` | Agregar o modificar tests |
| `chore:` | Tareas de mantenimiento |

### Código

- TypeScript estricto en todo el proyecto
- Componentes funcionales con React 19
- Estado global con Zustand (stores por dominio)
- Server Components por defecto, `"use client"` solo cuando es necesario
- Validación de datos con Zod

---

## Autor

**Axl Santos** — Ingeniero en Software

- GitHub: [@snthz](https://github.com/snthz)
- Email: axlsntz.dev@gmail.com

---

## Licencia

© 2019-2026 Lumen. Todos los derechos reservados.
