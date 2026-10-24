# 💾 GUÍA DE DESARROLLO: INTEGRANTE 2

> **Rol:** Especialista en Datos Dinámicos y Colecciones No-Code  
> **Rama asignada:** `feat/tenant-data`  
> **Fechas del proyecto:** 14 de Julio de 2026 – 20 de Septiembre de 2026 (10 Semanas)  
> **Archivos clave:** `src/modules/data/`, `src/routes.js`, `data/initialData.json`

---

## 🚀 PASO INICIAL: Clonar y Crear tu Rama (Martes 14-07-2026)

1. Abre tu terminal y clona el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO_GITHUB>
   cd PF
   ```
2. Instala dependencias y prueba que arranque:
   ```bash
   npm install
   npm start
   ```
   *(Ingresa a `http://localhost:3000` en tu navegador. Presiona `Ctrl + C` para detenerlo).*
3. Crea y cámbiate a tu rama de trabajo:
   ```bash
   git checkout -b feat/tenant-data
   git push -u origin feat/tenant-data
   ```

---

## 🗓️ PLAN DE TRABAJO SEMANA A SEMANA

---

### 🔹 SEMANA 1 (14/07 al 19/07): 🔥 CONFLICTO EN `src/routes.js` (Miércoles 15/07 - ANTES DEL JUEVES)

> **🎯 Meta de la semana:** Conectar el módulo de datos y resolver el **primer conflicto de merge del equipo** el miércoles 15-07-2026 antes del jueves 16-07-2026.

#### 1. Tu modificación inicial (Miércoles 15-07-2026, 03:00 PM)
Abre `src/routes.js` en tu editor:

1. Al inicio del archivo, importa el enrutador de datos:
   ```javascript
   import { dataRouter } from './modules/data/data.routes.js';
   ```
2. En la línea 15 aproximadamente (en el bloque de comentarios de módulos), registra tu ruta:
   ```javascript
   apiRouter.use('/api/data', dataRouter);
   ```
3. Guarda el archivo y realiza commit:
   ```bash
   git add src/routes.js
   git commit -m "feat(routes): registra enrutador del modulo data en /api/data"
   git push origin feat/tenant-data
   ```

#### 2. La aparición del conflicto
El **CHRISTIAN MUÑOA** ya subió y mergeó su módulo `tenantsRouter` a `main` al mediodía en esa misma línea.  
Cuando intentes abrir tu Pull Request en GitHub o intentes traer los cambios de `main`, aparecerá el conflicto.

Ejecuta en tu terminal:
```bash
git checkout feat/tenant-data
git pull origin main
```

La consola te alertará:
```text
Auto-merging src/routes.js
CONFLICT (content): Merge conflict in src/routes.js
Automatic merge failed; fix conflicts and then commit the result.
```

#### 3. Paso a paso para resolver el conflicto:
Abre `src/routes.js` en tu editor (VS Code resaltará el conflicto en rojo y verde). Verás algo como esto:

```javascript
<<<<<<< HEAD (Tu código en feat/tenant-data)
import { dataRouter } from './modules/data/data.routes.js';
...
apiRouter.use('/api/data', dataRouter);
=======
import { tenantsRouter } from './modules/tenants/tenants.routes.js';
...
apiRouter.use('/api/tenants', tenantsRouter);
>>>>>>> main (El código de CHRISTIAN MUÑOA que ya está en main)
```

**Regla de oro:** ¡No debes borrar el código de tu compañero ni el tuyo! Ambos módulos deben coexistir.

**Edita el archivo manualmente para que quede así de limpio:**
```javascript
import { Router } from 'express';
import { ownerRouter } from './modules/owner/owner.routes.js';
import { tenantsRouter } from './modules/tenants/tenants.routes.js';
import { dataRouter } from './modules/data/data.routes.js';

export const apiRouter = Router();

// Módulo Superadmin / Owner
apiRouter.use('/', ownerRouter);

// Módulos integrados
apiRouter.use('/api/tenants', tenantsRouter);
apiRouter.use('/api/data', dataRouter);
```

#### 4. Confirmar y subir la resolución del conflicto
Guarda el archivo en tu editor y corre en la terminal:
```bash
# 1. Marcar el archivo como resuelto
git add src/routes.js

# 2. Concluir el commit de merge
git commit -m "fix(routes): resuelve conflicto integrando enrutadores de tenants y data"

# 3. Subir el cambio a GitHub
git push origin feat/tenant-data
```
4. Ahora ve a GitHub: tu Pull Request aparecerá en color **verde ("Able to merge")**.
5. Avísale a JULIO PARIONA para que apruebe y mergee tu PR a `main`. ¡Primer conflicto superado con éxito!

