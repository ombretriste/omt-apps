# OmT Apps

*by OmT Finance*

Versión **0.2.0** (se muestra en la pantalla de inicio y en el pie). Las correcciones y ajustes suben el último número (0.1.1); las novedades, el del medio (0.2.0).

Web pública (PWA estática) que presenta todas las apps de OmT Finance y da acceso a cada una: UnderCTRL, PayCTRL, DocCTRL, TaskCTRL, Up to 40% y RandomIt.

## Funcionamiento

- **Intro animada**: los iconos de todas las apps llegan volando desde fuera de la pantalla, orbitan alrededor del logo, se colocan en fila y aparece la frase «Apps sencillas para tu día a día» palabra a palabra; al final, el botón **Entrar**. **Saltar** la lleva directamente al final (y con «reducir movimiento» del sistema no hay animación). Un enlace directo a una app (`/#taskctrl`) se salta la intro y abre su ficha.
- **Bloques por sección** (Finanzas, Día a día, Ocio), cada uno con su color, que se deslizan: con el dedo en móvil y tablet; con el ratón arrastrando, con la rueda (un bloque por gesto), con las flechas laterales o las del teclado; y con las pestañas de arriba, cuyo indicador sigue al bloque. Los bloques laterales giran y se alejan en efecto carrusel.
- **Iconos grandes** de cada app que flotan, se mueven un poco con el ratón (paralaje, igual que las luces de fondo del bloque) y se iluminan al pasar por encima.
- **Ficha** de cada app al pulsar su icono: descripción, qué puedes hacer, cómo instalarla (pasos para iPhone, Android u ordenador según el dispositivo), **Compartir** y **Abrir app** (en otra pestaña; sin dirección sale «Próximamente»). El botón Atrás del móvil la cierra.
- Menú ⋯: **Compartir esta web** y **Opciones de visualización** (oscuro / claro / automático y 4 fondos: Aurora, Glaciar, Coral y Menta).

## Añadir o actualizar una app

Todo está en `apps.js`:

1. Copia el `icons/icon.svg` de la app a `icons/apps/<id>.svg` y añádelo a `ASSETS` en `sw.js`.
2. Añade una entrada a `APPS` (con su `section`; las secciones y sus colores están en `SECTIONS`) (nombre con la parte en degradado entre `<b>`, versión, colores, frase, descripción, funciones, etiquetas y `url`).
3. Al subir la versión de una app, cambia aquí su `version`.
4. Sube `CACHE` en `sw.js` (omtapps-vN) y `APP_VERSION` en `app.js`.

## Publicar

Repositorio en GitHub y proyecto en Vercel sin configuración (sitio estático, sin funciones).
