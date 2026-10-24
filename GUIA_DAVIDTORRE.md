# 👥 GUÍA DE DESARROLLO: INTEGRANTE 3

> **Rol:** Especialista en Gestión de Usuarios, Roles y Permisos  
> **Rama asignada:** `feat/tenant-users`  
> **Fechas del proyecto:** 14 de Julio de 2026 – 20 de Septiembre de 2026 (10 Semanas)  
> **Archivos clave:** `src/modules/users/`, `src/routes.js`, `src/config.js`, `src/server.js`

---

## 🚀 PASO INICIAL: Clonar y Crear tu Rama (Martes 14-07-2026)

1. Abre tu terminal y clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO_GITHUB>
   cd PF
   ```
2. Instala dependencias y prueba que el servidor inicie:
   ```bash
   npm install
   npm start
   ```
   *(Abre `http://localhost:3000` en tu navegador. Presiona `Ctrl + C` para detenerlo).*
3. Crea y cámbiate a tu rama de trabajo personal:
   ```bash
   git checkout -b feat/tenant-users
   git push -u origin feat/tenant-users
   ```

---

## 🗓️ PLAN DE TRABAJO SEMANA A SEMANA

---

### 🔹 SEMANA 1 (14/07 al 19/07): Registro de Rutas del Módulo Usuarios

* **Fecha:** Jueves 16-07-2026 (una vez que CHRISTIAN MUÑOA y CRISTHIAN PALOMINO ya resolvieron el conflicto previo).
1. Trae los cambios de `main`:
   ```bash
   git pull origin main
   ```
2. Abre `src/routes.js`, importa tu router y regístralo:
   ```javascript
   import { usersRouter } from './modules/users/users.routes.js';
   // En el bloque de rutas:
   apiRouter.use('/api/users', usersRouter);
   ```
3. Guarda y sube tu cambio:
   ```bash
   git add src/routes.js
   git commit -m "feat(routes): registra enrutador de usuarios en /api/users"
   git push origin feat/tenant-users
   ```
4. Abre PR a `main` y pide a JULIO PARIONA que lo apruebe.

---

### 🔹 SEMANA 2 (20/07 al 26/07): Modificación de Roles de Usuario

* **Archivo:** `src/modules/users/users.controller.js`
* Agrega la función para actualizar el rol de un usuario (admin, editor, viewer):
  ```javascript
  // Actualizar rol
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const validRoles = ['admin', 'editor', 'viewer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: 'Rol no válido' });
      }
      await db.update(users).set({ role }).where(eq(users.id, id));
      res.json({ success: true, message: `Rol actualizado a ${role}` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  ```
* En `src/modules/users/users.routes.js` agrega:
  ```javascript
  usersRouter.patch('/:id/role', usersController.updateRole);
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/users/
  git commit -m "feat(users): agrega endpoint para actualizar rol de usuario"
  git push origin feat/tenant-users
  ```

---

### 🔹 SEMANA 3 (27/07 al 02/08): 🔥 CONFLICTO EN `src/config.js` (Jueves 30/07 con GEANPIER MEZA)

> **¡Atención!** Esta semana modificarás los límites globales en `src/config.js`. Subirás tu cambio primero y generarás la base para el conflicto con GEANPIER MEZA.

#### 1. Tu modificación (Jueves 30-07-2026, 10:00 AM)
Abre `src/config.js`. En el objeto `limits` agrega la configuración de usuarios por organización:

```javascript
  limits: {
    maxTenants: 50,
    maxRecordsPerTenant: 1000,
    defaultPageSize: 10,
    // [CAMBIO DAVID TORRE]: Límite de usuarios por tenant
    maxUsersPerTenant: 25,
    allowedRoles: ['admin', 'editor', 'viewer']
  }
```

#### 2. Sube tu cambio y abre PR:
```bash
git add src/config.js
git commit -m "feat(config): define limites de usuarios y roles permitidos por tenant"
git push origin feat/tenant-users
```
Abre tu PR a `main` y pide a JULIO PARIONA que lo mergee a las 11:30 AM. (GEANPIER MEZA colisionará contigo en este archivo más tarde y tú podrás ayudarle a resolverlo).

---

### 🔹 SEMANA 4 (03/08 al 09/08): Sincronización semanal

* Actualiza tu rama con los cambios mergeados por el equipo:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 5 (10/08 al 16/08): Filtro de Usuarios por Tenant y Estado

* **Archivo:** `src/modules/users/users.controller.js`
* En la función `list`, permite filtrar usuarios por `tenantId` recibido como query parameter:
  ```javascript
  const { tenantId } = req.query;
  const query = tenantId 
    ? db.select().from(users).where(eq(users.tenantId, tenantId))
    : db.select().from(users);
  const allUsers = await query;
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/users/users.controller.js
  git commit -m "feat(users): habilita filtrado de usuarios por organizacion"
  git push origin feat/tenant-users
  ```

---

### 🔹 SEMANA 6 (17/08 al 23/08): Validación de Email Único

* Agrega validación para evitar que dos usuarios tengan el mismo email dentro de una organización.
* **Comandos Git:**
  ```bash
  git add src/modules/users/
  git commit -m "feat(users): valida unicidad de correo electronico"
  git push origin feat/tenant-users
  ```

---

### 🔹 SEMANA 7 (24/08 al 30/08): Sincronización semanal

* Trae los cambios de `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 8 (31/08 al 06/09): Desactivación Lógica de Usuarios

* Agrega endpoint para desactivar cuenta de usuario (`status: 'inactive'`).
* **Comandos Git:**
  ```bash
  git add src/modules/users/
  git commit -m "feat(users): agrega desactivacion logica de cuentas"
  git push origin feat/tenant-users
  ```

---

### 🔹 SEMANA 9 (07/09 al 13/09): 🔥 CONFLICTO EN `src/server.js` CON JULIO PARIONA (Jueves 10/09)

> **¡Atención!** El jueves 10-09-2026 por la mañana, agregarás un middleware de auditoría de usuarios en `src/server.js`.

#### 1. Tu modificación (Jueves 10-09-2026, 11:00 AM)
Abre `src/server.js` y justo antes de `app.use('/', apiRouter);` agrega:

```javascript
// Middleware de Auditoría de Accesos (DAVID TORRE)
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || 'Desconocido';
  console.log(`[AUDIT] Acceso registrado desde: ${userAgent.slice(0, 30)} - Ruta: ${req.url}`);
  next();
});
```

#### 2. Sube tu cambio primero:
```bash
git add src/server.js
git commit -m "feat(server): implementa middleware de auditoria de accesos de usuarios"
git push origin feat/tenant-users
```
Abre PR y pídele a JULIO PARIONA que lo mergee al mediodía. (JULIO PARIONA luego agregará su middleware de métricas en esa misma línea y resolverán el conflicto en conjunto).

---

### 🔹 SEMANA 10 (14/09 al 20/09): Cierre del Proyecto

1. Trae los cambios consolidados de `main`:
   ```bash
   git checkout feat/tenant-users
   git pull origin main
   ```
2. Realiza tu PR final hacia `main`.
3. Sincroniza tu `main` local:
   ```bash
   git checkout main
   git pull origin main
   ```
4. ¡Módulo de Usuarios completado con éxito!
