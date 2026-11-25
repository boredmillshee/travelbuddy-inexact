# TravelBuddy

Prototipo de aplicación de escritorio (HTML, CSS y JS puro, sin dependencias).

## Subir a GitHub Pages
1. Crea un repositorio nuevo en GitHub (por ejemplo `travelbuddy`).
2. Sube el contenido de esta carpeta (`index.html`, `css/`, `js/`, `assets/`, `README.md`) a la rama `main`.
3. En el repositorio: **Settings → Pages → Build and deployment**. En *Source* elige **Deploy from a branch**, rama `main`, carpeta `/ (root)`, y pulsa **Save**.
4. En 1-2 minutos estará en `https://TU-USUARIO.github.io/travelbuddy/`.

## Vuelos de la demo (ficticios)
- **TB1234** · Madrid (MAD) → París (CDG) · Airbus A320-200
- **TB2026** · Barcelona (BCN) → Lisboa (LIS) · Boeing 737-800

Se aceptan mayúsculas, minúsculas y espacios (`tb 1234`).

## Qué incluye
- Registro e inicio de sesión simulados (`localStorage`). No uses contraseñas reales.
- Tutorial que ilumina cada opción del menú. Se repite desde Perfil.
- Mi viaje: ficha del vuelo, detalles de la aeronave, seguimiento familiar e itinerario (sitios, comida y actividades).
- Mapa (dentro de un móvil): plano 2D estilo Google Maps (búsqueda, filtros, zoom, ruta azul) y vista 3D estilo Street View con flechas guía. Ambos se abren a pantalla completa con el botón ⤢, dentro del móvil: aviso de documentación, tarjeta de puerta, minimapa, zoom, servicios cerca de ti y pestañas inferiores (se cierra con ‹ o Esc). Incluye avisos de documentación, distancia y tiempo a la puerta.
- Guía: progreso del viaje, lista de preparación que se guarda, pasos en el aeropuerto, cómo llegar al hotel, sitios del destino, datos prácticos y requisitos.
- Social: estadísticas, logros con progreso, foro con filtros por categoría y mapamundi que se colorea.
- Perfil público: estadísticas, modos de accesibilidad (sencillo, normal y avanzado; aún solo informativos), logros, mapamundi y tus últimas preguntas del foro.

- Vista móvil: el botón 📱 de la cabecera muestra toda la app dentro de un móvil (iconos vectoriales, barra inferior con indicador, cabecera con el título de cada pantalla, logros en filas compactas y carruseles táctiles). El botón 🖥 vuelve a la vista de PC y la elección se recuerda.
- Buddy, el chatbot (esquina inferior derecha): responde sobre normas, destinos (París y Lisboa) y consejos. Funciona con respuestas predefinidas, sin servidor. Para ampliarlo, edita la lista `KB` en `js/main.js`.

## Personalizar
- Vídeos de los tips de la Guía: guarda tus archivos como `assets/videos/seguridad.mp4`, `assets/videos/maleta.mp4` y `assets/videos/hotel.mp4`. Mientras no existan, la web muestra "Vídeo disponible próximamente".
- Textos de los tips: lista `TIPS` en `js/main.js` (contenido de ejemplo, PROVISIONAL).
- Foto de la portada: guarda `assets/hero.jpg` y se mostrará sola.
- Textos provisionales (subrayados con puntos): nombre del equipo; faltan `og:image` y `og:url`.
- Los datos de vuelos e itinerarios están en `js/flights.js`.

## Mejoras futuras
Backend y cuentas reales, API de vuelos, fotos 360° reales del interior del aeropuerto, mapamundi con fronteras reales, foro con respuestas, notificaciones a familiares.
