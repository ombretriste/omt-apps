# OmT Apps

*by OmT Finance*

Versión **0.6.1** (no se muestra en la web: está en menú ⋯ → Información). Las correcciones y ajustes suben el último número (0.1.1); las novedades, el del medio (0.2.0).

Web pública (PWA estática) que presenta todas las apps de OmT Finance y da acceso a cada una: UnderCTRL, PayCTRL, DocCTRL, TaskCTRL, ChatCTRL, Up to 40%, TripCTRL y RandomIt.

## Funcionamiento

- **Intro animada**: el título «OmT Apps» aparece pequeño arriba y, mientras los iconos aterrizan, baja creciendo hasta quedar grande encima de ellos; al pie, «by OmT Finance». El título, los iconos y la frase van centrados, con aire hasta Entrar. Los pasos de la intro siguen el reloj de las propias animaciones, así que si el navegador tarda en arrancarlas nada salta al final. Los iconos de todas las apps llegan volando desde fuera de la pantalla, orbitan alrededor del logo y aterrizan uno a uno, con suavidad, en su fila; aparece la frase «Apps sencillas para tu día a día» palabra a palabra y, más abajo, el botón **Entrar**. Todo tiene su sitio reservado desde el principio, así que nada salta al aparecer. **Saltar** la lleva directamente al final (y con «reducir movimiento» del sistema no hay animación). Un enlace directo a una app (`/#taskctrl`) se salta la intro y abre su ficha.
- **Bloques por sección** (Finanzas, Día a día, Trabajo, Ocio), cada uno con su color, que se deslizan: con el dedo en móvil y tablet; con el ratón arrastrando, con la rueda (un bloque por gesto), con las flechas laterales o las del teclado; y con las pestañas de arriba, cuyo indicador sigue al bloque. Los bloques laterales giran y se alejan en efecto carrusel.
- **Iconos grandes** de cada app que flotan, se mueven un poco con el ratón (paralaje, igual que las luces de fondo del bloque) y se iluminan al pasar por encima.
- **Ficha** de cada app al pulsar su icono: descripción, qué puedes hacer, cómo instalarla (pasos para iPhone, Android u ordenador según el dispositivo), **Compartir** y **Abrir app** (en otra pestaña; sin dirección sale «Próximamente»). El botón Atrás del móvil la cierra.
- Menú ⋯: **Compartir esta web**, **Opciones de visualización** (oscuro / claro / automático y 4 fondos: Aurora, Glaciar, Coral y Menta) e **Información**: qué es, número de apps y secciones, versiones de cada app y de la web, privacidad y cómo instalarla.

## Añadir o actualizar una app

Todo está en `apps.js`:

1. Copia el `icons/icon.svg` de la app a `icons/apps/<id>.svg` y añádelo a `ASSETS` en `sw.js`.
2. Añade una entrada a `APPS` (con su `section`; las secciones y sus colores están en `SECTIONS`) (nombre con la parte en degradado entre `<b>`, versión, colores, frase, descripción, funciones, etiquetas y `url`).
3. Al subir la versión de una app, cambia aquí su `version`.
4. Sube `CACHE` en `sw.js` (omtapps-vN) y `APP_VERSION` en `app.js`.

## Publicar

Repositorio en GitHub y proyecto en Vercel sin configuración (sitio estático, sin funciones).
