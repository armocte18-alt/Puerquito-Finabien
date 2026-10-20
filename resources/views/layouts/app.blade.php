<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#1d5c3f">
    <title>@yield('titulo', 'Puerquito Finabien')</title>
    <link rel="icon" type="image/png" href="{{ asset('img/alcancia-sprite.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/juego.css') }}?v={{ filemtime(public_path('css/juego.css')) }}">
</head>
<body class="@yield('clase_body')">
    @yield('contenido')

    <script src="{{ asset('js/dibujo.js') }}?v={{ filemtime(public_path('js/dibujo.js')) }}"></script>
    @stack('scripts')
</body>
</html>
