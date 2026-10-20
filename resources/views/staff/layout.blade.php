<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('titulo', 'Panel') · Reto Finabien</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
    @vite(['resources/css/app.css'])
</head>
<body class="min-h-screen bg-billete-100 text-billete-950 antialiased">
    <div class="border-b border-oro-400/40 bg-white">
        <div class="mx-auto max-w-6xl px-4 py-2">
            <img src="{{ asset('img/logo-hacienda-finabien.png') }}" alt="Secretaría de Hacienda y Crédito Público · Financiera para el Bienestar" class="h-10 w-auto sm:h-12">
        </div>
    </div>
    <header class="bg-billete-900 text-white">
        <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <a href="{{ route('staff.inicio') }}" class="text-lg font-bold">Reto Finabien <span class="font-normal text-oro-400">· Staff</span></a>
            @if (session('staff'))
                <nav class="flex flex-wrap gap-1 text-sm">
                    @foreach ([
                        'staff.inicio' => 'Entregas',
                        'staff.premios' => 'Premios',
                        'staff.preguntas' => 'Preguntas',
                        'staff.eventos' => 'Eventos',
                    ] as $ruta => $texto)
                        <a href="{{ route($ruta) }}"
                           class="rounded-md px-3 py-1.5 {{ request()->routeIs($ruta.'*') ? 'bg-white/15 font-bold' : 'hover:bg-white/10' }}">{{ $texto }}</a>
                    @endforeach
                    <a href="{{ route('kiosco') }}" target="_blank" class="rounded-md px-3 py-1.5 hover:bg-white/10">Abrir kiosco ↗</a>
                </nav>
                <form method="POST" action="{{ route('staff.salir') }}" class="ml-auto">
                    @csrf
                    <button class="rounded-md px-3 py-1.5 text-sm hover:bg-white/10">Salir</button>
                </form>
            @endif
        </div>
    </header>

    <main class="mx-auto max-w-6xl px-4 py-6">
        @if (session('ok'))
            <div class="mb-4 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-emerald-900" role="status">{{ session('ok') }}</div>
        @endif
        @if ($errors->any())
            <div class="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-900" role="alert">
                @foreach ($errors->all() as $error)<p>{{ $error }}</p>@endforeach
            </div>
        @endif

        @yield('contenido')
    </main>
</body>
</html>
