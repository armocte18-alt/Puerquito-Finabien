<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0f2e29">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <title>Reto Finabien</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
    <link rel="apple-touch-icon" href="{{ asset('img/apple-touch-icon.png') }}">
    @vite(['resources/css/kiosco.css', 'resources/js/kiosco/main.js'])
</head>
<body>
    <div id="app" data-api="{{ url('/api') }}">
        <div class="pantalla">
            <div class="cargando" style="display:grid;justify-items:center;gap:1rem">
                <img src="{{ asset('img/alcancia-sprite.png') }}" alt="Alcancía de Financiera para el Bienestar" width="180" style="animation:flotar 2.4s ease-in-out infinite">
                Cargando Reto Finabien…
            </div>
        </div>
    </div>
    <noscript>Este kiosco necesita JavaScript activado.</noscript>
</body>
</html>
