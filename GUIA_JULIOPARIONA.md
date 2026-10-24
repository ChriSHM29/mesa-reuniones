# 👑 GUÍA DEL OWNER / LÍDER DEL REPOSITORIO

> **Rol:** Administrador del Repositorio y Desarrollador del Dashboard Superadmin  
> **Rama de desarrollo:** `feat/owner-dashboard`  
> **Rama principal:** `main` (solo el Owner aprueba y mergea Pull Requests)  
> **Fechas:** 14 de Julio de 2026 – 20 de Septiembre de 2026 (10 Semanas)

---

## 📋 Responsabilidades del Owner

1. Mantener la rama `main` siempre estable y operativa.
2. Crear la arquitectura base inicial y subirla a GitHub.
3. Crear tu rama personal `feat/owner-dashboard` para implementar las métricas y la salud del sistema.
4. Revisar los Pull Requests (PR) de los 4 integrantes en GitHub y hacer merge según el cronograma.
5. Guiar la resolución de conflictos cuando dos integrantes modifiquen el mismo archivo.
6. Experimentar conflictos directos con tus compañeros en la **Semana 5** (con CHRISTIAN MUÑOA) y en la **Semana 9** (con DAVID TORRE).

---

## 🛠️ DÍA 1: Martes 14-07-2026 — Setup Inicial del Repositorio

Como Owner, tú estableces los cimientos del proyecto en GitHub para que el equipo pueda clonar y empezar a trabajar.

### Paso 1: Subir la arquitectura base a `main`
Abre tu terminal en la carpeta del proyecto y ejecuta:

```bash
# 1. Asegúrate de estar en la rama main
git status
git checkout main

# 2. Agregar los archivos del proyecto base
git add .

# 3. Crear el commit fundacional
git commit -m "feat(core): arquitectura base BaaS Lite con Express, SQLite, EJS y TailwindCSS"

# 4. Subir a GitHub
git push -u origin main
```

### Paso 2: Invitar a tus 4 compañeros en GitHub
1. Ve a tu repositorio en **GitHub.com** -> **Settings** -> **Collaborators**.
2. Haz clic en **Add people** y busca el usuario de GitHub de cada uno de tus 4 compañeros.
3. Pídeles que acepten la invitación que les llegará por correo o notificación de GitHub.

### Paso 3: Crear tu rama personal de trabajo
```bash
# Crear y cambiarte a tu rama de trabajo
git checkout -b feat/owner-dashboard
git push -u origin feat/owner-dashboard
```

---

## 🗓️ CRONOGRAMA SEMANA A SEMANA (10 SEMANAS)

---

### 🔹 SEMANA 1 (14/07 al 19/07): Setup y Primer Conflicto (Miércoles 15/07)

* **Tu tarea de código:** Crear el endpoint de métricas básicas en `src/modules/owner/owner.controller.js`.
* **Supervisión de Merges:**
  1. **Miércoles 15/07 (12:00 PM):** CHRISTIAN MUÑOA abrirá su PR (`feat/tenant-management` -> `main`). Revísalo en GitHub y haz clic en **Merge pull request**.
  2. **Miércoles 15/07 (04:00 PM):** CRISTHIAN PALOMINO intentará subir su PR (`feat/tenant-data` -> `main`) y GitHub indicará **"Can’t automatically merge"** debido al conflicto en `src/routes.js`.
  3. Indícale a CRISTHIAN PALOMINO que siga las instrucciones de su `GUIA_INTEGRANTE_2.md` para resolver el conflicto localmente y actualizar su PR.
  4. Una vez resuelto, aprueba el PR de CRISTHIAN PALOMINO.
* **Tu commit en `feat/owner-dashboard` (Viernes 17/07):**
  ```bash
  git add src/modules/owner/owner.controller.js
  git commit -m "feat(owner): implementa calculo de tiempo activo y métricas del sistema"
  git push origin feat/owner-dashboard
  ```

---

### 🔹 SEMANA 2 (20/07 al 26/07): Métricas de Base de Datos y Primer Merge a Main

