# 📈 GUÍA DE DESARROLLO: INTEGRANTE 4

> **Rol:** Especialista en Reportes, Analítica y Métricas de Consumo  
> **Rama asignada:** `feat/tenant-reports`  
> **Fechas del proyecto:** 14 de Julio de 2026 – 20 de Septiembre de 2026 (10 Semanas)  
> **Archivos clave:** `src/modules/reports/`, `src/routes.js`, `src/config.js`, `data/initialData.json`

---

## 🚀 PASO INICIAL: Clonar y Crear tu Rama (Martes 14-07-2026)

1. Abre tu terminal y clona el repositorio de JULIO PARIONA:
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
   git checkout -b feat/tenant-reports
   git push -u origin feat/tenant-reports
   ```

---

## 🗓️ PLAN DE TRABAJO SEMANA A SEMANA

---

### 🔹 SEMANA 1 (14/07 al 19/07): Registro de Rutas del Módulo de Reportes

* **Fecha:** Viernes 17-07-2026
1. Trae los cambios más recientes de `main`:
   ```bash
   git pull origin main
   ```
2. Abre `src/routes.js`, importa tu router y regístralo:
   ```javascript
   import { reportsRouter } from './modules/reports/reports.routes.js';
   // En el bloque de rutas:
   apiRouter.use('/api/reports', reportsRouter);
   ```
3. Guarda y sube tu cambio:
   ```bash
   git add src/routes.js
   git commit -m "feat(routes): registra enrutador de reportes en /api/reports"
   git push origin feat/tenant-reports
   ```
4. Abre PR a `main` y pídele A JULIO PARIONA que lo mergee.

---

### 🔹 SEMANA 2 (20/07 al 26/07): Cálculo de Consumo por Tenant

* **Archivo:** `src/modules/reports/reports.controller.js`
* Agrega endpoint para obtener el resumen de consumo de un tenant:
  ```javascript
  // Resumen de consumo
  async getUsageSummary(req, res) {
    try {
      const { tenantId } = req.params;
      const tenantReps = await db.select().from(reports).where(eq(reports.tenantId, tenantId));
      const totalStorage = tenantReps.reduce((acc, r) => acc + (r.storageMb || 0), 0);
      const totalCalls = tenantReps.reduce((acc, r) => acc + (r.apiCalls || 0), 0);
      res.json({
        success: true,
        tenantId,
        summary: { totalReports: tenantReps.length, totalStorageMb: totalStorage, totalApiCalls: totalCalls }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  ```
* En `src/modules/reports/reports.routes.js` agrega:
  ```javascript
  reportsRouter.get('/summary/:tenantId', reportsController.getUsageSummary);
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/reports/
  git commit -m "feat(reports): agrega endpoint de resumen acumulado de consumo por tenant"
  git push origin feat/tenant-reports
  ```

---

### 🔹 SEMANA 3 (27/07 al 02/08): 🔥 CONFLICTO EN `src/config.js` (Jueves 30/07 con DAVID TORRE)

> **🎯 Meta de la semana:** Resolver el **conflicto de configuración global** contra DAVID TORRE.

#### 1. Tu modificación (Jueves 30-07-2026, 03:00 PM)
Abre `src/config.js`. En el objeto `limits`, agrega la cuota de almacenamiento y reportes:

```javascript
  limits: {
    maxTenants: 50,
    maxRecordsPerTenant: 1000,
    defaultPageSize: 10,
    // [CAMBIO GEANPIER MEZA]: Cuotas de almacenamiento y reportes
    maxReportsPerTenant: 100,
    storageLimitMb: 500
  }
```

Haz commit de tu cambio:
```bash
git add src/config.js
git commit -m "feat(config): agrega cuotas maximas de almacenamiento y reportes por organizacion"
git push origin feat/tenant-reports
```

#### 2. La aparición del conflicto
**DAVID TORRE** ya mergeó sus propios límites (`maxUsersPerTenant`) en ese mismo bloque al mediodía.  
Al traer `main`, se generará el conflicto:
```bash
git checkout feat/tenant-reports
git pull origin main
```

Git mostrará:
```text
CONFLICT (content): Merge conflict in src/config.js
Automatic merge failed; fix conflicts and then commit the result.
```

#### 3. Paso a paso para resolverlo:
Abre `src/config.js` en tu editor. Verás:
```javascript
<<<<<<< HEAD (Tu cambio en feat/tenant-reports)
    maxReportsPerTenant: 100,
    storageLimitMb: 500
=======
    maxUsersPerTenant: 25,
    allowedRoles: ['admin', 'editor', 'viewer']
>>>>>>> main (El cambio del DAVID TORRE ya en main)
```

**Solución:** Ambos conjuntos de límites deben conservarse. Deja el bloque así:
```javascript
  limits: {
    maxTenants: 50,
    maxRecordsPerTenant: 1000,
    defaultPageSize: 10,
    // Límites de usuarios (DAVID TORRE)
    maxUsersPerTenant: 25,
    allowedRoles: ['admin', 'editor', 'viewer'],
    // Cuotas de reportes (GEANPIER MEZA)
    maxReportsPerTenant: 100,
    storageLimitMb: 500
  }
```

Guarda y concluye el merge:
```bash
git add src/config.js
git commit -m "fix(config): resuelve conflicto integrando limites de usuarios y reportes"
git push origin feat/tenant-reports
```
Abre tu PR a `main` y pide a JULIO PARIONA que lo apruebe.

---

### 🔹 SEMANA 4 (03/08 al 09/08): Sincronización semanal

* Mantente actualizado con `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 5 (10/08 al 16/08): Exportación de Reportes a Formato JSON

* **Archivo:** `src/modules/reports/reports.controller.js`
* Agrega endpoint para descargar reporte en JSON estructurado.
* **Comandos Git:**
  ```bash
  git add src/modules/reports/
  git commit -m "feat(reports): agrega exportacion de reporte en formato JSON"
  git push origin feat/tenant-reports
  ```

---

### 🔹 SEMANA 6 (17/08 al 23/08): Sincronización semanal

* Actualiza tu rama con `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 7 (24/08 al 30/08): 🔥 CONFLICTO EN `data/initialData.json` (Miércoles 26/08)

> **¡Atención!** El miércoles 26-08-2026 por la tarde modificarás el archivo de semillas `data/initialData.json` para agregar un reporte inicial adicional.

#### 1. Tu modificación (Miércoles 26-08-2026, 03:00 PM)
Abre `data/initialData.json`. En el array `"reports"` agrega un nuevo reporte:

```json
{
  "id": "rep-002",
  "tenantId": "tenant-002",
  "title": "Auditoría de Almacenamiento Q3",
  "storageMb": 18.2,
  "apiCalls": 9200,
  "status": "generated"
}
```

Commit y push:
```bash
git add data/initialData.json
git commit -m "feat(seed): agrega reporte semilla rep-002 para tenant-002"
git push origin feat/tenant-reports
```

#### 2. La aparición del conflicto
**CRISTHIAN PALOMINO** mergeó su colección `invoices` al mediodía en ese mismo archivo.  
Ejecuta:
```bash
git pull origin main
```
Git indicará:
```text
CONFLICT (content): Merge conflict in data/initialData.json
```

#### 3. Cómo resolverlo:
Abre `data/initialData.json`. Asegúrate de conservar la colección `invoices` de CRISTHIAN PALOMINO y también tu nuevo reporte `rep-002`. Revisa que la sintaxis JSON (comas entre llaves `{}`) sea válida.

Guarda el archivo y finaliza el merge:
```bash
git add data/initialData.json
git commit -m "fix(seed): resuelve conflicto integrando colecciones y reportes semilla"
git push origin feat/tenant-reports
```
Abre tu PR a `main` y notifica a JULIO PARIONA.

---

### 🔹 SEMANA 8 (31/08 al 06/09): Simulación de Datos de Tráfico

* Genera métricas automáticas para pruebas de estrés.
* Sincroniza con `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 9 (07/09 al 13/09): Pruebas de Cierre

* Comprueba que las rutas `/api/reports` respondan rápidamente.
* Actualiza con `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 10 (14/09 al 20/09): Cierre del Proyecto

1. Verifica que tu rama esté al día con `main`:
   ```bash
   git checkout feat/tenant-reports
   git pull origin main
   ```
2. Realiza tu PR final hacia `main`.
3. Una vez aprobado por JULIO PARIONA, actualiza tu `main` local:
   ```bash
   git checkout main
   git pull origin main
   ```
4. ¡Módulo de Reportes finalizado e integrado!