---

### 🔹 SEMANA 2 (20/07 al 26/07): Gestión de Documentos / Registros

* **Fecha:** Miércoles 22-07-2026
* **Archivo:** `src/modules/data/data.controller.js`
* Agrega la función para insertar registros dentro de una colección:
  ```javascript
  // Insertar registro dinámico
  async insertRecord(req, res) {
    try {
      const { collectionId } = req.params;
      const { tenantId, data } = req.body;
      const newRec = {
        id: `rec-${Date.now()}`,
        collectionId,
        tenantId: tenantId || 'tenant-001',
        dataJson: JSON.stringify(data || {}),
        createdAt: new Date().toISOString()
      };
      await db.insert(records).values(newRec);
      res.status(201).json({ success: true, data: newRec });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
  ```
* En `src/modules/data/data.routes.js` agrega:
  ```javascript
  dataRouter.post('/collections/:collectionId/records', dataController.insertRecord);
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/data/
  git commit -m "feat(data): agrega endpoint para insertar documentos en colecciones"
  git push origin feat/tenant-data
  ```

---

### 🔹 SEMANA 3 (27/07 al 02/08): Sincronización semanal

* Actualiza tu rama con `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 4 (03/08 al 09/08): Consulta de Registros Filtrados por Tenant

* **Archivo:** `src/modules/data/data.controller.js`
* Agrega endpoint para obtener registros de una colección por tenant:
  ```javascript
  // Listar registros de una colección
  async listRecords(req, res) {
    try {
      const { collectionId } = req.params;
      const all = await db.select().from(records).where(eq(records.collectionId, collectionId));
      res.json({ success: true, data: all });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  ```
* **Comandos Git:**
  ```bash
  git add src/modules/data/
  git commit -m "feat(data): implementa consulta de registros por coleccion"
  git push origin feat/tenant-data
  ```

---

### 🔹 SEMANA 5 (10/08 al 16/08): Sincronización con main

* JULIO PARIONA y CHRISTIAN MUÑOA resolvieron el conflicto del Navbar. Trae sus cambios:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 6 (17/08 al 23/08): Eliminación Lógica de Colecciones

* **Archivo:** `src/modules/data/data.controller.js`
* Agrega función para eliminar colección por ID.
* **Comandos Git:**
  ```bash
  git add src/modules/data/
  git commit -m "feat(data): agrega eliminacion de colecciones"
  git push origin feat/tenant-data
  ```

---

### 🔹 SEMANA 7 (24/08 al 30/08): 🔥 CONFLICTO EN `data/initialData.json` CON GEANPIER MEZA

> **¡Atención!** El miércoles 26-08-2026, modificarás el archivo de semillas `data/initialData.json` para agregar colecciones de prueba.

#### 1. Tu modificación (Miércoles 26-08-2026, 10:00 AM)
Abre `data/initialData.json` y dentro del array `"collections"` agrega una segunda colección:

```json
{
  "id": "col-002",
  "tenantId": "tenant-002",
  "name": "invoices",
  "recordsCount": 8,
  "createdAt": "2026-08-26T10:00:00.000Z"
}
```

#### 2. Sube tu cambio primero:
```bash
git add data/initialData.json
git commit -m "feat(seed): agrega coleccion invoices a los datos iniciales"
git push origin feat/tenant-data
```
Abre tu PR y pide a JULIO PARIONA que lo mergee a `main` a las 11:30 AM. (GEANPIER MEZA colisionará contigo más tarde ese día y tú estarás atento para orientarlo).

---

### 🔹 SEMANA 8 (31/08 al 06/09): Validaciones JSON en Creación de Registros

* Valida que el campo `data` enviado en el cuerpo de la petición sea un objeto JSON válido antes de guardarlo en SQLite.
* **Comandos Git:**
  ```bash
  git add src/modules/data/data.controller.js
  git commit -m "refactor(data): valida estructura del payload JSON"
  git push origin feat/tenant-data
  ```

---

### 🔹 SEMANA 9 (07/09 al 13/09): Pruebas de Rendimiento

* Realiza consultas con 100 registros en SQLite para comprobar tiempos de respuesta menores a 50ms.
* Sincroniza con `main`:
  ```bash
  git pull origin main
  ```

---

### 🔹 SEMANA 10 (14/09 al 20/09): Cierre del Proyecto

1. Verifica que tu rama esté al día:
   ```bash
   git checkout feat/tenant-data
   git pull origin main
   ```
2. Realiza tu PR final hacia `main`.
3. Una vez aprobado por JULIO PARIONA, actualiza tu `main` local:
   ```bash
   git checkout main
   git pull origin main
   ```
4. ¡Módulo de Datos finalizado e integrado!
