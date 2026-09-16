# KineFix — Software de gestión para gimnasios

Plataforma multi-gimnasio para administrar socios, rutinas de entrenamiento, cuotas
y progreso. Cada gimnasio que se registra obtiene su propio espacio aislado: sus
socios, sus rutinas, sus precios y su administrador.

## Qué incluye

**Para el socio**
- Rutina asignada según su plan (2, 3, 5 días/semana o el que cree el gimnasio).
- Registro de peso y repeticiones por ejercicio, con historial por fecha.
- Estado de su cuota mensual y de la suscripción Pro.
- Coordinación del pago por WhatsApp con el número del gimnasio.
- Edición de su perfil, objetivo y contraseña.

**Para el gimnasio (administrador)**
- Alta, edición y baja de socios.
- Marcar cuotas pagadas y activar/desactivar Pro.
- Panel de cobranzas: recaudado del mes, socios al día, pendientes e historial mensual.
- Editor de planes compartidos (días, ejercicios, series, reps, descanso, instrucciones, media).
- Planes personalizados por socio para quienes tienen Pro.
- Lectura del progreso registrado por cada socio.
- Configuración de nombre, WhatsApp y precios.

## Arquitectura

```
fitpulse-pro/   Frontend  — React 19 + Vite + Tailwind 4
server/         Backend   — Node + Express + SQLite (node:sqlite, incluido en Node)
```

- Contraseñas con hash **scrypt** (nunca se guardan ni se devuelven en texto plano).
- Sesiones con **JWT**; el token viaja en `Authorization: Bearer`.
- **Multi-tenant**: cada fila lleva `gym_id` y toda ruta valida que el recurso
  pertenezca al gimnasio del token. Dos gimnasios pueden tener un socio con el
  mismo nombre de usuario sin pisarse.
- Freno de fuerza bruta en el login (8 intentos por 15 minutos).

Requiere **Node.js 22.5 o superior**. SQLite viene dentro de Node, así que la
instalación no compila nada: no hacen falta Python ni compiladores de C++ en la
máquina del gimnasio.

## Puesta en marcha

```bash
npm run install:all   # instala raíz, server y frontend
npm run seed          # crea el gimnasio de demostración
npm run dev           # API en :4000 y frontend en :5173
```

Abrí <http://localhost:5173>.

### Cuentas de demostración (gimnasio "Gimnasio Demo")

| Usuario     | Contraseña  | Rol           |
|-------------|-------------|---------------|
| `admin`     | `admin1234` | Administrador |
| `user2dias` | `demo1234`  | Socio         |
| `user3dias` | `demo1234`  | Socio         |
| `user5dias` | `demo1234`  | Socio         |

El seed es opcional: desde la pantalla de login, **"Registrá tu gimnasio"** crea un
gimnasio real con su administrador y los planes de 2, 3 y 5 días ya cargados.

## Tests

```bash
npm test
```

36 tests de integración sobre la API: onboarding de gimnasios, autenticación,
aislamiento entre gimnasios, permisos de socio, cuotas, planes y progreso.

## Configuración

Copiá `server/.env.example` a `server/.env` y completalo.

| Variable      | Para qué sirve                                                        |
|---------------|-----------------------------------------------------------------------|
| `PORT`        | Puerto de la API (por defecto 4000).                                  |
| `JWT_SECRET`  | **Obligatorio en producción.** Firma los tokens de sesión.            |
| `TOKEN_TTL`   | Duración de la sesión (por defecto `30d`).                            |
| `CORS_ORIGIN` | Dominios autorizados, separados por coma. Vacío = cualquiera (solo dev). |
| `DATA_DIR`    | Carpeta de la base SQLite (por defecto `server/data`).                |
| `TZ_NAME`     | Zona horaria para fechar cuotas (por defecto Buenos Aires).           |

Generá el secreto con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

En producción el servidor **se niega a arrancar sin `JWT_SECRET`**, para que no
quede uno autogenerado por accidente.

## Despliegue

### Un solo servidor (lo más simple)

```bash
npm run build                              # genera fitpulse-pro/dist
cd server && JWT_SECRET=... NODE_ENV=production npm start
```

El backend sirve la API y el frontend compilado desde el mismo puerto. Poné un
proxy inverso con HTTPS delante (Nginx, Caddy) y listo.

### Frontend y API separados

Publicá `fitpulse-pro/dist` en cualquier hosting estático y compilá apuntando a
la API:

```bash
VITE_API_URL=https://api.tudominio.com/api npm run build
```

En el servidor definí `CORS_ORIGIN=https://tudominio.com`.

### Respaldos

Toda la información vive en `server/data/kinefix.db`. Copiá ese archivo (junto a
`kinefix.db-wal` si existe) para tener un respaldo completo. Programá una copia
diaria antes de vender el sistema a un cliente.

## Pendientes conocidos

- El cobro se registra a mano por el administrador: los socios coordinan por
  WhatsApp y el gimnasio confirma el pago. No hay integración con una pasarela
  (Mercado Pago u otra) todavía.
- No hay recuperación de contraseña por email; el administrador la restablece
  desde el panel.