* **Objetivo:** Conectar el dashboard del Owner para consultar el tamaño del archivo `data/app.db`.
* **Código a agregar:** En `src/modules/owner/owner.controller.js`, en la función `getHealth`:
  ```javascript
  import fs from 'node:fs';
  // Agregar cálculo de tamaño de BD en el objeto de respuesta:
  const dbStats = fs.existsSync(config.dbPath) ? fs.statSync(config.dbPath) : null;
  const dbSizeBytes = dbStats ? dbStats.size : 0;
  ```
* **Comandos Git (Jueves 23/07):**
  ```bash
  git add src/modules/owner/owner.controller.js
  git commit -m "feat(owner): agrega medicion de tamano de archivo SQLite en getHealth"
  git push origin feat/owner-dashboard
  ```
* **Merge a main (Viernes 24/07):**
  - Ve a GitHub, abre PR de `feat/owner-dashboard` hacia `main` y realiza el merge.
  - Vuelve a tu consola local y actualiza tu `main`:
    ```bash
    git checkout main
    git pull origin main
    git checkout feat/owner-dashboard
    git merge main
    ```

---

### 🔹 SEMANA 3 (27/07 al 02/08): Supervisión de Conflicto en Configuración Global

* **🔥 Alerta de Conflicto en el Equipo (Jueves 30/07):**
  - DAVID TORRE modifica `src/config.js` para límites de usuarios.
  - GEANPIER MEZA modifica `src/config.js` para cuotas de reportes.
* **Tu acción:**
  1. El jueves a las 11:00 AM, aprueba y mergea el PR de **DAVID TORRE** (`feat/tenant-users` -> `main`).
  2. Cuando **GEANPIER MEZA** reporte conflicto, asegúrate de que use `git pull origin main` para combinar las propiedades en `src/config.js` sin borrar las de DAVID TORRE.
  3. Mergea el PR del GEANPIER MEZA una vez resuelto.

---

### 🔹 SEMANA 4 (03/08 al 09/08): Supervisión de Vistas TailwindCSS

* Cada integrante sube sus tarjetas y formularios en `views/`.
* Tu rol esta semana: Revisar que ningún PR rompa los estilos responsivos de TailwindCSS en `http://localhost:3000`.
* Realiza merge de las 4 ramas hacia `main` conforme vayan terminando sus PRs.

---

### 🔹 SEMANA 5 (10/08 al 16/08): 🔥 CONFLICTO DIRECTO: JULIO PARIONA VS CHRISTIAN MUÑOA

> **Atención:** En esta semana **TÚ** experimentarás un conflicto real de merge contra CHRISTIAN MUÑOA en el archivo `views/partials/navbar.ejs`.

#### 1. Tu cambio (Viernes 14/08 por la mañana)
En tu rama `feat/owner-dashboard`, abre `views/partials/navbar.ejs` y en la sección del logotipo (líneas 12-16) agrega un badge dorado para el superadmin:

```html
<!-- CAMBIO DE JULIO PARIONA: Badge de Superadmin Activo -->
<div class="flex items-center space-x-2">
  <span class="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
    👑 Superadmin Mode
  </span>
</div>
```

Guarda y sube tu cambio:
```bash
git add views/partials/navbar.ejs
git commit -m "feat(navbar): agrega badge de modo superadmin en header"
git push origin feat/owner-dashboard
```

#### 2. La colisión
* CHRISTIAN MUÑOA habrá mergeado previamente su cambio en esa misma sección del navbar el viernes al mediodía (un selector de empresas).
* Cuando abras tu PR de `feat/owner-dashboard` a `main`, GitHub te avisará: **"This branch has conflicts that must be resolved"**.

#### 3. Cómo resolver el conflicto (Tú mismo en tu terminal):
```bash
# 1. Traer los cambios más recientes de main a tu rama
git checkout feat/owner-dashboard
git pull origin main
```

Git detendrá la operación y mostrará:
```text
CONFLICT (content): Merge conflict in views/partials/navbar.ejs
Automatic merge failed; fix conflicts and then commit the result.
```

Abre `views/partials/navbar.ejs` en tu editor de código. Verás:
```html
<<<<<<< HEAD (Tu código de feat/owner-dashboard)
<div class="flex items-center space-x-2">
  <span class="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
    👑 Superadmin Mode
  </span>
</div>
=======
<div class="flex items-center space-x-2">
  <span class="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/40">
    🏢 Selector de Organización
  </span>
</div>
>>>>>>> main
```

