# OmT Apps

*by OmT Finance*

Versión **0.1.0** (se muestra en la pantalla de inicio y en el pie). Las correcciones y ajustes suben el último número (0.1.1); las novedades, el del medio (0.2.0).

Web pública (PWA estática) que presenta todas las apps de OmT Finance y da acceso a cada una: UnderCTRL, PayCTRL, DocCTRL, TaskCTRL, Up to 40% y RandomIt.

## Funcionamiento

- Pantalla de inicio con el logo; al pulsar **Entrar** se pasa al catálogo. Un enlace directo a una app (`/#taskctrl`) se salta la pantalla de inicio y abre su ficha.
- **Presentación** con el número de apps, y las apps agrupadas por secciones (Finanzas, Día a día, Ocio). Cada tarjeta lleva el icono, el color y el degradado de su app, la versión y unas etiquetas.
- **Abrir** va a la app en otra pestaña. Si una app aún no tiene dirección, sale como «Próximamente».
- **Ficha** de cada app (al tocar la tarjeta o «Detalles»): descripción, qué puedes hacer, cómo instalarla (pasos para iPhone, Android u ordenador según el dispositivo) y **Compartir** el enlace de la ficha. El botón Atrás del móvil la cierra.
- Menú ⋯: **Compartir esta web** y **Opciones de visualización** (oscuro / claro / automático y 4 fondos: Aurora, Glaciar, Coral y Menta).

## Añadir o actualizar una app

Todo está en `apps.js`:

1. Copia el `icons/icon.svg` de la app a `icons/apps/<id>.svg` y añádelo a `ASSETS` en `sw.js`.
2. Añade una entrada a `APPS` (nombre con la parte en degradado entre `<b>`, versión, colores, frase, descripción, funciones, etiquetas y `url`).
3. Al subir la versión de una app, cambia aquí su `version`.
4. Sube `CACHE` en `sw.js` (omtapps-vN) y `APP_VERSION` en `app.js`.

## Publicar

Repositorio en GitHub y proyecto en Vercel sin configuración (sitio estático, sin funciones).
