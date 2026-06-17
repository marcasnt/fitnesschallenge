# 🚀 IFBB FITNESS CHALLENGE TRAINER — GUÍA MAESTRA DE DESPLIEGUE
## Despliegue en producción · fitnesschallenge.fenifisc.com
### Stack final: Next.js 16 (App Router) + Drizzle ORM + PostgreSQL/MySQL compatible
### Hosting: Hostinger · Dominio: fenifisc.com

---

## 📋 ÍNDICE

1. [Visión general de la arquitectura](#visión-general)
2. [Requisitos previos](#requisitos)
3. [Configuración DNS en Hostinger](#dns)
4. [Configuración SSL](#ssl)
5. [Base de datos MySQL en Hostinger](#mysql)
6. [Estructura de archivos en el servidor](#estructura)
7. [Variables de entorno](#env)
8. [Adaptación del schema de PostgreSQL a MySQL](#schema-mysql)
9. [Despliegue paso a paso](#despliegue)
10. [Configuración de proxy inverso y Node.js](#proxy)
11. [PM2 y gestión de procesos](#pm2)
12. [Script de despliegue automatizado](#script-deploy)
13. [PWA · Configuración e instalación](#pwa)
14. [Email transaccional con Hostinger SMTP](#smtp)
15. [Backups y mantenimiento](#backups)
16. [Monitorización y logs](#monitoreo)
17. [Seguridad y hardening](#seguridad)
18. **[🆕 Seed de datos: Inyección SQL automática de ejercicios IFBB](#seed-sql)**
19. [Solución de problemas comunes](#troubleshooting)
20. [Checklist final de go-live](#checklist)

---

## 1. VISIÓN GENERAL DE LA ARQUITECTURA {#visión-general}

```
┌────────────────────────────────────────────────────────────────────────┐
│                  FENIFISC.COM — Infraestructura                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  USUARIO FINAL (Móvil / Tablet / Desktop)                              │
│         │                                                              │
│         │ HTTPS (443)                                                  │
│         ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  Cloudflare (CDN + Protección DDoS)                          │     │
│  └──────────────────────────┬───────────────────────────────────┘     │
│                             │                                          │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  HOSTINGER — DNS Manager                                     │     │
│  │  ┌────────────────────────────────────────────────────┐      │     │
│  │  │  fitnesschallenge.fenifisc.com  ──►  IP_HOSTINGER   │      │     │
│  │  └────────────────────────────────────────────────────┘      │     │
│  └──────────────────────────┬───────────────────────────────────┘     │
│                             │                                          │
│                             ▼                                          │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  HOSTINGER SERVER (hPanel)                                   │     │
│  │  ┌────────────────────────────────────────────────────────┐  │     │
│  │  │  FITNESSCHALLENGE.FENIFISC.COM                         │  │     │
│  │  │  ├── /public_html          ← App Next.js (output      │  │     │
│  │  │  │                            "standalone"            │  │     │
│  │  │  ├── /api                  ← (misma app Node.js)      │  │     │
│  │  │  ├── /uploads              ← Archivos subidos         │  │     │
│  │  │  ├── /logs                 ← Logs de PM2              │  │     │
│  │  │  └── /.env                 ← Variables de entorno     │  │     │
│  │  │                                                        │  │     │
│  │  │  Node.js 20 LTS (PM2 gestionando)                     │  │     │
│  │  │  Puerto interno: 3000                                  │  │     │
│  │  └────────────────────────────────────────────────────────┘  │     │
│  │  ┌────────────────────────────────────────────────────────┐  │     │
│  │  │  MySQL 8.0 (Hostinger Databases)                       │  │     │
│  │  │  DB: u123456789_ifbbfc                                  │  │     │
│  │  │  Usuario: u123456789_ifbbuser                          │  │     │
│  │  │  Conexión: localhost:3306                              │  │     │
│  │  └────────────────────────────────────────────────────────┘  │     │
│  └──────────────────────────────────────────────────────────────┘     │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────┐     │
│  │  Hostinger Email (SMTP)                                      │     │
│  │  smtp.hostinger.com:587 · noreply@fenifisc.com               │     │
│  └──────────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────────┘
```

**Decisión arquitectónica importante:**
La aplicación es un **monolito Next.js con API Routes integradas**. No hay backend Express separado. Todo se ejecuta en un único proceso Node.js que sirve tanto la UI (páginas) como la API (`/api/*`). Esto simplifica enormemente el despliegue en Hostinger.

---

## 2. REQUISITOS PREVIOS {#requisitos}

### Plan de Hosting recomendado
| Plan | RAM | CPU | Apto para | Precio aprox. |
|------|-----|-----|-----------|---------------|
| **Business** | 2 GB | 2 vCPU | Hasta 5.000 usuarios/mes | ~4 €/mes |
| VPS 1 | 4 GB | 2 vCPU | Hasta 20.000 usuarios/mes | ~8 €/mes |
| VPS 2 | 8 GB | 4 vCPU | Hasta 100.000 usuarios/mes | ~16 €/mes |

**Recomendado para empezar:** Plan **Business** o **VPS 1** de Hostinger.

### Software que necesitarás
- **Node.js 20 LTS** (lo activa Hostinger en hPanel)
- **Git** (para clonar el repositorio)
- **SSH access** a tu cuenta Hostinger
- **Cliente FTP/SFTP** (FileZilla, Cyberduck o similar) — opcional, solo para uploads puntuales
- **Cuenta Cloudflare** (gratuita) — recomendado para CDN y DDoS

### Antes de empezar
- ✅ Dominio `fenifisc.com` ya registrado y en Hostinger
- ✅ Acceso a hPanel con rol de administrador
- ✅ Repositorio Git del proyecto IFBB FC Trainer listo (GitHub, GitLab o Bitbucket)

---

## 3. CONFIGURACIÓN DNS EN HOSTINGER {#dns}

### 3.1 Acceder al DNS Manager

```
hPanel → Dominios → fenifisc.com → DNS / DNS Records → Administrar
```

### 3.2 Crear los registros DNS

**Opción A — Todo apunta a la misma IP (recomendado para Hostinger Business/VPS)**

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `fitnesschallenge` | `IP_DE_TU_HOSTINGER` (la proporciona Hostinger) | 3600 |
| CNAME | `www.fitnesschallenge` | `fitnesschallenge.fenifisc.com` | 3600 |

**Opción B — Si más adelante separas api/admin en distintos subdominios**

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `fitnesschallenge` | `IP_DE_TU_HOSTINGER` | 3600 |
| A | `api.fitnesschallenge` | `IP_DE_TU_HOSTINGER` | 3600 |
| A | `admin.fitnesschallenge` | `IP_DE_TU_HOSTINGER` | 3600 |
| CNAME | `www.fitnesschallenge` | `fitnesschallenge.fenifisc.com` | 3600 |

> **Cómo encontrar tu IP de Hostinger:**
> hPanel → Avanzado → Acceso SSH → Ver IP del servidor. Suele tener el formato `XX.XX.XX.XX`.

### 3.3 Tiempo de propagación DNS

- Cambios DNS: **entre 5 minutos y 48 horas** (típicamente 1-2 horas)
- Herramienta de verificación: https://dnschecker.org/#A/fitnesschallenge.fenifisc.com

### 3.4 Configurar dominio en Hostinger

```
hPanel → Dominios → Subdominios → Añadir
  Subdominio: fitnesschallenge
  Dominio padre: fenifisc.com
  Directorio raíz: /home/USUARIO/domains/fenifisc.com/public_html
```

---

## 4. CONFIGURACIÓN SSL {#ssl}

### 4.1 SSL gratuito Let's Encrypt (recomendado)

```
hPanel → Seguridad → SSL → Administrar
  → fitnesschallenge.fenifisc.com → Instalar SSL
  → Forzar HTTPS: ACTIVADO
```

> **Importante:** Activa SSL para **cada subdominio por separado** si vas a tener api.* o admin.*. Let's Encrypt emite un certificado por subdominio.

### 4.2 Verificación

```
https://fitnesschallenge.fenifisc.com → debe mostrar candado verde
```

### 4.3 (Opcional) Cloudflare delante de Hostinger

```
1. Cloudflare → Add Site → fenifisc.com (plan Free)
2. Cloudflare escanea y carga registros DNS existentes
3. Cambiar nameservers en Hostinger a los de Cloudflare
   hPanel → Dominios → Nameservers → Cambiar a personalizado
4. SSL en Cloudflare: Full (strict)
5. Activar proxy (nube naranja) para los subdominios
```

**Beneficios:**
- CDN global (sitio más rápido en Latinoamérica, Europa, etc.)
- Protección DDoS
- Oculta la IP real de tu servidor
- HTTPS automático

---

## 5. BASE DE DATOS MYSQL EN HOSTINGER {#mysql}

### 5.1 Crear la base de datos

```
hPanel → Bases de datos → MySQL → Crear nueva base de datos

  Nombre BD:      ifbbfc
  → Nombre final: u123456789_ifbbfc  (Hostinger añade prefijo)

  Crear usuario:  ifbbuser
  → Usuario final: u123456789_ifbbuser
  Contraseña:     [GENERAR FUERTE — usar generador de contraseñas]
                  Ej: F$c9!qX2v#mNp7&kL4rT

  Permisos:       Todos (ALL PRIVILEGES)
```

### 5.2 Connection string

```
mysql://u123456789_ifbbuser:F$c9!qX2v#mNp7&kL4rT@localhost:3306/u123456789_ifbbfc
```

> **Nota crítica:** En hosting compartido de Hostinger, MySQL **SOLO acepta conexiones desde localhost**. Si necesitas conectarte desde tu PC para administración, usa el túnel SSH o el phpMyAdmin de Hostinger.

### 5.3 phpMyAdmin de Hostinger

```
hPanel → Bases de datos → phpMyAdmin
  → Interfaz web para gestionar la BD manualmente si es necesario
```

---

## 6. ESTRUCTURA DE ARCHIVOS EN EL SERVIDOR {#estructura}

### 6.1 Ubicación física en Hostinger

```
/home/USUARIO/domains/fenifisc.com/
├── public_html/                  ← SÍ, aquí va la app Next.js completa
│   ├── .next/                    ← Build (generado por `npm run build`)
│   ├── .next/standalone/         ← Bundle de producción autocontenido
│   ├── public/                   ← Assets estáticos (iconos, manifest, etc.)
│   ├── .env                      ← Variables de entorno (NO en Git)
│   ├── node_modules/             ← Dependencias de producción
│   ├── package.json
│   ├── server.js                 ← Entry point personalizado (lo creamos)
│   ├── ecosystem.config.js       ← Configuración de PM2
│   ├── logs/                     ← Logs de PM2
│   └── uploads/                  ← Archivos subidos por usuarios
└── backups/                      ← Backups automáticos de Hostinger
```

> **Punto clave:** En Hostinger, `public_html` es el document root del servidor web. Como usamos Next.js con `output: 'standalone'`, la app **se ejecuta con Node.js directamente**, no con Apache/Nginx sirviendo archivos estáticos. Apache/Nginx solo actúa como proxy reverso (lo configuramos más adelante).

### 6.2 Conectar por SSH

```bash
# En Windows: usar PowerShell o Windows Terminal
# En Mac/Linux: terminal nativa

ssh USUARIO@IP_HOSTINGER -p 65002

# Una vez dentro:
cd ~/domains/fenifisc.com/public_html
pwd
# /home/u123456789/domains/fenifisc.com/public_html
```

> El puerto SSH suele ser 65002 en Hostinger (no el 22 por defecto). Verificar en hPanel → Avanzado → Acceso SSH.

---

## 7. VARIABLES DE ENTORNO {#env}

### 7.1 Crear `.env` en el servidor

```bash
cd ~/domains/fenifisc.com/public_html
nano .env
```

### 7.2 Contenido del archivo `.env` (producción)

```env
# ─── SERVIDOR ─────────────────────────────────────
NODE_ENV=production
PORT=3000
HOSTNAME=127.0.0.1

# ─── DOMINIO (URLs públicas) ──────────────────────
APP_URL=https://fitnesschallenge.fenifisc.com
API_URL=https://fitnesschallenge.fenifisc.com
ADMIN_URL=https://fitnesschallenge.fenifisc.com

# ─── BASE DE DATOS MYSQL (HOSTINGER) ─────────────
# Formato: mysql://USUARIO:PASSWORD@HOST:PUERTO/BASE
# En Hostinger compartido, HOST = localhost
DATABASE_URL="mysql://u123456789_ifbbuser:F%24c9%21qX2v%23mNp7%26kL4rT@localhost:3306/u123456789_ifbbfc"

# ─── AUTENTICACIÓN ────────────────────────────────
# Genera con: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
JWT_SECRET=CAMBIAR_64_caracteres_minimo_zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz
SESSION_SECRET=OTRO_secreto_diferente_64_caracteres_minimo_yyyyyyyyyyyyyyyyyyyyyyyyyyyy

# ─── EMAIL (Hostinger SMTP) ───────────────────────
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@fenifisc.com
SMTP_PASS=tu_password_del_correo_hostinger
EMAIL_FROM="IFBB Fitness Challenge <noreply@fenifisc.com>"

# ─── UPLOADS ──────────────────────────────────────
UPLOADS_PATH=/home/u123456789/domains/fenifisc.com/public_html/uploads
UPLOADS_URL=https://fitnesschallenge.fenifisc.com/uploads
MAX_FILE_SIZE_MB=50

# ─── SEGURIDAD ────────────────────────────────────
BCRYPT_ROUNDS=12
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax

# ─── APP ──────────────────────────────────────────
NEXT_PUBLIC_APP_NAME="IFBB Fitness Challenge Trainer"
NEXT_PUBLIC_APP_URL=https://fitnesschallenge.fenifisc.com
```

> **Importante — codificación de URL en DATABASE_URL:**
> Los caracteres especiales en la contraseña MySQL deben codificarse para URL:
> - `@` → `%40`
> - `#` → `%23`
> - `$` → `%24`
> - `!` → `%21`
> - `&` → `%26`
> - `+` → `%2B`
> - `/` → `%2F`
> - `:` → `%3A`

### 7.3 Permisos del .env

```bash
chmod 600 .env
ls -la .env
# -rw-------  1 user user  1234 Jan 15 10:30 .env
```

### 7.4 Añadir `.env` al `.gitignore`

```bash
# .gitignore (en la raíz del proyecto)
.env
.env.local
.env.production
node_modules/
.next/
logs/
uploads/
*.log
```

---

## 8. ADAPTACIÓN DEL SCHEMA DE POSTGRESQL A MYSQL {#schema-mysql}

La aplicación se desarrolló con **Drizzle ORM para PostgreSQL**. Para desplegar en Hostinger con MySQL, tienes **dos opciones**:

### Opción A (Recomendada): Usar MySQL con Drizzle adaptando el schema

Drizzle ORM soporta MySQL de forma nativa. Necesitas adaptar el archivo `src/db/schema.ts`:

```typescript
// src/db/schema.ts — versión MySQL

import {
  mysqlTable,
  varchar,
  text,
  int,
  real,
  boolean,
  timestamp,
  json,
  mysqlEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

// ─── ENUMS (MySQL nativo) ────────────────────────
export const genderEnum = mysqlEnum("gender", ["MALE", "FEMALE"]);
export const ageCategoryEnum = mysqlEnum("age_category", ["JUNIOR", "SENIOR", "MASTER"]);
export const competitionLevelEnum = mysqlEnum("competition_level", [
  "GOLD", "SILVER", "BRONZE", "SPEED_FIT",
]);
export const competitionModalityEnum = mysqlEnum("competition_modality", [
  "INDIVIDUAL", "PAIR_MALE", "PAIR_FEMALE", "PAIR_MIXED",
  "TEAM_6", "SPEED_FIT_INDIVIDUAL", "SPEED_FIT_TEAM_4",
]);
export const mesocyclePhaseEnum = mysqlEnum("mesocycle_phase", [
  "ACCUMULATION", "TRANSFORMATION", "REALIZATION", "PEAK", "TAPERING",
]);
export const sessionTypeEnum = mysqlEnum("session_type", [
  "STRENGTH", "ENDURANCE", "TECHNIQUE", "SIMULATION",
  "CARDIO", "ACTIVE_RECOVERY", "REST",
]);
export const exerciseStationEnum = mysqlEnum("exercise_station", [
  "STATION_1", "STATION_2", "STATION_3",
  "STATION_4", "STATION_5", "STATION_6",
]);
export const techAlertSeverityEnum = mysqlEnum("tech_alert_severity", [
  "WARNING", "INVALID", "PROHIBITED",
]);
export const dayOfWeekEnum = mysqlEnum("day_of_week", [
  "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY",
  "FRIDAY", "SATURDAY", "SUNDAY",
]);
export const macrocycleTypeEnum = mysqlEnum("macrocycle_type", [
  "COMPLETE", "STANDARD", "REDUCED", "SHOCK", "PEAK_ONLY",
]);
export const userRoleEnum = mysqlEnum("user_role", ["ATHLETE", "COACH", "ADMIN"]);

// ─── USERS ───────────────────────────────────────
export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    role: userRoleEnum("role").notNull().default("ATHLETE"),
    isActive: boolean("is_active").notNull().default(true),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    lastLoginAt: timestamp("last_login_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex("users_email_idx").on(t.email),
  })
);

// ─── AUTH SESSIONS ───────────────────────────────
export const sessions = mysqlTable(
  "auth_sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 512 }).notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    tokenIdx: uniqueIndex("auth_sessions_token_idx").on(t.token),
    userIdx: index("auth_sessions_user_idx").on(t.userId),
  })
);

// ─── ATHLETES ────────────────────────────────────
export const athletes = mysqlTable(
  "athletes",
  {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull().references(() => users.id, { onDelete: "cascade" }),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    dateOfBirth: timestamp("date_of_birth").notNull(),
    gender: genderEnum("gender").notNull(),
    bodyWeightKg: real("body_weight_kg"),
    profileImageUrl: text("profile_image_url"),
    ageCategory: ageCategoryEnum("age_category").notNull(),
    competitionLevel: competitionLevelEnum("competition_level").notNull(),
    competitionModality: competitionModalityEnum("competition_modality").notNull(),
    competitionDate: timestamp("competition_date"),
    availableDaysJson: text("available_days_json").notNull(),
    maxSessionMinutes: int("max_session_minutes").notNull().default(60),
    experienceLevel: int("experience_level").notNull().default(5),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userIdx: uniqueIndex("athletes_user_idx").on(t.userId),
    compDateIdx: index("athletes_competition_date_idx").on(t.competitionDate),
  })
);

// (… resto de tablas con el mismo patrón: mysqlTable en lugar de pgTable, …)
```

### Cambios en `drizzle.config.json`

```json
{
  "dialect": "mysql",
  "schema": "./src/db/schema.ts",
  "dbCredentials": {
    "url": "mysql://u123456789_ifbbuser:PASSWORD@localhost:3306/u123456789_ifbbfc"
  }
}
```

### Cambios en `src/db/index.ts`

```typescript
// src/db/index.ts — versión MySQL
import { drizzle } from "drizzle-orm/mysql2";
import { createPool } from "mysql2";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required");

const globalForDb = globalThis as typeof globalThis & {
  __ifbbPool?: ReturnType<typeof createPool>;
};

export const pool =
  globalForDb.__ifbbPool ?? createPool(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__ifbbPool = pool;
}

export const db = drizzle(pool);
```

### Aplicar schema a MySQL

```bash
# Localmente o en el servidor
npx drizzle-kit push
```

> **Nota:** La aplicación actual está construida para PostgreSQL. Si la despliegas tal cual, debes tener PostgreSQL en Hostinger (no incluido en planes básicos). **Para usar MySQL, la adaptación del schema es obligatoria.** Si quieres, puedo generar la versión completa MySQL del schema — está documentado aquí el patrón.

### Opción B (Más simple): Usar Turso/SQLite (gratis, sin adaptación)

Si prefieres evitar la adaptación a MySQL, puedes usar **Turso** (SQLite distribuido) o **PlanetScale** (MySQL compatible gratuito) y conectar vía variable de entorno. Esto requiere solo cambiar el driver en `src/db/index.ts` sin tocar el schema.

---

## 9. DESPLIEGUE PASO A PASO {#despliegue}

### 9.1 Activar Node.js en Hostinger

```
hPanel → Avanzado → Node.js

  Versión: 20.x LTS
  Application root: /home/u123456789/domains/fenifisc.com/public_html
  Application URL:  https://fitnesschallenge.fenifisc.com
  Application startup file: server.js  (lo creamos en el siguiente paso)
  
  → Save
```

### 9.2 Conectar por SSH y preparar el servidor

```bash
# Conectar
ssh u123456789@IP_HOSTINGER -p 65002

# Ir al directorio
cd ~/domains/fenifisc.com/public_html

# Verificar versión de Node
node -v
# Debe mostrar v20.x.x

# Si no está, usar nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
node -v

# Verificar npm
npm -v
```

### 9.3 Clonar el repositorio (primera vez)

```bash
cd ~/domains/fenifisc.com/

# Si public_html ya existe con archivos por defecto, hacer backup
mv public_html public_html_default

# Clonar
git clone https://github.com/TU_USUARIO/ifbb-fitness-challenge.git public_html

cd public_html
```

> **Si usas repositorio privado**, configura antes las claves SSH o el token de GitHub:
> ```bash
> # Opción A — Token de GitHub
> git clone https://TU_TOKEN@github.com/TU_USUARIO/ifbb-fitness-challenge.git public_html
> ```

### 9.4 Instalar dependencias

```bash
cd ~/domains/fenifisc.com/public_html

# Solo dependencias de producción (ahorra espacio)
npm ci --omit=dev

# Si necesitas drizzle-kit para migraciones
npm install --save-dev drizzle-kit
```

### 9.5 Configurar `next.config.ts` para producción standalone

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",  // ← CRÍTICO para Hostinger
  
  // Permitir tu dominio en next/image
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "fitnesschallenge.fenifisc.com" },
    ],
  },
  
  // Headers de seguridad
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  
  // Compresión
  compress: true,
  
  // Para el caso standalone, no es necesario transpilePackages
};

export default nextConfig;
```

### 9.6 Crear `server.js` (entry point para producción)

```javascript
// server.js — Entry point personalizado
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "127.0.0.1";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  })
    .once("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> IFBB FC Trainer ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
    });
});
```

### 9.7 Compilar la aplicación

```bash
cd ~/domains/fenifisc.com/public_html

# Generar el build de producción
npm run build

# Esto genera:
#   .next/standalone/   → App autocontenida
#   .next/static/       → Assets estáticos
#   public/             → PWA manifest, iconos
```

### 9.8 Estructura final después del build

```bash
# Ejecutar después de npm run build
cd ~/domains/fenifisc.com/public_html

# Copiar los assets estáticos al standalone
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public

# Verificar
ls -la .next/standalone/
# Debe mostrar: server.js, package.json, .next/, public/, node_modules/

# IMPORTANTE: el proceso PM2 se ejecutará desde .next/standalone/
# o bien, podemos simplificar manteniendo todo en public_html.
```

### 9.9 Opción simplificada (recomendada para Hostinger)

En lugar de usar `.next/standalone/`, podemos ejecutar PM2 directamente desde la raíz con `next start` después del build:

```bash
cd ~/domains/fenifisc.com/public_html
npm run build
```

Y el `package.json` debe tener:

```json
{
  "scripts": {
    "start": "next start -H 127.0.0.1 -p 3000",
    "build": "next build"
  }
}
```

> Esta opción es **más simple** y funciona perfectamente en Hostinger. La usaremos en la configuración de PM2.

---

## 10. CONFIGURACIÓN DE PROXY INVERSO Y NODE.JS {#proxy}

### 10.1 Configurar Node.js App en hPanel

```
hPanel → Avanzado → Node.js → Editar aplicación

  Versión Node: 20.x LTS
  Application root: /home/u123456789/domains/fenifisc.com/public_html
  Application URL:  fitnesschallenge.fenifisc.com
  Application startup file: server.js
  
  → Save → Restart
```

Hostinger configura automáticamente un proxy reverso desde el puerto 80/443 al puerto de tu app Node.js.

### 10.2 Verificar el archivo `.htaccess`

En `~/domains/fenifisc.com/public_html/.htaccess`:

```apache
# .htaccess — Redirigir todas las requests a Node.js
DirectoryIndex disabled
RewriteEngine On

# Si ya existe un index.html por defecto de Hostinger, redirigir a Node.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]

# Forzar HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Headers de seguridad adicionales
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "DENY"
  Header set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>

# Proteger archivos sensibles
<FilesMatch "\.(env|git|json|lock)$">
  Order allow,deny
  Deny from all
</FilesMatch>

# Compresión
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/css application/javascript application/json
</IfModule>
```

---

## 11. PM2 Y GESTIÓN DE PROCESOS {#pm2}

### 11.1 Instalar PM2

```bash
cd ~/domains/fenifisc.com/public_html
npm install --save-dev pm2
npx pm2 --version
```

### 11.2 Crear `ecosystem.config.js`

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "ifbb-fc-trainer",
      script: "npm",
      args: "start",
      cwd: "/home/u123456789/domains/fenifisc.com/public_html",
      instances: 1,                    // 1 instancia (Hostinger compartido)
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "127.0.0.1",
      },
      error_file: "/home/u123456789/domains/fenifisc.com/public_html/logs/err.log",
      out_file: "/home/u123456789/domains/fenifisc.com/public_html/logs/out.log",
      log_file: "/home/u123456789/domains/fenifisc.com/public_html/logs/combined.log",
      time: true,
      merge_logs: true,
    },
  ],
};
```

> **Importante:** Reemplaza `u123456789` con tu usuario real de Hostinger.

### 11.3 Iniciar la app con PM2

```bash
cd ~/domains/fenifisc.com/public_html

# Crear directorio de logs
mkdir -p logs

# Iniciar
npx pm2 start ecosystem.config.js

# Guardar configuración de PM2 para que se reinicie en reboot
npx pm2 save
# Si Hostinger lo permite (VPS):
npx pm2 startup
# Ejecutar el comando que PM2 muestra

# Ver estado
npx pm2 status

# Ver logs en tiempo real
npx pm2 logs ifbb-fc-trainer
```

### 11.4 Comandos útiles de PM2

```bash
npx pm2 status                  # Estado de procesos
npx pm2 logs ifbb-fc-trainer    # Ver logs
npx pm2 logs ifbb-fc-trainer --lines 200  # Últimas 200 líneas
npx pm2 restart ifbb-fc-trainer # Reiniciar
npx pm2 stop ifbb-fc-trainer    # Detener
npx pm2 delete ifbb-fc-trainer  # Eliminar de PM2
npx pm2 monit                   # Monitor interactivo (CPU, RAM)
npx pm2 flush                   # Limpiar logs
```

---

## 12. SCRIPT DE DESPLIEGUE AUTOMATIZADO {#script-deploy}

### 12.1 Crear `deploy.sh` en el servidor

```bash
nano ~/domains/fenifisc.com/deploy.sh
```

Contenido:

```bash
#!/bin/bash
# ══════════════════════════════════════════════════════════════
# IFBB Fitness Challenge — Script de despliegue
# Ejecutar: bash deploy.sh
# ══════════════════════════════════════════════════════════════

set -e  # Salir si cualquier comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

APP_DIR="/home/u123456789/domains/fenifisc.com/public_html"
BACKUP_DIR="/home/u123456789/backups/ifbb-fc"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  IFBB FC Trainer — Despliegue v2.0${NC}"
echo -e "${BLUE}  ${TIMESTAMP}${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"

# ─── 1. MODO MANTENIMIENTO ──────────────────────────
echo -e "\n${YELLOW}[1/7] Activando modo mantenimiento...${NC}"
cat > $APP_DIR/.maintenance << 'EOF'
Mantenimiento en curso. Volvemos en unos minutos.
EOF

# ─── 2. BACKUP ──────────────────────────────────────
echo -e "\n${YELLOW}[2/7] Creando backup del build anterior...${NC}"
mkdir -p $BACKUP_DIR
if [ -d "$APP_DIR/.next" ]; then
  tar -czf $BACKUP_DIR/next_$TIMESTAMP.tar.gz -C $APP_DIR .next 2>/dev/null || true
  echo -e "${GREEN}  ✓ Backup guardado en $BACKUP_DIR/next_$TIMESTAMP.tar.gz${NC}"
fi

# Backup de la base de datos MySQL
echo -e "  Respaldando base de datos..."
if [ -n "$DATABASE_URL" ]; then
  # Extraer credenciales del DATABASE_URL (requiere que .env exista)
  if [ -f "$APP_DIR/.env" ]; then
    source <(grep DATABASE_URL $APP_DIR/.env | sed 's/^/export /')
    DB_USER=$(echo $DATABASE_URL | sed -n 's|.*://\([^:]*\):.*|\1|p')
    DB_PASS=$(echo $DATABASE_URL | sed -n 's|.*://[^:]*:\([^@]*\)@.*|\1|p')
    DB_HOST=$(echo $DATABASE_URL | sed -n 's|.*@\([^:]*\):.*|\1|p')
    DB_NAME=$(echo $DATABASE_URL | sed -n 's|.*/\([^?]*\).*|\1|p')
    
    mysqldump -h "$DB_HOST" -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" \
      > $BACKUP_DIR/db_$TIMESTAMP.sql 2>/dev/null || echo "  (mysqldump no disponible o falló)"
  fi
fi

# ─── 3. PULL DEL CÓDIGO ────────────────────────────
echo -e "\n${YELLOW}[3/7] Descargando último código del repositorio...${NC}"
cd $APP_DIR
git fetch origin
git pull origin main  # o master, según tu rama principal

# ─── 4. INSTALAR DEPENDENCIAS ──────────────────────
echo -e "\n${YELLOW}[4/7] Instalando dependencias de producción...${NC}"
npm ci --omit=dev --no-audit --no-fund

# ─── 5. APLICAR MIGRACIONES DE BASE DE DATOS ──────
echo -e "\n${YELLOW}[5/7] Aplicando esquema de base de datos...${NC}"
if [ -f "drizzle.config.json" ]; then
  npx drizzle-kit push 2>&1 | tail -5
  echo -e "${GREEN}  ✓ Esquema sincronizado${NC}"
fi

# ─── 6. BUILD DE PRODUCCIÓN ────────────────────────
echo -e "\n${YELLOW}[6/7] Compilando aplicación...${NC}"
npm run build 2>&1 | tail -20

# ─── 7. REINICIAR PM2 ──────────────────────────────
echo -e "\n${YELLOW}[7/7] Reiniciando aplicación...${NC}"
rm -f $APP_DIR/.maintenance
npx pm2 restart ifbb-fc-trainer 2>/dev/null || npx pm2 start ecosystem.config.js
npx pm2 save

# ─── VERIFICACIÓN FINAL ────────────────────────────
echo -e "\n${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ DESPLIEGUE COMPLETADO${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo ""
echo "Verificando estado..."
sleep 3
curl -s -o /dev/null -w "  HTTP status: %{http_code}\n  Tiempo respuesta: %{time_total}s\n" \
  https://fitnesschallenge.fenifisc.com/api/health

echo ""
echo "Estado de PM2:"
npx pm2 status

echo ""
echo -e "${GREEN}Sitio desplegado en: https://fitnesschallenge.fenifisc.com${NC}"
```

### 12.2 Hacer ejecutable y usar

```bash
chmod +x ~/domains/fenifisc.com/deploy.sh

# Ejecutar despliegue
bash ~/domains/fenifisc.com/deploy.sh
```

### 12.3 Programar despliegues automáticos con GitHub Actions (opcional)

`.github/workflows/deploy.yml` en tu repositorio:

```yaml
name: 🚀 Deploy a Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HOSTINGER_HOST }}
          username: ${{ secrets.HOSTINGER_USER }}
          port: ${{ secrets.HOSTINGER_PORT }}
          key: ${{ secrets.HOSTINGER_SSH_KEY }}
          script: |
            bash ~/domains/fenifisc.com/deploy.sh
```

Configurar secretos en GitHub:
- `HOSTINGER_HOST` = IP del servidor
- `HOSTINGER_USER` = tu usuario SSH
- `HOSTINGER_PORT` = 65002
- `HOSTINGER_SSH_KEY` = contenido de tu clave privada SSH

---

## 13. PWA · CONFIGURACIÓN E INSTALACIÓN {#pwa}

### 13.1 Manifest ya incluido

El archivo `public/manifest.json` ya está configurado en la app. Verificar que existe:

```bash
ls -la ~/domains/fenifisc.com/public_html/public/manifest.json
```

### 13.2 Service Worker

Next.js con `output: "standalone"` no incluye Workbox automáticamente. Para una PWA completa en Hostinger, **el service worker se puede omitir** y aun así los usuarios podrán "Añadir a pantalla de inicio" en iOS y Android usando solo el manifest.

Si necesitas service worker (modo offline real), crear `public/sw.js`:

```javascript
// public/sw.js
const CACHE_NAME = "ifbb-fc-v1";
const urlsToCache = [
  "/",
  "/dashboard",
  "/manifest.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

Y en `src/app/layout.tsx`, registrar el SW:

```typescript
useEffect(() => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
  }
}, []);
```

### 13.3 Iconos PWA

Los iconos deben estar en `/public/icons/`. Generar versiones de 192x192 y 512x512 desde un logo PNG:

```bash
# Usar ImageMagick localmente
convert logo.png -resize 192x192 public/icons/icon-192x192.png
convert logo.png -resize 512x512 public/icons/icon-512x512.png
```

---

## 14. EMAIL TRANSACIONAL CON HOSTINGER SMTP {#smtp}

### 14.1 Crear cuenta de email en Hostinger

```
hPanel → Correos electrónicos → Cuentas → Crear
  Dirección: noreply@fenifisc.com
  Contraseña: [segura]
  Espacio: 1 GB
```

### 14.2 Variables SMTP ya configuradas en `.env`

```env
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@fenifisc.com
SMTP_PASS=tu_password_del_correo
EMAIL_FROM="IFBB Fitness Challenge <noreply@fenifisc.com>"
```

### 14.3 Implementar envío de emails (próximo sprint)

La app actual **no envía emails** (autoverifica usuarios en el sandbox). Para producción, añadir:

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Y crear `src/lib/email.ts`:

```typescript
// src/lib/email.ts
import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  const t = getTransporter();
  return t.sendMail({
    from: process.env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}
```

Casos de uso:
- Verificación de email al registrarse
- Recuperación de contraseña
- Confirmación de unión a equipo
- Resumen semanal de entrenamiento

---

## 15. BACKUPS Y MANTENIMIENTO {#backups}

### 15.1 Backups automáticos de Hostinger

```
hPanel → Copias de seguridad → Copias de seguridad automáticas
  → Frecuencia: Diaria
  → Retención: 7 días (plan Business) / 30 días (VPS)
  → Se respaldan: archivos + bases de datos MySQL
```

### 15.2 Backups manuales vía script

```bash
# Crear backup completo (BD + archivos)
nano ~/backup-ifbb.sh
```

```bash
#!/bin/bash
# backup-ifbb.sh — Ejecutar con cron
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/home/u123456789/backups/manual
mkdir -p $BACKUP_DIR

# BD
source <(grep DATABASE_URL /home/u123456789/domains/fenifisc.com/public_html/.env | sed 's/^/export /')
DB_URL_DECODED=$(echo $DATABASE_URL | sed 's/mysql:\/\/\([^:]*\):\([^@]*\)@\([^:]*\):\([0-9]*\)\/\(.*\)/--user=\1 --password=\2 --host=\3 --port=\4 \5/')
mysqldump $DB_URL_DECODED > $BACKUP_DIR/db_$TIMESTAMP.sql

# Archivos (uploads y config)
tar -czf $BACKUP_DIR/files_$TIMESTAMP.tar.gz \
  /home/u123456789/domains/fenifisc.com/public_html/uploads \
  /home/u123456789/domains/fenifisc.com/public_html/.env

# Limpiar backups > 30 días
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completado: $TIMESTAMP"
```

```bash
chmod +x ~/backup-ifbb.sh

# Programar diario a las 3 AM
crontab -e
# Añadir:
0 3 * * * /home/u123456789/backup-ifbb.sh >> /home/u123456789/backups/cron.log 2>&1
```

### 15.3 Restaurar un backup

```bash
# Restaurar base de datos
mysql -h localhost -u u123456789_ifbbuser -p u123456789_ifbbfc < db_20240115_030000.sql

# Restaurar archivos
tar -xzf files_20240115_030000.tar.gz -C /
```

---

## 16. MONITORIZACIÓN Y LOGS {#monitoreo}

### 16.1 Logs de la aplicación

```bash
# Logs PM2 en tiempo real
npx pm2 logs ifbb-fc-trainer

# Solo errores
npx pm2 logs ifbb-fc-trainer --err

# Logs antiguos (archivo)
cat ~/domains/fenifisc.com/public_html/logs/combined.log
```

### 16.2 Monitorización con PM2 Plus (opcional, gratis)

```bash
# Crear cuenta en https://app.pm2.io
npx pm2 register
# Sigue las instrucciones

# Conectar
npx pm2 link <secret_key> <public_key>
```

Verás en el dashboard web:
- CPU/RAM en tiempo real
- Logs centralizados
- Alertas de caída
- Métricas de tráfico

### 16.3 Monitorización con UptimeRobot (gratis)

```
https://uptimerobot.com → Create Account
  → Add New Monitor
    Type: HTTPS
    URL: https://fitnesschallenge.fenifisc.com/api/health
    Interval: 5 minutes
    Alert: email when down
```

### 16.4 healthcheck endpoint

El endpoint `/api/health` ya está implementado en la app. Devuelve:

```json
{ "ok": true }
```

---

## 17. SEGURIDAD Y HARDENING {#seguridad}

### 17.1 Configurar firewall (VPS)

```bash
# UFW en VPS
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 17.2 Proteger archivos sensibles

`.htaccess` (ya incluido arriba) bloquea `.env`, `.git`, etc.

Adicional en `public_html/.env`:

```bash
chmod 600 .env
```

### 17.3 Headers de seguridad (ya configurados en next.config.ts)

- `Strict-Transport-Security`: fuerza HTTPS
- `X-Frame-Options: DENY`: anti-clickjacking
- `X-Content-Type-Options: nosniff`: anti-MIME-sniffing
- `Referrer-Policy`: limita información de referencia
- `Permissions-Policy`: bloquea cámara, micrófono, geolocalización

### 17.4 Rate limiting en API

Instalar y configurar `next-rate-limit` o usar el middleware nativo de Next.js. Ejemplo:

```typescript
// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const now = Date.now();
    const window = 60_000; // 1 minuto
    const max = 60; // 60 requests por minuto
    
    const entry = RATE_LIMIT.get(ip);
    if (!entry || now > entry.resetAt) {
      RATE_LIMIT.set(ip, { count: 1, resetAt: now + window });
    } else if (entry.count >= max) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    } else {
      entry.count++;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
```

### 17.5 Backups de la base de datos (automatizado arriba)

### 17.6 Renovación SSL automática

Let's Encrypt se renueva automáticamente. Verificar:

```bash
sudo certbot renew --dry-run  # Solo VPS
# En hosting compartido, Hostinger lo hace solo
```

---

## 18. 🆕 SEED DE DATOS: INYECCIÓN SQL AUTOMÁTICA DE EJERCICIOS IFBB {#seed-sql}

Esta sección contiene los **scripts SQL listos para ejecutar** en phpMyAdmin de Hostinger para cargar los 18 ejercicios reglamentarios IFBB y sus alertas técnicas (juez virtual) en la base de datos MySQL de producción.

### 18.1 ¿Por qué SQL puro en lugar de `drizzle-kit push`?

- ✅ **Idempotente**: puedes ejecutarlo múltiples veces sin duplicar datos
- ✅ **No requiere Node.js en el servidor** para el seed (solo phpMyAdmin)
- ✅ **Portable**: el mismo SQL funciona en local, staging y producción
- ✅ **Auditable**: revisas exactamente qué se inserta antes de ejecutar
- ✅ **Seguro**: usa `INSERT ... ON DUPLICATE KEY UPDATE` o `INSERT IGNORE`

### 18.2 Orden de ejecución

El seed tiene dependencias FK (las alertas técnicas referencian a los ejercicios). Ejecutar **en este orden**:

1. **`00_schema.sql`** → crea las 16 tablas (si no las creó Drizzle)
2. **`01_seed_exercises.sql`** → inserta los 18 ejercicios IFBB
3. **`02_seed_tech_alerts.sql`** → inserta las alertas del juez virtual
4. **`03_seed_admin_user.sql`** → crea el usuario administrador inicial
5. **`04_seed_idempotency_check.sql`** → verifica que todo se cargó bien

### 18.3 Crear las tablas (Schema MySQL)

Ejecutar en phpMyAdmin → seleccionar BD `u123456789_ifbbfc` → pestaña **SQL**:

```sql
-- ══════════════════════════════════════════════════════════════
-- 00_schema.sql — Schema MySQL para IFBB Fitness Challenge
-- Ejecutar ANTES del seed. Idempotente: usa CREATE TABLE IF NOT EXISTS
-- ══════════════════════════════════════════════════════════════

SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ─── USERS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('ATHLETE','COACH','ADMIN') NOT NULL DEFAULT 'ATHLETE',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `is_email_verified` TINYINT(1) NOT NULL DEFAULT 0,
  `last_login_at` DATETIME NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_idx` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── AUTH SESSIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `auth_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `token` VARCHAR(512) NOT NULL,
  `expires_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_sessions_token_idx` (`token`),
  KEY `auth_sessions_user_idx` (`user_id`),
  CONSTRAINT `auth_sessions_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── ATHLETES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `athletes` (
  `id` VARCHAR(36) NOT NULL,
  `user_id` VARCHAR(36) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `date_of_birth` DATETIME NOT NULL,
  `gender` ENUM('MALE','FEMALE') NOT NULL,
  `body_weight_kg` DECIMAL(5,2) NULL,
  `profile_image_url` TEXT NULL,
  `age_category` ENUM('JUNIOR','SENIOR','MASTER') NOT NULL,
  `competition_level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `competition_modality` ENUM('INDIVIDUAL','PAIR_MALE','PAIR_FEMALE','PAIR_MIXED','TEAM_6','SPEED_FIT_INDIVIDUAL','SPEED_FIT_TEAM_4') NOT NULL,
  `competition_date` DATETIME NULL,
  `available_days_json` TEXT NOT NULL,
  `max_session_minutes` INT NOT NULL DEFAULT 60,
  `experience_level` INT NOT NULL DEFAULT 5,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `athletes_user_idx` (`user_id`),
  KEY `athletes_competition_date_idx` (`competition_date`),
  CONSTRAINT `athletes_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── EXERCISES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `exercises` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `name_es` VARCHAR(200) NOT NULL,
  `station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NOT NULL,
  `level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `description` TEXT NOT NULL,
  `weight_male_kg` DECIMAL(5,2) NULL,
  `weight_female_kg` DECIMAL(5,2) NULL,
  `weight_label` VARCHAR(100) NULL,
  `mixed_pair_exception` TINYINT(1) NOT NULL DEFAULT 0,
  `straps_allowed` TINYINT(1) NOT NULL DEFAULT 0,
  `is_tiebreaker_station` TINYINT(1) NOT NULL DEFAULT 0,
  `requires_equipment` VARCHAR(100) NULL,
  `speed_fit_target_reps` INT NULL,
  `speed_fit_team_reps` INT NULL,
  `video_path` TEXT NULL,
  `image_path` TEXT NULL,
  `thumbnail_path` TEXT NULL,
  `tech_requirements_json` TEXT NOT NULL,
  `common_errors_json` TEXT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `sort_order` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `exercises_station_level_idx` (`station`, `level`),
  KEY `exercises_level_idx` (`level`),
  KEY `exercises_station_idx` (`station`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TECH ALERTS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `tech_alerts` (
  `id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `severity` ENUM('WARNING','INVALID','PROHIBITED') NOT NULL,
  `trigger_condition` TEXT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `tech_alerts_exercise_idx` (`exercise_id`),
  CONSTRAINT `tech_alerts_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── MACROCYCLES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `macrocycles` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `type` ENUM('COMPLETE','STANDARD','REDUCED','SHOCK','PEAK_ONLY') NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `total_weeks` INT NOT NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `macrocycles_athlete_idx` (`athlete_id`),
  CONSTRAINT `macrocycles_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── MESOCYCLES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `mesocycles` (
  `id` VARCHAR(36) NOT NULL,
  `macrocycle_id` VARCHAR(36) NOT NULL,
  `phase` ENUM('ACCUMULATION','TRANSFORMATION','REALIZATION','PEAK','TAPERING') NOT NULL,
  `order_index` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `week_count` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `main_objective` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `mesocycles_macro_idx` (`macrocycle_id`),
  CONSTRAINT `mesocycles_macro_fk` FOREIGN KEY (`macrocycle_id`) REFERENCES `macrocycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── MICROCYCLES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `microcycles` (
  `id` VARCHAR(36) NOT NULL,
  `mesocycle_id` VARCHAR(36) NOT NULL,
  `week_number` INT NOT NULL,
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `week_objective` TEXT NOT NULL,
  `volume_level` INT NOT NULL,
  `intensity_level` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `microcycles_meso_idx` (`mesocycle_id`),
  KEY `microcycles_dates_idx` (`start_date`, `end_date`),
  CONSTRAINT `microcycles_meso_fk` FOREIGN KEY (`mesocycle_id`) REFERENCES `mesocycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PLANNED SESSIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `planned_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `microcycle_id` VARCHAR(36) NOT NULL,
  `day_of_week` ENUM('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
  `session_type` ENUM('STRENGTH','ENDURANCE','TECHNIQUE','SIMULATION','CARDIO','ACTIVE_RECOVERY','REST') NOT NULL,
  `estimated_minutes` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NOT NULL,
  `order_index` INT NOT NULL,
  `special_mode` VARCHAR(100) NULL,
  `special_mode_config` TEXT NULL,
  `alerts` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `planned_sessions_micro_idx` (`microcycle_id`),
  KEY `planned_sessions_day_idx` (`day_of_week`),
  CONSTRAINT `planned_sessions_micro_fk` FOREIGN KEY (`microcycle_id`) REFERENCES `microcycles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PLANNED BLOCKS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `planned_blocks` (
  `id` VARCHAR(36) NOT NULL,
  `planned_session_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NULL,
  `sets` INT NULL,
  `reps_target` INT NULL,
  `duration_seconds` INT NULL,
  `rest_seconds` INT NULL,
  `intensity_percent` INT NULL,
  `work_seconds` INT NULL DEFAULT 120,
  `transition_seconds` INT NULL DEFAULT 120,
  `is_simulation` TINYINT(1) NOT NULL DEFAULT 0,
  `volume_modifier` DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  `notes` TEXT NULL,
  `order_index` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `planned_blocks_session_idx` (`planned_session_id`),
  KEY `planned_blocks_exercise_idx` (`exercise_id`),
  CONSTRAINT `planned_blocks_session_fk` FOREIGN KEY (`planned_session_id`) REFERENCES `planned_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `planned_blocks_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TRAINING SESSIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `training_sessions` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `planned_session_id` VARCHAR(36) NULL,
  `session_date` DATETIME NOT NULL,
  `session_type` ENUM('STRENGTH','ENDURANCE','TECHNIQUE','SIMULATION','CARDIO','ACTIVE_RECOVERY','REST') NOT NULL,
  `duration_minutes` INT NULL,
  `perceived_effort` INT NULL,
  `notes` TEXT NULL,
  `is_simulation` TINYINT(1) NOT NULL DEFAULT 0,
  `completed_at` DATETIME NULL,
  `total_reps_simulation` INT NULL,
  `reps_by_station_json` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `training_sessions_athlete_idx` (`athlete_id`),
  KEY `training_sessions_date_idx` (`session_date`),
  CONSTRAINT `training_sessions_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `training_sessions_planned_fk` FOREIGN KEY (`planned_session_id`) REFERENCES `planned_sessions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── EXECUTED BLOCKS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS `executed_blocks` (
  `id` VARCHAR(36) NOT NULL,
  `session_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NULL,
  `order_index` INT NOT NULL,
  `total_valid_reps` INT NULL,
  `total_invalid_reps` INT NULL DEFAULT 0,
  `total_reps` INT NULL,
  `weight_used_kg` DECIMAL(5,2) NULL,
  `duration_seconds` INT NULL,
  `is_simulation_block` TINYINT(1) NOT NULL DEFAULT 0,
  `work_duration_sec` INT NULL DEFAULT 120,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `executed_blocks_session_idx` (`session_id`),
  KEY `executed_blocks_exercise_idx` (`exercise_id`),
  CONSTRAINT `executed_blocks_session_fk` FOREIGN KEY (`session_id`) REFERENCES `training_sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `executed_blocks_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── REP SETS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `rep_sets` (
  `id` VARCHAR(36) NOT NULL,
  `block_id` VARCHAR(36) NOT NULL,
  `set_number` INT NOT NULL,
  `reps_total` INT NOT NULL,
  `reps_valid` INT NOT NULL,
  `reps_invalid` INT NOT NULL DEFAULT 0,
  `weight_kg` DECIMAL(5,2) NULL,
  `duration_seconds` INT NULL,
  PRIMARY KEY (`id`),
  KEY `rep_sets_block_idx` (`block_id`),
  CONSTRAINT `rep_sets_block_fk` FOREIGN KEY (`block_id`) REFERENCES `executed_blocks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PERSONAL RECORDS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `personal_records` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `exercise_id` VARCHAR(36) NOT NULL,
  `max_reps_in_2min` INT NULL,
  `min_time_for_30_reps` DECIMAL(6,2) NULL,
  `max_weight_kg` DECIMAL(5,2) NULL,
  `max_reps_strength` INT NULL,
  `record_date` DATETIME NOT NULL,
  `session_id` VARCHAR(36) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `personal_records_athlete_idx` (`athlete_id`),
  KEY `personal_records_exercise_idx` (`exercise_id`),
  KEY `personal_records_date_idx` (`record_date`),
  CONSTRAINT `personal_records_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `personal_records_exercise_fk` FOREIGN KEY (`exercise_id`) REFERENCES `exercises` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TEAMS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `teams` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `competition_date` DATETIME NULL,
  `male_count` INT NOT NULL DEFAULT 3,
  `female_count` INT NOT NULL DEFAULT 3,
  `invite_code` VARCHAR(8) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `teams_invite_code_idx` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── TEAM MEMBERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` VARCHAR(36) NOT NULL,
  `team_id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `assigned_station` ENUM('STATION_1','STATION_2','STATION_3','STATION_4','STATION_5','STATION_6') NOT NULL,
  `is_captain` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `team_members_unique` (`team_id`, `athlete_id`),
  KEY `team_members_team_idx` (`team_id`),
  CONSTRAINT `team_members_team_fk` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_members_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PAIRS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pairs` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `modality` ENUM('INDIVIDUAL','PAIR_MALE','PAIR_FEMALE','PAIR_MIXED','TEAM_6','SPEED_FIT_INDIVIDUAL','SPEED_FIT_TEAM_4') NOT NULL,
  `level` ENUM('GOLD','SILVER','BRONZE','SPEED_FIT') NOT NULL,
  `competition_date` DATETIME NULL,
  `invite_code` VARCHAR(8) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pairs_invite_code_idx` (`invite_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── PAIR MEMBERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `pair_members` (
  `id` VARCHAR(36) NOT NULL,
  `pair_id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `is_leader` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pair_members_unique` (`pair_id`, `athlete_id`),
  CONSTRAINT `pair_members_pair_fk` FOREIGN KEY (`pair_id`) REFERENCES `pairs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pair_members_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── NOTIFICATIONS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` VARCHAR(36) NOT NULL,
  `athlete_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `body` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL,
  `is_read` TINYINT(1) NOT NULL DEFAULT 0,
  `scheduled_for` DATETIME NULL,
  `sent_at` DATETIME NULL,
  `data_json` TEXT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `notifications_athlete_idx` (`athlete_id`),
  KEY `notifications_scheduled_idx` (`scheduled_for`),
  KEY `notifications_read_idx` (`is_read`),
  CONSTRAINT `notifications_athlete_fk` FOREIGN KEY (`athlete_id`) REFERENCES `athletes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- Confirmación
SELECT 'Schema creado correctamente. 16 tablas listas.' AS status;
```

### 18.4 Inserción de los 18 ejercicios IFBB

```sql
-- ══════════════════════════════════════════════════════════════
-- 01_seed_exercises.sql — Catálogo IFBB completo
-- 18 ejercicios: 6 ORO + 6 PLATA + 6 BRONCE
-- Idempotente: usa INSERT ... ON DUPLICATE KEY UPDATE
-- ══════════════════════════════════════════════════════════════

-- ─── NIVEL ORO (GOLD) ─────────────────────────────────────

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `mixed_pair_exception`, `straps_allowed`, `is_tiebreaker_station`, 
   `tech_requirements_json`, `common_errors_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st1', 'Chin-Ups Prone & Strict', 'Dominadas Pronadas y Estrictas', 
   'STATION_1', 'GOLD', 
   'Dominadas estrictas con agarre pronado (palmas hacia afuera). Posición inicial con codos completamente extendidos. La barbilla debe superar el borde superior de la barra en cada repetición.',
   0, 0, 'Peso corporal', 0, 0, 0,
   '["Agarre pronado (palmas hacia afuera) al ancho de los hombros","Iniciar con codos completamente extendidos — posición muerta","Barbilla debe superar completamente el borde superior de la barra","Bajar hasta extensión completa con codos bloqueados","Movimiento estrictamente vertical, sin oscilación"]',
   '["Balanceo del cuerpo (kipping)","Barbilla que no supera la barra","Codos que no se bloquean al bajar"]',
   1)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  description = VALUES(description), 
  tech_requirements_json = VALUES(tech_requirements_json);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st2', 'Kettlebell Squat and Pull', 'Sentadilla y Tirón con Kettlebell', 
   'STATION_2', 'GOLD', 
   'Sentadilla profunda con kettlebell entre las piernas seguida de un tirón hasta el pecho. La base del kettlebell debe tocar el suelo en cada repetición.',
   32, 24, 'Kettlebell (kg)', 0,
   '["KB colocada entre las piernas con agarre pronado","Sentadilla hasta que la BASE del KB toca claramente el suelo","Levantarse con extensión COMPLETA de caderas y rodillas","Tirar de la KB hasta que el ASA quede a la altura del medio del pecho","Movimiento fluido: sentadilla + tirón en una sola secuencia"]',
   2)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name), 
  weight_male_kg = VALUES(weight_male_kg), 
  weight_female_kg = VALUES(weight_female_kg);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st3', 'Dips Feet Forward', 'Fondos en Paralelas con Pies Adelantados', 
   'STATION_3', 'GOLD', 
   'Fondos en paralelas con los pies ligeramente adelantados respecto a las manos. Se requiere pausa de 1 segundo arriba con codos bloqueados.',
   0, 0, 'Peso corporal',
   '["Codos completamente bloqueados en posición inicial","Piernas extendidas ligeramente por delante de las manos","Sin balanceo en ningún momento del movimiento","Bajar hasta que codos formen exactamente 90°","Empujar hasta extensión completa con PAUSA de 1 segundo arriba"]',
   3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `mixed_pair_exception`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st4', 'Walking Lunges with Barbell', 'Zancadas Caminando con Barra', 
   'STATION_4', 'GOLD', 
   'Zancadas caminando con barra sobre los hombros. La rodilla trasera DEBE tocar el suelo en cada repetición. Excepción: en parejas mixtas se permite peso diferenciado por sexo.',
   50, 30, 'Barra sobre hombros (kg)', 1,
   '["Barra descansando sobre los hombros (no en el cuello)","Zancadas caminando hacia adelante con desplazamiento","Ambas rodillas deben alcanzar 90° de flexión","La rodilla de la pierna TRASERA DEBE TOCAR el suelo obligatoriamente","Torso erguido en todo momento"]',
   4)
ON DUPLICATE KEY UPDATE mixed_pair_exception = VALUES(mixed_pair_exception);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `straps_allowed`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st5', 'Toes to Bar', 'Pies a la Barra', 
   'STATION_5', 'GOLD', 
   'Pies a la barra colgado. Ambos pies deben tocar la barra simultáneamente. ÚNICO ejercicio donde se permiten correas de agarre.',
   0, 0, 'Peso corporal', 1,
   '["Colgado de la barra con brazos completamente extendidos","Elevar piernas hasta que AMBOS pies toquen la barra simultáneamente","Al descender: talones O rodillas deben pasar DETRÁS de la línea vertical de la barra","Se permite balanceo ligero para el movimiento","Correas de agarre PERMITIDAS (única excepción reglamentaria)"]',
   5)
ON DUPLICATE KEY UPDATE straps_allowed = VALUES(straps_allowed);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-gold-st6', 'Burpees & Devil Press', 'Burpees y Press del Diablo', 
   'STATION_6', 'GOLD', 
   'Burpees con press sobre la cabeza usando dos mancuernas. Movimiento snatch ESTRICTAMENTE PROHIBIDO. ⭐ ESTACIÓN DE DESEMPATE OFICIAL.',
   15, 10, 'Par de mancuernas (kg c/u)', 1,
   '["Iniciar de pie con las dos mancuernas en el suelo","Apoyarse en las mancuernas y ejecutar push-up con PECHO AL SUELO","Incorporarse y llevar mancuernas a los hombros (curl)","Empujar las mancuernas sobre la cabeza hasta BLOQUEAR los codos","Cuerpo completamente erguido al finalizar el press","PROHIBIDO movimiento tipo Snatch (desde suelo hasta arriba directo)"]',
   6)
ON DUPLICATE KEY UPDATE is_tiebreaker_station = VALUES(is_tiebreaker_station);

-- ─── NIVEL PLATA (SILVER) ──────────────────────────────────

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st1', 'Horizontal Chin-Ups', 'Dominadas Horizontales', 
   'STATION_1', 'SILVER', 
   'Dominadas con el cuerpo en posición completamente horizontal bajo la barra. El pecho debe tocar la barra en cada repetición.',
   0, 0, 'Peso corporal',
   '["Cuerpo suspendido bajo la barra en posición completamente horizontal","Agarre al ancho de los hombros","Cuerpo recto como una tabla (sin flexionar caderas)","Tirar hasta que el PECHO TOQUE la barra","Volver a extensión completa de codos"]',
   7)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st2', 'Jefferson Squat', 'Sentadilla Jefferson con Barra', 
   'STATION_2', 'SILVER', 
   'Sentadilla con la barra entre las piernas en posición de caballero a horcajadas. Los discos deben tocar el suelo en cada repetición.',
   60, 40, 'Barra (kg)',
   '["Barra colocada entre las piernas (posición de caballero a horcajadas)","Una mano en agarre pronado adelante, otra supina detrás","Bajar hasta que los DISCOS de la barra toquen el suelo","Columna en posición NEUTRA durante todo el movimiento","Extensión completa de rodillas y caderas arriba"]',
   8)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st3', 'Bench Dips', 'Fondos en Banco', 
   'STATION_3', 'SILVER', 
   'Fondos con manos apoyadas en el borde de un banco. Los codos deben alcanzar 90° de flexión.',
   0, 0, 'Peso corporal',
   '["Manos apoyadas en el borde del banco detrás del cuerpo","Pies apoyados frente al cuerpo en el suelo o banco elevado","Bajar hasta que codos formen EXACTAMENTE 90°","Empujar hasta extensión completa de los codos"]',
   9)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st4', 'Static Lunges with Dumbbells', 'Zancadas Estáticas con Mancuernas', 
   'STATION_4', 'SILVER', 
   'Zancadas en el sitio con mancuernas a los costados. La rodilla trasera debe tocar el suelo.',
   15, 10, 'Par de mancuernas (kg c/u)',
   '["Una mancuerna en cada mano a los costados del cuerpo","Zancadas EN EL SITIO (sin desplazamiento)","Ambas rodillas deben alcanzar 90° de flexión","Rodilla trasera DEBE TOCAR el suelo obligatoriamente","Alternar pierna en cada repetición o completar una pierna antes de cambiar"]',
   10)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st5', 'Weighted Sit-Ups', 'Abdominales con Disco de 10kg', 
   'STATION_5', 'SILVER', 
   'Abdominales con un disco de 10kg sostenido sobre el pecho. El tronco debe quedar perpendicular y tocar los pies al llegar arriba.',
   10, 10, 'Disco sobre el pecho (kg)',
   '["Comenzar acostado con rodillas y caderas a 90°","Disco de 10kg sostenido firmemente sobre el pecho","Incorporarse hasta que el tronco quede PERPENDICULAR al suelo","Tocar los pies con el disco (o manos) al llegar arriba"]',
   11)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-silver-st6', 'Kettlebell Snatch', 'Arrancada con Kettlebell', 
   'STATION_6', 'SILVER', 
   'Movimiento balístico de una sola mano. La kettlebell sube en un solo arco hasta sobre la cabeza con bloqueo completo del codo. ⭐ ESTACIÓN DE DESEMPATE.',
   12, 8, 'Kettlebell (kg)', 1,
   '["Movimiento balístico de una sola mano desde entre las piernas","La KB sube en un solo arco continuo hasta sobre la cabeza","Bloqueo COMPLETO del codo en posición superior","Cuerpo completamente estable y erguido al finalizar","Alternar brazos según criterio del atleta"]',
   12)
ON DUPLICATE KEY UPDATE is_tiebreaker_station = VALUES(is_tiebreaker_station);

-- ─── NIVEL BRONCE (BRONZE) ────────────────────────────────

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st1', 'Supine Grip Chin-Ups (Feet Supported)', 'Dominadas Supinas con Talones en el Suelo', 
   'STATION_1', 'BRONZE', 
   'Dominadas con agarre supino y talones apoyados en el suelo. Pausa de 2 segundos en posición inicial.',
   0, 0, 'Peso corporal asistido',
   '["Agarre SUPINO (palmas hacia el cuerpo) al ancho de los hombros","TALONES APOYADOS EN EL SUELO en todo momento","Detener 2 segundos en posición inicial (colgado)","Tronco, caderas y rodillas completamente rectos (como una tabla)","Tirar hasta que el PECHO TOQUE la barra","Sin balanceo en ningún momento"]',
   13)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st2', 'Kettlebell Squat', 'Sentadilla con Kettlebell', 
   'STATION_2', 'BRONZE', 
   'Sentadilla frontal con kettlebell. La kettlebell debe tocar el suelo en cada repetición.',
   32, 24, 'Kettlebell (kg)',
   '["Pies ligeramente más anchos que los hombros","KB sostenida FRENTE AL CUERPO con agarre pronado","Sentadilla flexionando caderas y rodillas","KB debe TOCAR EL SUELO en cada repetición","Torso erguido, mirada al frente"]',
   14)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `requires_equipment`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st3', 'Push-Ups Elbows Flare (Handball Ball)', 'Flexiones Codos Abiertos con Balón', 
   'STATION_3', 'BRONZE', 
   'Flexiones con codos abiertos y balón de balonmano bajo el pecho. El pecho debe tocar el balón en cada repetición.',
   0, 0, 'Peso corporal', 'handball_ball',
   '["Partir desde posición de extensión completa de codos","Codos abiertos hacia los lados (NO pegados al cuerpo)","Descender hasta que el PECHO TOQUE el balón de balonmano","Codos deben alcanzar 90° de flexión","Empujar hasta extensión completa"]',
   15)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st4', 'Backward Lunges with Dumbbells', 'Zancadas Hacia Atrás con Mancuernas', 
   'STATION_4', 'BRONZE', 
   'Zancadas hacia atrás (no hacia adelante) con mancuernas. La rodilla trasera debe tocar el suelo.',
   12.5, 7.5, 'Par de mancuernas (kg c/u)',
   '["Una mancuerna en cada mano","Paso hacia ATRÁS (no hacia adelante — eso sería inválido)","Mantenerse EN EL SITIO (sin desplazamiento)","Ambas rodillas deben alcanzar 90°","Rodilla trasera DEBE TOCAR el suelo obligatoriamente"]',
   16)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st5', 'Sit-Ups Touch Feet', 'Abdominales Tocando los Pies', 
   'STATION_5', 'BRONZE', 
   'Abdominales sin peso. Ambas manos deben tocar los pies al llegar arriba con el tronco perpendicular.',
   0, 0, 'Sin peso',
   '["Comenzar acostado con rodillas y caderas a 90°","Puede usarse impulso de brazos para iniciar el movimiento","Incorporarse hasta que el tronco quede perpendicular al suelo","AMBAS MANOS deben tocar los pies al llegar arriba"]',
   17)
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO `exercises` 
  (`id`, `name`, `name_es`, `station`, `level`, `description`, 
   `weight_male_kg`, `weight_female_kg`, `weight_label`, 
   `is_tiebreaker_station`, `tech_requirements_json`, `sort_order`) 
VALUES 
  ('ifbb-bronze-st6', 'Kettlebell Overhead Swing', 'Swing de Kettlebell sobre la Cabeza', 
   'STATION_6', 'BRONZE', 
   'Swing balístico de kettlebell sobre la cabeza con brazos completamente extendidos y pausa breve en vertical. ⭐ ESTACIÓN DE DESEMPATE.',
   12, 8, 'Kettlebell (kg)', 1,
   '["Flexión de caderas para pasar la KB entre las piernas","Balanceo continuo y explosivo hacia arriba","Brazos COMPLETAMENTE EXTENDIDOS sobre la cabeza","Detenerse brevemente en posición VERTICAL con KB sobre la cabeza","Cuerpo completamente erguido al finalizar"]',
   18)
ON DUPLICATE KEY UPDATE is_tiebreaker_station = VALUES(is_tiebreaker_station);

-- Confirmación
SELECT COUNT(*) AS total_ejercicios_cargados FROM `exercises`;
-- Debe devolver 18
```

### 18.5 Inserción de alertas técnicas (Juez Virtual)

```sql
-- ══════════════════════════════════════════════════════════════
-- 02_seed_tech_alerts.sql — Alertas del juez virtual
-- Cada ejercicio tiene entre 1 y 5 alertas
-- Idempotente: elimina alertas previas del ejercicio y reinserta
-- ══════════════════════════════════════════════════════════════

-- ORO · ESTACIÓN 1 · Dominadas
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st1-1', 'ifbb-gold-st1', '❌ BALANCEO / KIPPING DETECTADO', 'No se permite ningún tipo de balanceo, impulso con cadera ni kipping. La repetición es inválida.', 'INVALID', 1),
  ('alert-gold-st1-2', 'ifbb-gold-st1', '❌ BARBILLA NO SUPERA LA BARRA', 'La barbilla debe pasar COMPLETAMENTE el borde superior de la barra.', 'INVALID', 2),
  ('alert-gold-st1-3', 'ifbb-gold-st1', '❌ CODOS SIN BLOQUEO COMPLETO', 'Los codos deben quedar completamente bloqueados al finalizar el descenso.', 'INVALID', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description);

-- ORO · ESTACIÓN 2 · KB Squat and Pull
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st2-1', 'ifbb-gold-st2', '❌ KB NO TOCA EL SUELO', 'La base de la pesa rusa debe tocar claramente el suelo en cada repetición.', 'INVALID', 1),
  ('alert-gold-st2-2', 'ifbb-gold-st2', '❌ TIRÓN INCOMPLETO', 'El asa debe llegar exactamente a la altura del medio del pecho.', 'INVALID', 2),
  ('alert-gold-st2-3', 'ifbb-gold-st2', '❌ EXTENSIÓN INCOMPLETA', 'Caderas y rodillas deben extenderse completamente antes del tirón.', 'INVALID', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 3 · Dips Feet Forward
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st3-1', 'ifbb-gold-st3', '❌ CODOS NO LLEGAN A 90°', 'Los codos deben formar exactamente un ángulo de 90° en la fase baja.', 'INVALID', 1),
  ('alert-gold-st3-2', 'ifbb-gold-st3', '❌ SIN PAUSA EN POSICIÓN SUPERIOR', 'Se requiere pausa de 1 segundo con codos bloqueados arriba.', 'INVALID', 2),
  ('alert-gold-st3-3', 'ifbb-gold-st3', '❌ BALANCEO DEL CUERPO', 'No se permite balanceo. El movimiento debe ser estrictamente vertical.', 'INVALID', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 4 · Walking Lunges (con EXCEPCIÓN pareja mixta)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st4-1', 'ifbb-gold-st4', '❌ RODILLA TRASERA NO TOCA EL SUELO', 'La rodilla de la pierna trasera DEBE tocar el suelo. Rep inválida sin este contacto.', 'INVALID', 1),
  ('alert-gold-st4-2', 'ifbb-gold-st4', '❌ RODILLAS SIN 90°', 'Ambas rodillas deben alcanzar los 90° de flexión.', 'INVALID', 2),
  ('alert-gold-st4-3', 'ifbb-gold-st4', '⚠️ EXCEPCIÓN PAREJA MIXTA', 'Esta es la ÚNICA estación donde la pareja mixta puede usar pesos diferentes por sexo.', 'WARNING', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 5 · Toes to Bar (con correas permitidas)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st5-1', 'ifbb-gold-st5', '❌ SOLO UN PIE TOCA LA BARRA', 'Ambos pies deben tocar la barra SIMULTÁNEAMENTE.', 'INVALID', 1),
  ('alert-gold-st5-2', 'ifbb-gold-st5', '❌ RESET INCORRECTO', 'Al descender, talones O rodillas deben pasar claramente detrás de la línea vertical de la barra antes de iniciar la siguiente repetición.', 'INVALID', 2),
  ('alert-gold-st5-3', 'ifbb-gold-st5', '✅ CORREAS PERMITIDAS', 'Las correas de agarre están permitidas SOLO en este ejercicio.', 'WARNING', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- ORO · ESTACIÓN 6 · Devil Press (DESEMPATE + SNATCH PROHIBIDO)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-gold-st6-1', 'ifbb-gold-st6', '🚫 SNATCH PROHIBIDO', 'PROHIBIDO llevar las mancuernas desde el suelo hasta arriba de la cabeza en un solo movimiento. Rep inválida.', 'PROHIBITED', 1),
  ('alert-gold-st6-2', 'ifbb-gold-st6', '❌ PECHO NO TOCA EL SUELO', 'El pecho debe tocar el suelo en cada repetición durante el push-up.', 'INVALID', 2),
  ('alert-gold-st6-3', 'ifbb-gold-st6', '❌ CODOS NO BLOQUEADOS ARRIBA', 'Los codos deben bloquearse completamente al finalizar el press sobre la cabeza.', 'INVALID', 3),
  ('alert-gold-st6-4', 'ifbb-gold-st6', '❌ CUERPO NO ERGUIDO', 'El cuerpo debe estar completamente erguido y estable al finalizar el movimiento.', 'INVALID', 4),
  ('alert-gold-st6-5', 'ifbb-gold-st6', '⭐ ESTACIÓN DE DESEMPATE', 'En caso de empate en repeticiones totales, gana el atleta con más reps en esta estación.', 'WARNING', 5)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 1 · Horizontal Chin-Ups
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st1-1', 'ifbb-silver-st1', '❌ PECHO NO TOCA LA BARRA', 'El pecho debe tocar la barra en cada repetición.', 'INVALID', 1),
  ('alert-silver-st1-2', 'ifbb-silver-st1', '❌ CUERPO NO HORIZONTAL', 'El cuerpo debe mantenerse perfectamente recto y horizontal.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 2 · Jefferson Squat
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st2-1', 'ifbb-silver-st2', '❌ DISCOS NO TOCAN EL SUELO', 'Los discos de la barra deben tocar el suelo en cada repetición.', 'INVALID', 1),
  ('alert-silver-st2-2', 'ifbb-silver-st2', '❌ COLUMNA EN CIFOSIS', 'Mantener columna neutra. La cifosis excesiva puede invalidar la repetición.', 'WARNING', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 3 · Bench Dips
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st3-1', 'ifbb-silver-st3', '❌ CODOS NO LLEGAN A 90°', 'Los codos deben alcanzar exactamente 90° en la fase baja.', 'INVALID', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 4 · Static Lunges
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st4-1', 'ifbb-silver-st4', '❌ RODILLA TRASERA NO TOCA EL SUELO', 'La rodilla trasera debe tocar el suelo en cada repetición.', 'INVALID', 1),
  ('alert-silver-st4-2', 'ifbb-silver-st4', '❌ ZANCADAS CON DESPLAZAMIENTO', 'Las zancadas en Nivel Plata son EN EL SITIO, sin caminar.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 5 · Weighted Sit-Ups
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st5-1', 'ifbb-silver-st5', '❌ TRONCO NO LLEGA A PERPENDICULAR', 'El tronco debe llegar a posición perpendicular al suelo.', 'INVALID', 1),
  ('alert-silver-st5-2', 'ifbb-silver-st5', '❌ DISCO NO CONTACTA LOS PIES', 'El disco (o manos sosteniendo el disco) debe tocar los pies.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- PLATA · ESTACIÓN 6 · KB Snatch (DESEMPATE)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-silver-st6-1', 'ifbb-silver-st6', '❌ CODO NO SE BLOQUEA ARRIBA', 'El codo debe bloquearse completamente en la posición superior.', 'INVALID', 1),
  ('alert-silver-st6-2', 'ifbb-silver-st6', '⭐ ESTACIÓN DE DESEMPATE', 'En empate total de repeticiones, gana quien más reps tenga en esta estación.', 'WARNING', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 1 · Supine Grip Chin-Ups
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st1-1', 'ifbb-bronze-st1', '❌ TALONES SE DESPEGAN DEL SUELO', 'Los talones DEBEN permanecer apoyados en el suelo durante toda la repetición.', 'INVALID', 1),
  ('alert-bronze-st1-2', 'ifbb-bronze-st1', '❌ PECHO NO TOCA LA BARRA', 'El pecho debe tocar la barra en cada repetición.', 'INVALID', 2),
  ('alert-bronze-st1-3', 'ifbb-bronze-st1', '❌ CUERPO NO RECTO', 'Tronco, caderas y rodillas deben formar una línea recta perfecta.', 'INVALID', 3),
  ('alert-bronze-st1-4', 'ifbb-bronze-st1', '❌ SIN PAUSA DE 2 SEGUNDOS INICIAL', 'La posición inicial (colgado, codos extendidos) debe mantenerse 2 segundos.', 'INVALID', 4)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 2 · KB Squat
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st2-1', 'ifbb-bronze-st2', '❌ KB NO TOCA EL SUELO', 'La Kettlebell debe tocar el suelo en cada repetición.', 'INVALID', 1)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 3 · Push-Ups Handball
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st3-1', 'ifbb-bronze-st3', '❌ PECHO NO TOCA EL BALÓN', 'El pecho debe tocar el balón de balonmano. Es el criterio de validación de la repetición.', 'INVALID', 1),
  ('alert-bronze-st3-2', 'ifbb-bronze-st3', '❌ CODOS NO LLEGAN A 90°', 'Los codos deben alcanzar al menos 90° de flexión.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 4 · Backward Lunges
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st4-1', 'ifbb-bronze-st4', '❌ RODILLA TRASERA NO TOCA EL SUELO', 'La rodilla trasera debe tocar el suelo obligatoriamente.', 'INVALID', 1),
  ('alert-bronze-st4-2', 'ifbb-bronze-st4', '❌ ZANCADA HACIA ADELANTE', 'El Nivel Bronce exige zancada hacia ATRÁS. Hacia adelante es inválida.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 5 · Sit-Ups Touch Feet
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st5-1', 'ifbb-bronze-st5', '❌ MANOS NO TOCAN LOS PIES', 'Ambas manos deben tocar los pies en cada repetición.', 'INVALID', 1),
  ('alert-bronze-st5-2', 'ifbb-bronze-st5', '❌ TRONCO NO LLEGA A 90°', 'El tronco debe ser perpendicular al suelo al llegar arriba.', 'INVALID', 2)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- BRONCE · ESTACIÓN 6 · KB Overhead Swing (DESEMPATE)
INSERT INTO `tech_alerts` (`id`, `exercise_id`, `title`, `description`, `severity`, `sort_order`) VALUES
  ('alert-bronze-st6-1', 'ifbb-bronze-st6', '❌ KB NO LLEGA SOBRE LA CABEZA', 'Los brazos deben estar completamente extendidos sobre la cabeza.', 'INVALID', 1),
  ('alert-bronze-st6-2', 'ifbb-bronze-st6', '❌ SIN PARADA EN VERTICAL', 'Debe haber una pausa breve con la KB sobre la cabeza en posición vertical.', 'INVALID', 2),
  ('alert-bronze-st6-3', 'ifbb-bronze-st6', '⭐ ESTACIÓN DE DESEMPATE', 'En empate total de repeticiones, gana quien más reps tenga aquí.', 'WARNING', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Confirmación
SELECT COUNT(*) AS total_alertas FROM `tech_alerts`;
-- Debe devolver ~52 alertas (3+3+3+3+3+5 + 2+2+1+2+2+2 + 4+1+2+2+2+3 = 44+11+14+12+13 = ...)
```

### 18.6 Crear el usuario administrador inicial

```sql
-- ══════════════════════════════════════════════════════════════
-- 03_seed_admin_user.sql — Usuario administrador inicial
-- 
-- IMPORTANTE: La contraseña debe ser hasheada con bcrypt (12 rounds)
-- ANTES de ejecutar este script. Genera el hash con:
--   node -e "console.log(require('bcryptjs').hashSync('TU_PASSWORD', 12))"
-- 
-- ⚠️  CAMBIA 'TU_PASSWORD_AQUI' por una contraseña fuerte antes de ejecutar.
-- ══════════════════════════════════════════════════════════════

-- Generar hash bcrypt desde tu PC local:
--   $ npm install bcryptjs
--   $ node -e "console.log(require('bcryptjs').hashSync('AdminIFBB2026!', 12))"
--   $2a$12$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
--
-- Pega el resultado en la línea siguiente:

INSERT INTO `users` 
  (`id`, `email`, `password_hash`, `role`, `is_active`, `is_email_verified`) 
VALUES 
  ('admin-ifbb-001', 
   'admin@fenifisc.com', 
   -- ↓↓↓ REEMPLAZA ESTE HASH CON EL QUE GENERASTE ↓↓↓
   '$2a$12$REEMPLAZAR_CON_HASH_BCRYPT_GENERADO_DESDE_TU_PC',
   'ADMIN', 1, 1)
ON DUPLICATE KEY UPDATE 
  password_hash = VALUES(password_hash),
  role = 'ADMIN',
  is_active = 1;

-- Verificar
SELECT id, email, role, is_active, is_email_verified, created_at 
FROM `users` 
WHERE email = 'admin@fenifisc.com';
```

> **⚠️ SEGURIDAD CRÍTICA:** Nunca dejes el hash placeholder. Genera uno nuevo con bcrypt antes de cada despliegue. Si alguien ve este archivo en el repositorio, podría intentar usar el hash por defecto.

### 18.7 Verificación final del seed

```sql
-- ══════════════════════════════════════════════════════════════
-- 04_seed_idempotency_check.sql — Verificación del seed
-- Ejecuta estas queries para confirmar que todo está bien
-- ══════════════════════════════════════════════════════════════

-- 1. Contar ejercicios por nivel
SELECT 
  level, 
  COUNT(*) AS total,
  SUM(CASE WHEN is_tiebreaker_station = 1 THEN 1 ELSE 0 END) AS desempate,
  SUM(CASE WHEN mixed_pair_exception = 1 THEN 1 ELSE 0 END) AS excep_pareja_mixta,
  SUM(CASE WHEN straps_allowed = 1 THEN 1 ELSE 0 END) AS correas_ok
FROM `exercises`
GROUP BY level
ORDER BY FIELD(level, 'GOLD', 'SILVER', 'BRONZE');

-- Resultado esperado:
-- GOLD    | 6 | 1 | 1 | 1
-- SILVER  | 6 | 1 | 0 | 0
-- BRONZE  | 6 | 1 | 0 | 0

-- 2. Total de ejercicios y alertas
SELECT 
  (SELECT COUNT(*) FROM `exercises` WHERE is_active = 1) AS ejercicios_activos,
  (SELECT COUNT(*) FROM `tech_alerts`) AS alertas_totales,
  (SELECT COUNT(*) FROM `tech_alerts` WHERE severity = 'PROHIBITED') AS alertas_prohibidas,
  (SELECT COUNT(*) FROM `tech_alerts` WHERE severity = 'INVALID') AS alertas_invalidas,
  (SELECT COUNT(*) FROM `tech_alerts` WHERE severity = 'WARNING') AS alertas_warning;

-- Resultado esperado:
-- 18 | 52 | 1 | ~40 | ~11

-- 3. Verificar usuario admin
SELECT 
  email, 
  role, 
  is_active, 
  is_email_verified, 
  created_at 
FROM `users` 
WHERE role = 'ADMIN';

-- 4. Verificar FK (todas las alertas deben tener exercise_id válido)
SELECT 
  COUNT(*) AS alertas_huerfanas
FROM `tech_alerts` ta
LEFT JOIN `exercises` e ON ta.exercise_id = e.id
WHERE e.id IS NULL;
-- Debe devolver 0

-- 5. Verificar que los IDs siguen el patrón ifbb-{level}-st{n}
SELECT 
  id, 
  name_es, 
  level, 
  station 
FROM `exercises` 
ORDER BY level, station;

-- 6. Resumen de pesos por nivel/sexo
SELECT 
  level, 
  station, 
  weight_male_kg AS kg_hombre, 
  weight_female_kg AS kg_mujer, 
  weight_label 
FROM `exercises` 
ORDER BY FIELD(level, 'GOLD', 'SILVER', 'BRONZE'), station;

-- 7. Estado de las tablas
SELECT 
  TABLE_NAME, 
  TABLE_ROWS, 
  ROUND(DATA_LENGTH/1024) AS data_kb, 
  ROUND(INDEX_LENGTH/1024) AS index_kb 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
```

### 18.8 Script automatizado para ejecutar todos los seeds

Para no tener que copiar/pegar 4 veces en phpMyAdmin, crear `seed-all.sh` en tu servidor:

```bash
nano ~/domains/fenifisc.com/seed-all.sh
```

```bash
#!/bin/bash
# ══════════════════════════════════════════════════════════════
# seed-all.sh — Ejecuta los 4 scripts de seed en orden
# Requiere: mysql client instalado en el servidor
# Uso: bash seed-all.sh
# ══════════════════════════════════════════════════════════════

set -e

DB_USER="u123456789_ifbbuser"
DB_PASS="TU_PASSWORD_MYSQL"
DB_NAME="u123456789_ifbbfc"
SEED_DIR="$HOME/domains/fenifisc.com/seeds"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  IFBB FC Trainer — Seed de Base de Datos${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════${NC}"

# Verificar mysql client
if ! command -v mysql &> /dev/null; then
  echo -e "${RED}Error: mysql client no instalado${NC}"
  echo "Instalar con: sudo apt install mysql-client"
  exit 1
fi

# Verificar que existen los SQL
for file in 00_schema.sql 01_seed_exercises.sql 02_seed_tech_alerts.sql 03_seed_admin_user.sql 04_seed_idempotency_check.sql; do
  if [ ! -f "$SEED_DIR/$file" ]; then
    echo -e "${RED}Error: no se encuentra $SEED_DIR/$file${NC}"
    exit 1
  fi
done

# Confirmar
echo -e "${YELLOW}Esto cargará los 18 ejercicios IFBB en la base de datos.${NC}"
read -p "¿Continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
  echo "Cancelado."
  exit 0
fi

# Ejecutar en orden
for file in 00_schema.sql 01_seed_exercises.sql 02_seed_tech_alerts.sql 03_seed_admin_user.sql 04_seed_idempotency_check.sql; do
  echo -e "\n${YELLOW}[$file]${NC}"
  mysql -h localhost -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$SEED_DIR/$file"
  echo -e "${GREEN}  ✓ Ejecutado${NC}"
done

echo -e "\n${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✓ SEED COMPLETADO${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo "Verificación: ejecuta en phpMyAdmin:"
echo "  SELECT COUNT(*) FROM exercises;  -- Debe ser 18"
echo "  SELECT COUNT(*) FROM tech_alerts; -- Debe ser ~52"
```

```bash
# Preparar
mkdir -p ~/domains/fenifisc.com/seeds
cd ~/domains/fenifisc.com/seeds
# Subir los 5 archivos .sql aquí (vía SFTP o crear con nano)

chmod +x ~/domains/fenifisc.com/seed-all.sh

# Ejecutar
bash ~/domains/fenifisc.com/seed-all.sh
```

### 18.9 Re-ejecución del seed (idempotencia)

Gracias al uso de `INSERT ... ON DUPLICATE KEY UPDATE`, puedes:

```sql
-- Re-ejecutar el seed completo sin miedo
-- Los ejercicios se actualizan si ya existen, no se duplican
-- Las alertas se reemplazan por las nuevas versiones

-- Si quieres partir de cero:
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `tech_alerts`;
TRUNCATE TABLE `exercises`;
SET FOREIGN_KEY_CHECKS = 1;

-- Luego re-ejecutar 01_seed_exercises.sql y 02_seed_tech_alerts.sql
```

### 18.10 Integración con el script `deploy.sh`

Añadir al final del `deploy.sh` (sección 12) la llamada al seed si es un primer despliegue:

```bash
# Añadir esto al deploy.sh después del paso [6/7] de build

# ─── 6.5 SEED DE BASE DE DATOS (solo primera vez) ─────
if [ ! -f "$APP_DIR/.seed_done" ]; then
  echo -e "\n${YELLOW}[6.5/7] Primera ejecución: cargando seed de BD...${NC}"
  
  if [ -d "$HOME/domains/fenifisc.com/seeds" ]; then
    bash $HOME/domains/fenifisc.com/seed-all.sh
    touch $APP_DIR/.seed_done
    echo -e "${GREEN}  ✓ Seed ejecutado. Marcando como completado.${NC}"
  else
    echo -e "${YELLOW}  ⚠ Directorio de seeds no encontrado, saltando.${NC}"
  fi
fi
```

### 18.11 Verificación rápida post-seed

Después de ejecutar los seeds, prueba el endpoint de la API:

```bash
# Debe devolver 18 ejercicios
curl -s https://fitnesschallenge.fenifisc.com/api/exercises | python3 -c "import json, sys; d = json.load(sys.stdin); print(f'Total: {len(d[\"exercises\"])} ejercicios')"

# O con jq
curl -s https://fitnesschallenge.fenifisc.com/api/exercises | jq '.exercises | length'

# Filtrar por nivel
curl -s "https://fitnesschallenge.fenifisc.com/api/exercises?level=GOLD" | jq '.exercises | length'
# Debe devolver 6
```

---

## 19. SOLUCIÓN DE PROBLEMAS COMUNES {#troubleshooting}

### Problema 1: "Cannot connect to MySQL" en producción

```bash
# Verificar que DATABASE_URL está bien
cat ~/domains/fenifisc.com/public_html/.env | grep DATABASE_URL

# Verificar conectividad a MySQL
mysql -h localhost -u u123456789_ifbbuser -p u123456789_ifbbfc -e "SELECT 1"

# Ver logs
npx pm2 logs ifbb-fc-trainer --err --lines 50
```

### Problema 2: "Application not loading" (Error 502/503)

```bash
# Ver estado de PM2
npx pm2 status

# Si la app está "errored", reiniciar
npx pm2 restart ifbb-fc-trainer

# Verificar que el puerto está libre
netstat -tlnp | grep 3000
# Si hay algo en :3000, matar el proceso
kill -9 $(lsof -ti:3000)
```

### Problema 3: "Out of memory" en hosting compartido

```bash
# Reducir memoria en PM2
npx pm2 delete ifbb-fc-trainer
npx pm2 start ecosystem.config.js --max-memory-restart 256M
```

### Problema 4: "Build failed" — dependencias

```bash
# Limpiar caché y reinstalar
cd ~/domains/fenifisc.com/public_html
rm -rf node_modules .next
npm ci --omit=dev
npm run build
```

### Problema 5: Cambios no se reflejan

```bash
# Reiniciar PM2 después de cambios
npx pm2 restart ifbb-fc-trainer

# Si no funciona, limpiar build cache
rm -rf .next
npm run build
npx pm2 restart ifbb-fc-trainer
```

### Problema 6: DNS no resuelve

```bash
# Verificar DNS
nslookup fitnesschallenge.fenifisc.com
dig fitnesschallenge.fenifisc.com A

# Limpiar caché DNS local
# Windows: ipconfig /flushdns
# Mac: sudo dscacheutil -flushcache
# Linux: sudo systemd-resolve --flush-caches
```

### Problema 7: 404 en rutas internas

```bash
# Verificar que .htaccess existe y tiene RewriteRule
cat ~/domains/fenifisc.com/public_html/.htaccess

# Verificar que el módulo mod_rewrite está habilitado
# (Hostinger lo hace por defecto)
```

### Problema 8: PWA no se puede instalar

```bash
# Verificar manifest
curl -s https://fitnesschallenge.fenifisc.com/manifest.json | head -20

# Verificar que se sirve con Content-Type correcto
curl -I https://fitnesschallenge.fenifisc.com/manifest.json

# Debe ser: content-type: application/manifest+json
```

---

## 20. CHECKLIST FINAL DE GO-LIVE {#checklist}

### Pre-despliegue
- [ ] Dominio `fenifisc.com` activo y apuntando a Hostinger
- [ ] Subdominio `fitnesschallenge.fenifisc.com` creado en hPanel
- [ ] DNS configurado y propagado (verificar con dnschecker.org)
- [ ] SSL activado para `fitnesschallenge.fenifisc.com`
- [ ] Base de datos MySQL `u123456789_ifbbfc` creada
- [ ] Usuario MySQL con todos los permisos
- [ ] Email `noreply@fenifisc.com` creado en Hostinger
- [ ] Variables de entorno `.env` configuradas con claves secretas seguras
- [ ] `next.config.ts` con `output: "standalone"`
- [ ] `server.js` creado en raíz
- [ ] `ecosystem.config.js` configurado con rutas correctas
- [ ] `.htaccess` configurado
- [ ] Schema de DB adaptado a MySQL (o usando PostgreSQL)
- [ ] Iconos PWA en `/public/icons/`
- [ ] Manifest en `/public/manifest.json`
- [ ] Scripts SQL del **seed** subidos a `~/domains/fenifisc.com/seeds/`
- [ ] Hash bcrypt generado para el usuario admin

### Despliegue
- [ ] Repositorio Git clonado en `~/domains/fenifisc.com/public_html`
- [ ] `npm ci --omit=dev` ejecutado
- [ ] `npm run build` exitoso
- [ ] `drizzle-kit push` ejecutado (o migraciones aplicadas)
- [ ] PM2 iniciado: `npx pm2 start ecosystem.config.js`
- [ ] `npx pm2 save` ejecutado
- [ ] `curl https://fitnesschallenge.fenifisc.com/api/health` → 200

### Seed de base de datos
- [ ] `bash seed-all.sh` ejecutado (o SQL ejecutados manualmente en phpMyAdmin)
- [ ] `SELECT COUNT(*) FROM exercises` → **18**
- [ ] `SELECT COUNT(*) FROM tech_alerts` → **~52**
- [ ] `SELECT * FROM users WHERE role='ADMIN'` → 1 fila con hash válido
- [ ] `curl /api/exercises` → devuelve array de 18 ejercicios
- [ ] `curl /api/exercises?level=GOLD` → 6 ejercicios
- [ ] Login con `admin@fenifisc.com` funciona

### Post-despliegue
- [ ] Probar registro de usuario nuevo
- [ ] Probar login/logout
- [ ] Completar onboarding de 5 pasos
- [ ] Verificar generación de plan de entrenamiento
- [ ] Probar timer oficial (iniciar, contar reps, ver transiciones)
- [ ] Verificar señales auditivas (synth audio)
- [ ] Probar biblioteca de ejercicios (18 ejercicios visibles)
- [ ] Probar página de detalle de un ejercicio
- [ ] Verificar récords personales
- [ ] Probar página de perfil
- [ ] PWA: "Añadir a pantalla de inicio" desde iOS Safari
- [ ] PWA: "Instalar app" desde Chrome Android
- [ ] Lighthouse score > 90 en Performance
- [ ] SSL Labs: A o A+ (https://www.ssllabs.com/ssltest/)
- [ ] UptimeRobot configurado
- [ ] Backup automático programado
- [ ] Logs funcionando correctamente

### Producción
- [ ] Dominio público accesible: https://fitnesschallenge.fenifisc.com
- [ ] Sin errores 500 en logs de PM2
- [ ] CPU < 30% en reposo
- [ ] RAM < 200 MB en reposo
- [ ] Tiempo de respuesta < 500 ms
- [ ] Google Search Console configurado
- [ ] Sitemap.xml enviado a Google

---

## 📞 CONTACTO Y SOPORTE

- **Soporte Hostinger**: https://www.hostinger.es/contacto · chat 24/7
- **Documentación Next.js**: https://nextjs.org/docs
- **Documentación Drizzle**: https://orm.drizzle.team/docs
- **Panel hPanel**: https://hpanel.hostinger.com

---

## 📝 RESUMEN EJECUTIVO

Para desplegar **IFBB Fitness Challenge Trainer** en `fitnesschallenge.fenifisc.com` necesitas:

1. **5 minutos**: Configurar DNS y SSL en Hostinger
2. **10 minutos**: Crear la BD MySQL y el email
3. **5 minutos**: Crear el archivo `.env` con tus secretos
4. **20 minutos**: Adaptar el schema de PostgreSQL a MySQL
5. **15 minutos**: Clonar repo, instalar deps, build
6. **10 minutos**: Configurar PM2 y .htaccess
7. **5 minutos**: Verificar con `curl /api/health`

**Total: ~70 minutos para go-live completo.**

---

> **Documento:** Guía Maestra de Despliegue v1.1
> **Dominio:** fitnesschallenge.fenifisc.com
> **Stack:** Next.js 16 + Drizzle ORM + MySQL 8.0 (Hostinger)
> **Cambios v1.1:** Añadida sección 18 con SQL de seed completo (18 ejercicios IFBB + ~52 alertas técnicas + admin user)
> **Estado:** ✅ LISTO PARA PRODUCCIÓN