**Solución correcta (ambos cambios deben convivir):**
Borra las líneas de marcadores (`<<<<<<<`, `=======`, `>>>>>>>`) y deja ambos elementos uno al lado del otro:
```html
<div class="flex items-center space-x-2">
  <span class="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/40">
    👑 Superadmin Mode
  </span>
  <span class="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/40">
    🏢 Selector de Organización
  </span>
</div>
```

Guarda el archivo y concluye el merge:
```bash
git add views/partials/navbar.ejs
git commit -m "fix(navbar): resuelve conflicto de merge integrando badge superadmin y selector tenant"
git push origin feat/owner-dashboard
```
¡Listo! Ahora tu PR en GitHub estará en verde y podrás hacer merge a `main`.

---

### 🔹 SEMANA 6 (17/08 al 23/08): Auditoría de Endpoints y Rendimiento

* Mergear mejoras de los integrantes en `src/modules/*/`.
* Verificar que `npm start` inicie el servidor limpiamente en menos de 2 segundos.

---

### 🔹 SEMANA 7 (24/08 al 30/08): Supervisión de Conflicto en Semillero JSON

* **🔥 Alerta de Conflicto (Miércoles 26/08):**
  - CRISTHIAN PALOMINO y GEANPIER MEZA modifican `data/initialData.json` para agregar registros iniciales de prueba.
  - CRISTHIAN PALOMINO mergea primero; GEANPIER MEZA resuelve el conflicto en el array JSON y luego tú apruebas su PR.

---

### 🔹 SEMANA 8 (31/08 al 06/09): Pruebas de Integración

* Revisión de llamadas a la base de datos con Drizzle ORM.
* Cada integrante sincroniza su rama con `main` ejecutando `git pull origin main`.

---

### 🔹 SEMANA 9 (07/09 al 13/09): 🔥 CONFLICTO DIRECTO: JULIO PARIONA VS DAVID TORRE

> **Atención:** Conflicto en `src/server.js` entre JULIO PARIONA (middleware de registro de tiempos) y DAVID TORRE (middleware de auditoría de usuarios).

#### 1. Tu cambio (Jueves 10/09 por la tarde)
En `src/server.js`, antes de `app.use('/', apiRouter);`, agrega:
```javascript
// Middleware de Métricas del Superadmin (JULIO PARIONA)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[METRICS] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});
```

En `README.md`, agrega:
```md
---

## 📡 Endpoints Principales

- `GET /` : Dashboard Superadmin interactivo (EJS + TailwindCSS).
- `GET /api/health` : Estado de salud y métricas del servidor en JSON.
- `GET /api/tenants` : Listado de organizaciones / tenants.
- `POST /api/tenants` : Registro de nuevo tenant.
- `GET /api/data/collections` : Listado de colecciones dinámicas.
- `GET /api/users` : Listado de usuarios del sistema.
- `GET /api/reports` : Métricas y resúmenes de consumo.
```

Sube tu cambio directo o a través de tu rama:
```bash
git checkout feat/owner-dashboard
git add src/server.js
git commit -m "feat(server): agrega middleware de registro de latencia de peticiones"
git push origin feat/owner-dashboard
```

#### 2. La colisión con DAVID TORRE
* DAVID TORRE habrá agregado su middleware de auditoría en ese mismo lugar en `main`.
* Resuélvelo localmente con:
  ```bash
  git pull origin main
  ```
* En `src/server.js`, mantén ambos middlewares en cascada, guarda, haz `git add src/server.js`, `git commit -m "fix(server): fusiona middlewares de metricas y auditoria"` y sube a GitHub.

---

### 🔹 SEMANA 10 (14/09 al 20/09): Entrega Académica Final

1. Asegúrate de que todas las 5 ramas de features (`feat/*`) tengan sus PRs mergeados a `main`.
2. Verifica en tu máquina local:
   ```bash
   git checkout main
   git pull origin main
   npm start
   ```
3. Comprueba que `http://localhost:3000` muestre el panel con los datos de todos los módulos funcionando en armonía.
4. En GitHub, genera el Release oficial `v1.0.0` y presenta el historial de commits y pull requests al docente como evidencia del trabajo colaborativo y la resolución de conflictos.
