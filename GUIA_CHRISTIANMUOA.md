# 🏢 GUÍA DE DESARROLLO: INTEGRANTE 1

> **Rol:** Especialista en Gestión de Tenants y Organizaciones  
> **Rama asignada:** `feat/tenant-management`  
> **Fechas del proyecto:** 14 de Julio de 2026 – 20 de Septiembre de 2026 (10 Semanas)  
> **Archivos clave:** `src/modules/tenants/`, `src/routes.js`, `views/partials/navbar.ejs`

---

## 🚀 PASO INICIAL: Clonar y Crear tu Rama (Martes 14-07-2026)

Cuando JULIO PARIONA te invite al repositorio de GitHub:

1. Abre tu terminal (Git Bash o CMD) en la carpeta donde quieras guardar el proyecto:
   ```bash
   git clone <URL_DEL_REPOSITORIO_GITHUB>
   cd PF
   ```
2. Instala las dependencias y verifica que el servidor funcione:
   ```bash
   npm install
   npm start
   ```
   *(Abre `http://localhost:3000` en tu navegador para ver la pantalla inicial. Presiona `Ctrl + C` para detenerlo).*
3. Crea y cámbiate a tu rama de trabajo personal:
   ```bash
   git checkout -b feat/tenant-management
   git push -u origin feat/tenant-management
   ```

---

## 🗓️ PLAN DE TRABAJO SEMANA A SEMANA

---

### 🔹 SEMANA 1 (14/07 al 19/07): Registro de Rutas y Apertura de PR

> **🎯 Meta:** Conectar el módulo de tenants al enrutador central antes del jueves 16/07.

#### Tarea (Miércoles 15-07-2026, 11:00 AM)
Abre el archivo `src/routes.js` en tu editor. Verás la sección reservada para registro de módulos.

1. Al inicio del archivo, importa tu router de tenants:
   ```javascript
   import { tenantsRouter } from './modules/tenants/tenants.routes.js';
   ```
2. En la línea 15 aproximadamente, registra la ruta:
   ```javascript
   apiRouter.use('/api/tenants', tenantsRouter);
   ```
3. Guarda el archivo y realiza tu commit:
   ```bash
   git add src/routes.js
   git commit -m "feat(routes): registra enrutador del modulo tenants en /api/tenants"
   git push origin feat/tenant-management
   ```
4. Ve a GitHub.com y abre un **Pull Request** desde tu rama `feat/tenant-management` hacia `main`.
5. Pídele a JULIO PARIONA que revise y apruebe tu Pull Request (JULIO PARIONA hará merge el miércoles al mediodía).
6. Una vez que JULIO PARIONA lo apruebe, sincroniza tu rama local con `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout feat/tenant-management
   git merge main
   ```

---

### 🔹 SEMANA 2 (20/07 al 26/07): Acción para Cambiar Estado del Tenant

* **Fecha sugerida:** Miércoles 22-07-2026
* **Archivo:** `src/modules/tenants/tenants.controller.js`
* **Código a agregar:** Agrega la función `toggleStatus` dentro del objeto `tenantsController`:
  ```javascript
  // Cambiar estado activo / suspendido
  async toggleStatus(req, res) {
    try {
      const { id } = req.params;
      const current = await db.select().from(tenants).where(eq(tenants.id, id)).get();
      if (!current) return res.status(404).json({ success: false, message: 'No encontrado' });
      const nextStatus = current.status === 'active' ? 'suspended' : 'active';
      await db.update(tenants).set({ status: nextStatus }).where(eq(tenants.id, id));
      res.json({ success: true, message: `Estado cambiado a ${nextStatus}` });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  ```
* En `src/modules/tenants/tenants.routes.js` añade la ruta:
  ```javascript
  tenantsRouter.patch('/:id/status', tenantsController.toggleStatus);
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/tenants/
  git commit -m "feat(tenants): agrega endpoint para suspender o reactivar tenants"
  git push origin feat/tenant-management
  ```

---

