# Mesa — sistema de diseño

## 0. Evidencia y dirección

- Referencia viva: Trello público, observado con REA en Chromium a 1440 × 1000. Evidencia `ev_9bfebc803b35b29e2bf1d781e0c704c919a8ed1c4d30ad8c7408553a2746ce8a`.
- Alcance observado: página pública de marketing; no se usaron credenciales ni se inspeccionó un tablero privado.
- Inferencia de producto: un lienzo Kanban horizontal con listas y tarjetas es el modelo adecuado para el cronograma de las cinco guías del equipo.
- Dirección propia: “mesa de proyecto al atardecer”. Un fondo azul tinta con luz violeta y listas de papel frío; la fecha de cada reunión funciona como el elemento operativo dominante.
- Marca: nombre, iconos, textos y recursos propios. No se copia el logotipo ni material gráfico de Trello.

## 1. Principios

1. La fecha debe poder leerse y cambiarse desde cada tarjeta en dos acciones.
2. El tablero debe conservar contexto: responsable, semana, estado y próxima reunión.
3. La interfaz debe seguir siendo utilizable con teclado, zoom al 200 % y movimiento reducido.
4. El fondo aporta profundidad; las superficies de trabajo priorizan contraste y legibilidad.

## 2. Tokens

### Color

- `--canvas-900`: #111a3a
- `--canvas-800`: #182759
- `--canvas-glow`: #6d5ce8
- `--surface-list`: #f1f3f7
- `--surface-card`: #ffffff
- `--ink-900`: #172033
- `--ink-600`: #566079
- `--ink-inverse`: #ffffff
- `--accent-600`: #5d4ed6
- `--accent-100`: #ebe9ff
- `--success-600`: #237a57
- `--warning-600`: #a85d10
- `--danger-600`: #b4364f
- `--line`: rgba(23, 32, 51, 0.12)

### Tipografía

- Familia: `Inter`, `Segoe UI`, sistema sans-serif.
- Display: 700, 24–32 px, tracking -0.03 em.
- Títulos: 650, 14–18 px.
- Cuerpo: 400–550, 13–15 px, line-height 1.45.
- Metadata: 600, 11–12 px, tracking 0.02 em.

### Espacio, radio y profundidad

- Escala: 4, 8, 12, 16, 24, 32 px.
- Radios: control 8 px; tarjeta 12 px; lista 16 px; diálogo 20 px.
- Sombra de tarjeta: 0 1px 1px rgba(10,18,40,.08), 0 6px 18px rgba(10,18,40,.08).
- Sombra flotante: 0 24px 80px rgba(4,8,28,.35).

## 3. Estructura y scroll

- `AppShell`: alto de viewport, filas `topbar / board-header / board`.
- `Topbar`: navegación global fija dentro del shell.
- `BoardHeader`: título, resumen y miembros; no contiene el scroll del tablero.
- `BoardCanvas`: dueño del scroll horizontal y vertical; `min-block-size: 0`.
- `ListLane`: ancho 304 px; altura ajustada al contenido con máximo del viewport.
- Móvil: la barra se simplifica y las listas conservan desplazamiento horizontal con snap suave.

## 4. Composición

- Cuatro fases visibles: Arranque, Construcción, Integración y Cierre.
- Cada lista muestra conteo y tarjetas apiladas.
- Cada tarjeta contiene etiqueta de semana, título, responsable y un botón-fecha.
- El bloque de cinco avatares comunica que el tablero pertenece al equipo completo.

## 5. Primitivas y estados

- `IconButton`: default, hover, focus-visible, pressed, disabled.
- `MemberAvatar`: imagen ausente → iniciales; tooltip accesible mediante `title` y nombre en texto asistivo.
- `MeetingCard`: default, hover elevado, focus-within, overdue, completed.
- `DateChip`: neutral, próxima, hoy, vencida; es un botón real con nombre accesible.
- `MeetingDialog`: opening, editing, saving, success, validation error; foco contenido por el elemento nativo `dialog`.
- `Toast`: éxito/error, `aria-live="polite"`, autocierre respetando lectura.
- `SearchPopover`: cerrado, búsqueda activa, sin resultados y resultados filtrados; `Escape` cierra y devuelve el foco.
- `ProfileMenu`: cerrado/abierto; presenta identidad y estado local, sin simular autenticación remota.
- `ListMenu`: cerrado/abierto, renombrar y eliminar; eliminar una lista con tarjetas queda bloqueado con explicación.
- `CardDialog`: crear/editar, guardando, error y confirmación destructiva; título, descripción, fase, responsable, fecha y hora.
- `CalendarView`: alterna con el tablero, ordena reuniones por fecha y conserva edición directa.
- `AddListControl`: reposo, edición y error; añade una fase al final del lienzo.

## 6. Movimiento

- Tarjetas: elevación con `transform: translateY(-2px)` y sombra, 160 ms ease-out.
- Diálogo: opacidad + escala 0.98 → 1 en 180 ms.
- `prefers-reduced-motion: reduce`: elimina transformaciones y transiciones.

## 7. Responsive

- ≥ 1024 px: cabecera completa y 4 columnas en lienzo horizontal.
- 600–1023 px: acciones compactas, listas de 288 px.
- < 600 px: título de 22 px, oculta texto no esencial, listas de 86vw y controles táctiles ≥ 44 px.

## 8. Accesibilidad, deuda y QA

- Contraste mínimo AA; foco visible de 3 px exclusivamente para teclado.
- Ninguna interacción depende solo del color.
- Fechas se muestran en español y se almacenan como `YYYY-MM-DD` sin conversión UTC.
- Deuda aceptada: no hay autenticación ni sincronización multiusuario; el movimiento entre fases usa un selector accesible en vez de arrastre.
- Estados a verificar: tablero, calendario, búsqueda con/sin resultados, menús, CRUD de reuniones y fases, persistencia tras recarga, móvil 390 px y escritorio 1440 px.

