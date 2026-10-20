// Tailwind 4 se procesa con @tailwindcss/vite (ver vite.config.js), no con PostCSS.
// Este archivo vacío evita que Vite use un postcss.config.js de una carpeta superior
// (p. ej. C:\ o C:\Servidor\www) que cargaría otra versión de Tailwind y rompería el build.
export default {
    plugins: {},
};
