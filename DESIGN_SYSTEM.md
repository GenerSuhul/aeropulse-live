# Sistema de diseño de AeroPulse Live

## 1. Propósito

Este documento establece el lenguaje visual común de AeroPulse Live. Es el contrato que deben seguir Radar Live, Explorador y Centro de Operaciones para que la plataforma se perciba como un solo producto profesional, accesible y mantenible. Los tokens viven en `tailwind.config.js`; los ejemplos aquí descritos no reemplazan esos valores.

## 2. Referencia visual

La referencia recibida muestra un dashboard administrativo con sidebar blanco fijo, topbar blanca, fondo gris muy claro y tarjetas blancas de borde tenue. La navegación agrupa opciones con iconos lineales y deja una separación amplia entre secciones. El contenido usa breadcrumbs, títulos cortos, métricas grandes, grids fluidos y superficies con sombras casi imperceptibles. La jerarquía depende de tamaño, peso, espaciado y contraste, no de grandes bloques saturados.

AeroPulse toma de esa referencia la claridad estructural, densidad, ritmo vertical, bordes, sombras y comportamiento responsivo. No copia el nombre Vristo, su logotipo, textos, activos, gráficos, código ni identidad comercial. La identidad propia se apoya en aviación, geolocalización, azul AeroPulse e indicadores operativos.

## 3. Tipografía

- Familia principal: `Nunito`.
- Fallback: `Inter, ui-sans-serif, system-ui, sans-serif`.
- Peso 400: cuerpo y ayudas; 500: etiquetas; 600: botones y subtítulos; 700: títulos y métricas.
- Título de página: 30 px/36 px en escritorio, 24 px/32 px en móvil, peso 700.
- Título de sección: 20 px/28 px, peso 700.
- Subtítulo: 16 px/24 px, peso 600.
- Cuerpo: 14–16 px/20–24 px, peso 400.
- Etiqueta: 12–14 px/16–20 px, peso 600.
- Métrica: 24–30 px/32–36 px, peso 700, números tabulares cuando sea útil.

Ejemplo: `class="text-2xl font-bold tracking-tight sm:text-3xl"` para un título; `class="text-sm text-ink-secondary"` para cuerpo secundario.

## 4. Paleta

| Token | Valor | Uso permitido | Uso prohibido |
|---|---:|---|---|
| `primary` | `#4361EE` | Acción primaria, enlace activo, foco, aeronave | Superficies extensas |
| `primary-dark` | `#3046C5` | Hover/active de acción primaria | Texto de cuerpo |
| `primary-soft` | `#EEF2FF` | Fondo de selección o icono | Texto de bajo contraste |
| `secondary` | `#805DCA` | Acento secundario puntual | Reemplazar al primario |
| `success` | `#00AB55` | En vivo, correcto, en vuelo | Decoración sin significado |
| `success-soft` | `#E7F8F0` | Fondo de badge de éxito | Texto principal |
| `warning` | `#E2A03F` | Mock, precaución, selección del mapa | Grandes fondos |
| `warning-soft` | `#FFF6E5` | Fondo de aviso | Botón primario |
| `danger` | `#E7515A` | Error, offline, acción destructiva | Estado neutro |
| `danger-soft` | `#FDEDEF` | Fondo de error | Texto sin contraste |
| `info` | `#2196F3` | Información secundaria | Mezclar con success |
| `background` | `#F5F7FA` | Fondo de la aplicación | Tarjeta interactiva |
| `surface` | `#FFFFFF` | Tarjeta, sidebar, topbar | Separador |
| `surface-muted` | `#F8FAFC` | Hover y subpanel neutro | Texto |
| `border` | `#E5E7EB` | Bordes y separadores | Texto normal |
| `text-primary` / `ink` | `#0E1726` | Texto principal | Fondo grande |
| `text-secondary` / `ink-secondary` | `#6B7280` | Texto secundario | Texto crítico pequeño |
| `text-muted` / `ink-muted` | `#9CA3AF` | Placeholder y metadatos | Contenido esencial |

Todo estado debe incluir texto o iconografía además de color.

## 5. Espaciado

La unidad base es 4 px. Escala autorizada: 4, 8, 12, 16, 20, 24, 32 y 40 px. Dentro de controles usar 8–12 px; dentro de tarjetas 16–24 px; entre secciones 20–32 px. Evitar medidas intermedias sin justificación.

## 6. Radios y sombras