### 🔹 SEMANA 3 (27/07 al 02/08): Sincronización sin conflictos

* Mantente al día con los cambios del equipo:
  ```bash
  git checkout feat/tenant-management
  git pull origin main
  ```

---

### 🔹 SEMANA 4 (03/08 al 09/08): Mejora en la Respuesta del Listado de Tenants

* **Archivo:** `src/modules/tenants/tenants.controller.js`
* Agrega ordenamiento por fecha de creación en la función `list`:
  ```javascript
  import { desc } from 'drizzle-orm';
  // En list():
  const allTenants = await db.select().from(tenants).orderBy(desc(tenants.createdAt));
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/tenants/tenants.controller.js
  git commit -m "refactor(tenants): ordena lista de tenants de forma descendente por fecha"
  git push origin feat/tenant-management
  ```

---

### 🔹 SEMANA 5 (10/08 al 16/08): 🔥 CONFLICTO CON JULIO PARIONA EN EL NAVBAR

> **¡Atención!** Esta semana generarás un conflicto intencional de merge con JULIO PARIONA en el archivo `views/partials/navbar.ejs`.

#### 1. Tu modificación (Viernes 14-08-2026, 10:00 AM)
Abre `views/partials/navbar.ejs` y en la sección del logotipo (líneas 12-16) agrega un selector de organizaciones:

```html
<!-- CAMBIO DE CHRISTIAN MUÑOA: Selector de Organización -->
<div class="flex items-center space-x-2">
  <span class="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/40">
    🏢 Selector de Organización
  </span>
</div>
```

#### 2. Sube tu cambio y abre PR
```bash
git add views/partials/navbar.ejs
git commit -m "feat(navbar): agrega badge de selector de organizacion en la barra superior"
git push origin feat/tenant-management
```
Abre un Pull Request a `main`. JULIO PARIONA aprobará tu cambio el viernes a las 11:30 AM y quedará en `main`. (JULIO PARIONA luego sufrirá el conflicto al intentar subir su propio cambio y te consultará para resolverlo en equipo).

---

### 🔹 SEMANA 6 (17/08 al 23/08): Validación de Subdominio Único

* **Archivo:** `src/modules/tenants/tenants.controller.js`
* Valida que no se dupliquen subdominios en la función `create`:
  ```javascript
  const existing = await db.select().from(tenants).where(eq(tenants.subdomain, subdomain)).get();
  if (existing) {
    return res.status(400).json({ success: false, message: 'El subdominio ya está en uso' });
  }
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/tenants/tenants.controller.js
  git commit -m "feat(tenants): valida subdominio unico al registrar tenant"
  git push origin feat/tenant-management
  ```

---

### 🔹 SEMANA 7 (24/08 al 30/08): Sincronización semanal

* Actualiza tu rama con `main` para recibir los datos de prueba del equipo:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 8 (31/08 al 06/09): Endpoint para Detalle y Estadísticas del Tenant

* **Archivo:** `src/modules/tenants/tenants.controller.js`
* Retorna el número de usuarios y colecciones asociadas al consultar un tenant por ID.
* **Comandos Git:**
  ```bash
  git add src/modules/tenants/tenants.controller.js
  git commit -m "feat(tenants): enriquece respuesta de getById con métricas de la organización"
  git push origin feat/tenant-management
  ```

---

### 🔹 SEMANA 9 (07/09 al 13/09): Pruebas de Carga y Estabilidad

* Verifica que los endpoints respondan con código HTTP 200 y 201 correctamente.
* Asegura que tu código no contenga variables sin usar.

---

### 🔹 SEMANA 10 (14/09 al 20/09): Cierre del Proyecto

1. Haz Pull Request final de `feat/tenant-management` hacia `main`.
2. Espera a que JULIO PARIONA complete el merge final.
3. Actualiza tu rama `main` local:
   ```bash
   git checkout main
   git pull origin main
   ```
4. ¡Felicidades! Tu módulo está integrado en la versión final de producción.
