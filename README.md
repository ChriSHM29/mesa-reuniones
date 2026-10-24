# Mesa

Tablero Kanban para coordinar las reuniones del equipo BaaS Lite. Replica el flujo operativo central de Trello para este caso de uso, con persistencia local en JSON.

## Ejecutar

Requiere Python 3.11 o posterior, sin dependencias externas.

```powershell
python app.py
```

Abre `http://127.0.0.1:3000`.

## Pruebas

```powershell
python -m unittest discover -s tests -v
```

## Funciones

- Tablero con cuatro fases y los cinco integrantes.
- Nueve reuniones semanales entre el 28 de agosto y el 23 de octubre de 2026.
- Creación, edición y eliminación de reuniones.
- Cambio de fase de cada tarjeta desde el propio tablero.
- Creación, cambio de nombre y eliminación segura de fases vacías.
- Búsqueda por título, descripción o responsable.
- Vista de calendario y acceso al perfil del responsable principal.
- Validación de fechas, horas, responsables, participantes y fases.
- Persistencia local atómica en `data/board.json`.
- Diseño responsivo y accesible con identidad propia.

No pretende reproducir toda la plataforma comercial de Trello: no incluye autenticación, colaboración en tiempo real, adjuntos, automatizaciones ni arrastre entre columnas. El movimiento accesible de tarjetas se realiza mediante el selector de fase.