- Tarjeta: 12 px (`rounded-card`).
- Control y botón: 8 px (`rounded-lg` o `rounded-control`).
- Badge: 9999 px (`rounded-full`).
- Panel grande/modal: 14 px (`rounded-panel`).
- Sombra de tarjeta: `0 1px 2px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.05)` (`shadow-card`).
- Panel elevado: `0 10px 30px rgba(15,23,42,.10)` (`shadow-panel`).

No crear otras sombras sin actualizar primero este documento y el token central.

## 7. Layout

- Sidebar: 272 px expandido y 80 px contraído; blanco, borde derecho y alto completo. En móvil se convierte en drawer con overlay, Escape, restauración de foco y bloqueo de scroll.
- Topbar: 70 px, sticky, blanca con borde inferior; búsqueda visual, conectividad, notificaciones demo y avatar.
- Contenido: fondo `background`, padding 16 px móvil, 24 px tableta y 32 px escritorio; ancho fluido con máximo muy amplio de 1800 px por la naturaleza del mapa.
- Grid: 12 columnas conceptuales. En Radar el mapa ocupa aproximadamente 2/3 y el detalle 1/3 en `xl`; debajo de ese breakpoint se apilan.
- Breakpoints Tailwind: `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536 px.

## 8. Componentes

### Tarjeta

- Anatomía: contenedor, encabezado opcional, cuerpo y acciones opcionales.
- Variantes: normal, seleccionada (`bg-primary-soft`), elevada (`shadow-panel`).
- Estados: default, hover si es interactiva, focus visible, disabled.
- Clases: `rounded-card border border-border bg-white p-4 shadow-card sm:p-5`.
- Accesibilidad: usar elemento semántico; no hacer toda la tarjeta clicable si contiene otros controles.
- Ejemplo: `<article class="rounded-card border border-border bg-white p-5 shadow-card">…</article>`.

### Botón primario

- Anatomía: icono opcional, etiqueta y spinner opcional.
- Variantes: normal y compacta.
- Estados: hover `primary-dark`, focus, active y disabled con opacidad.
- Clases: `inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 font-bold text-white hover:bg-primary-dark disabled:opacity-50`.
- Accesibilidad: texto visible o `aria-label`; conservar 44 px táctiles.

### Botón secundario

- Borde neutro, superficie blanca y texto secundario.
- Clases: `min-h-11 rounded-lg border border-border bg-white px-4 font-bold text-ink-secondary hover:bg-surface-muted`.
- No usarlo para la acción principal del flujo.

### Botón peligro

- Solo para acciones destructivas o recuperación de error relevante.
- Clases: `min-h-11 rounded-lg bg-danger px-4 font-bold text-white`.
- Requiere etiqueta explícita; confirmar si la acción no es recuperable.

### Botón de icono

- Área mínima 44×44 px; icono Lucide de 16–20 px.
- Clases: `grid size-11 place-items-center rounded-lg hover:bg-surface-muted`.
- Siempre incluir `aria-label`; `title` no es sustituto.

### Input

- Anatomía: label, control, ayuda y error persistente para evitar saltos.
- Clases: `min-h-11 w-full rounded-lg border border-border px-3 focus:border-primary`.
- Error: mensaje asociado con `aria-describedby`; no depender solo del borde rojo.

### Select

- Mismas dimensiones y borde del input, fondo blanco.
- Clases: `min-h-11 rounded-lg border border-border bg-white px-3`.
- Debe tener `label`, aunque sea `sr-only`.

### Badge

- Anatomía: punto/icono opcional y etiqueta breve.
- Variantes: success, warning, danger, info, mock y neutral.
- Clases base: `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold`.
- No comunicar un estado únicamente con color.

### Métrica

- Anatomía: etiqueta, valor, nota e icono sobre fondo suave.
- Variantes solo por significado del icono, no por decoración.
- Clases de valor: `text-2xl font-bold tracking-tight sm:text-3xl`.
- Los datos ausentes se muestran como `—` o “No disponible”; nunca `null`, `undefined` o `NaN`.

### Tabla o lista de datos

- Encabezado sticky opcional, filas de al menos 48 px y hover neutro.
- En móvil convertir a lista/tarjetas; nunca provocar scroll horizontal para datos esenciales.
- Selección con `aria-pressed` o `aria-selected` y fondo `primary-soft`.

### Panel lateral

- Encabezado, contenido con scroll y acciones fijas opcionales.
- Escritorio: 28–35 % del contenido. Móvil: tarjeta debajo o bottom sheet.
- Si funciona como diálogo, usar `role="dialog"`, `aria-modal`, Escape y gestión de foco.

### Modal

- Fondo overlay `bg-slate-950/35`, panel `rounded-panel bg-white shadow-panel`.
- Debe atrapar/restaurar foco, cerrar por Escape cuando sea seguro y rotularse con `aria-labelledby`.

### Skeleton

- Replicar la forma general del contenido sin texto falso.
- Usar `animate-pulse` solo si no se solicita movimiento reducido; incluir `role="status"` y mensaje para lectores de pantalla.

### Empty state

- Icono Lucide, título descriptivo, explicación y una acción útil.
- No culpar al usuario. Ejemplo: “No se detectaron aeronaves…” + “Actualizar”.

### Error state

- Explicación comprensible, sin stack trace, con “Reintentar” y alternativa válida.
- Usar `role="alert"`, `danger-soft` y texto `danger` con contraste.

### Toast

- Para confirmaciones transitorias no críticas; esquina inferior en escritorio y ancho casi completo en móvil.
- Debe poder pausarse al recibir hover/foco y no desaparecer demasiado rápido.
- No usar toast como único lugar para un error de formulario.

## 9. Iconografía

Usar exclusivamente Lucide Angular y los SVG propios documentados. Tamaños: 16 px en botón compacto, 18–20 px en navegación, 22–24 px en tarjetas. Mantener `stroke-width` visual coherente. Iconos decorativos llevan `aria-hidden="true"`; controles sin texto llevan `aria-label`. No usar emojis ni mezclar familias de iconos.

## 10. Estados de datos

- `loading`: skeleton y preparación del mapa solo en primera carga.
- `refreshing`: datos previos visibles, indicador discreto y acción temporalmente deshabilitada.
- `success`: badge “En vivo” y hora de actualización.
- `warning`: dato degradado o selección desaparecida; conserva contexto.
- `error`: mensaje tipado, reintento y alternativa mock.
- `offline`: badge “Sin conexión” y últimos datos conservados.
- `mock`: badge “Datos simulados” y fuente claramente indicada.
- `empty`: explicación y acciones para radio, ubicación o actualización.

## 11. Responsive

- Móvil: una columna, padding 16 px, sidebar en drawer, botones de 44 px, filtros colapsables, mapa mínimo 430 px y detalle debajo.
- Tableta: métricas en dos columnas, mapa completo, detalle y lista debajo.
- Escritorio: cuatro métricas, mapa 65–72 %, detalle 28–35 %, lista inferior.
- Textos largos deben truncarse o envolver; nunca debe aparecer scroll horizontal global.
- Priorizar callsign, estado, altitud y velocidad antes que metadatos secundarios.

## 12. Reglas de consistencia

- No inventar colores ni duplicar hexadecimales fuera de los tokens.
- No usar estilos inline ni crear sombras distintas sin documentarlas.
- No usar fuentes distintas de Nunito y sus fallbacks.
- No usar emojis como iconos ni copiar código/activos de plantillas comerciales.
- Reutilizar componentes solo cuando exista reutilización real; evitar abstracciones sin consumidor.
- Respetar tokens, escala de 4 px, contraste AA, foco visible y áreas táctiles.
- Mantener DTOs y lógica de proveedor fuera de componentes visuales.

## 13. Lista de verificación

- [ ] Usa Nunito, tokens centrales y Tailwind como sistema principal.
- [ ] Conserva sidebar, topbar, fondo y ritmos definidos.
- [ ] No agrega un color, radio o sombra sin documentarlo.
- [ ] Usa Lucide, sin emojis ni familias mezcladas.
- [ ] Todos los botones tienen hover, focus, active y disabled cuando aplica.
- [ ] Todos los controles tienen label y errores asociados.
- [ ] La navegación funciona con teclado y Escape cierra overlays.
- [ ] El contenido cumple contraste AA y no depende solo del color.
- [ ] Móvil no tiene scroll horizontal y los controles miden al menos 44 px.
- [ ] Loading, refreshing, empty, error, offline y mock están tratados.
- [ ] Ningún dato ausente muestra `null`, `undefined` o `NaN`.
- [ ] Los componentes compartidos no dependen de un dominio específico.
- [ ] Se ejecutaron pruebas, lint y build de producción antes de integrar.
