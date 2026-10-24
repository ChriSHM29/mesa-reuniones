# Mesa

Tablero Kanban para coordinar las reuniones del equipo BaaS Lite. Permite consultar y cambiar fecha y hora de cada reunión, con persistencia en JSON.

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

## Alcance del MVP

- Tablero con cuatro estados y los cinco integrantes.
- Reuniones iniciales basadas en el cronograma del proyecto.
- Edición validada de fecha y hora.
- Persistencia local atómica en `data/board.json`.
- Diseño responsivo y accesible con identidad propia.

No incluye autenticación, colaboración en tiempo real ni arrastre entre columnas.

