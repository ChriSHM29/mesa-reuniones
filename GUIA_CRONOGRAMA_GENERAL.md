# 📅 GUÍA Y CRONOGRAMA GENERAL: 10 SEMANAS (HERRAMIENTAS DE DESARROLLO)

> **Proyecto:** BaaS Lite Platform  
> **Inicio:** Martes 14 de Julio de 2026  
> **Fin:** Domingo 20 de Septiembre de 2026  
> **Objetivo principal:** Simular el ciclo de vida de desarrollo de software colaborativo, trabajo con ramas concurrentes en GitHub y resolución estratégica de conflictos de merge.

---

## 👥 Equipo y Distribución de Ramas (6 Ramas en Total)

| Rol | Miembro | Rama de Trabajo | Módulo Asignado |
| :--- | :--- | :--- | :--- |
| **JULIO PARIONA** | Integrante 0 | `feat/owner-dashboard` (y control de `main`) | Dashboard Superadmin, métricas globales y salud SQLite |
| **CHRISTIAN MUÑOA** | Integrante 1 | `feat/tenant-management` | Módulo de Gestión de Tenants / Organizaciones |
| **CRISTHIAN PALOMINO** | Integrante 2 | `feat/tenant-data` | Módulo de Datos Dinámicos y Colecciones No-Code |
| **DAVID TORRE** | Integrante 3 | `feat/tenant-users` | Módulo de Usuarios, Roles y Permisos |
| **GEANPIER MEZA** | Integrante 4 | `feat/tenant-reports` | Módulo de Analítica, Consumo y Reportes |
| **Release / Producción** | Todo el equipo | `main` | Rama principal protegida; solo recibe merges aprobados |

---

## 🗓️ Calendario Consolidado de 10 Semanas y Puntos de Conflicto

```
====================================================================================================
SEMANA 1 (14/07 - 19/07): Setup Inicial & Registro Central de Rutas
  🔥 CONFLICTO 1: Miércoles 15/07 (ANTES DEL JUEVES 16/07)
     - Archivo: src/routes.js
     - Actores: CHRISTIAN MUÑOA vs CRISTHIAN PALOMINO
     - Razón: Ambos registran sus endpoints en la misma línea del despachador central.
====================================================================================================
SEMANA 2 (20/07 - 26/07): Persistencia SQLite & Drizzle ORM
     - Cada integrante afina las consultas a la base de datos de su módulo.
     - Merges progresivos hacia main sin colisiones.
====================================================================================================
SEMANA 3 (27/07 - 02/08): Configuración Global & Constantes
  🔥 CONFLICTO 2: Jueves 30/07
     - Archivo: src/config.js
     - Actores: DAVID TORRE vs GEANPIER MEZA
     - Razón: Modificación concurrente de límites de usuarios y reportes en el objeto limits.
====================================================================================================
SEMANA 4 (03/08 - 09/08): Vistas y Estilos con TailwindCSS
     - Enlace de endpoints con componentes de interfaz responsiva en EJS.
====================================================================================================
SEMANA 5 (10/08 - 16/08): Navegación Principal y Experiencia de Usuario
  🔥 CONFLICTO 3: Viernes 14/08
     - Archivo: views/partials/navbar.ejs
     - Actores: JULIO PARIONA vs CHRISTIAN MUÑOA
     - Razón: Rediseño del menú de navegación y badges de estado.
====================================================================================================
SEMANA 6 (17/08 - 23/08): Validaciones y Reglas de Negocio
     - Integración de filtros por estado y validación de campos obligatorios en los controladores.
====================================================================================================
SEMANA 7 (24/08 - 30/08): Semillero de Datos Iniciales
  🔥 CONFLICTO 4: Miércoles 26/08
     - Archivo: data/initialData.json
     - Actores: GEANPIER MEZA vs CRISTHIAN PALOMINO
     - Razón: Modificación concurrente de colecciones y registros de prueba iniciales.
====================================================================================================
SEMANA 8 (31/08 - 06/09): Optimización de Consultas y Endpoints REST
     - Refactorización de queries en Drizzle ORM y pruebas de tiempo de respuesta.
====================================================================================================
SEMANA 9 (07/09 - 13/09): Cierre del Servidor, Middlewares de Seguridad y Logs
  🔥 CONFLICTO 5: Jueves 10/09
     - Archivo: src/server.js
     - Actores: DAVID TORRE vs JULIO PARIONA
     - Razón: Inserción de middleware de auditoría vs middleware de métricas en server.js.
====================================================================================================
SEMANA 10 (14/09 - 20/09): Estabilización, Auditoría de Código y Release Final
     - Verificación conjunta del servidor, limpieza de ramas y entrega académica del repositorio.
====================================================================================================
```

---

## 📌 Reglas de Oro para el Equipo

1. **Nunca commitear directamente a `main`:** Todo cambio debe nacer en la rama `feat/...` de cada miembro.
2. **Antes de crear un Pull Request:** Siempre hacer `git pull origin main` en su rama local para detectar y resolver cualquier conflicto en su máquina antes de subir los cambios.
3. **Mensajes de Commit Claros:** Usar el estándar:
   - `feat(tenants): agrega endpoint para registro de organizaciones`
   - `fix(routes): resuelve conflicto de merge con modulo de datos`
   - `docs(readme): actualiza instrucciones de instalacion`
4. **Al resolver un conflicto:** Siempre comunicarse con el compañero con quien colisionó para no borrar el código del otro por accidente; ambos códigos deben convivir.
