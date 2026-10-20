@extends('staff.layout')
@section('titulo', 'Eventos')

@php($campo = 'w-full rounded-lg border border-billete-700/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oro-400')

@section('contenido')
    <h1 class="mb-1 text-2xl font-bold">Eventos</h1>
    <p class="mb-6 text-billete-700">Los jugadores nuevos y el ranking del kiosco pertenecen al evento activo. Activa uno nuevo al iniciar cada feria.</p>

    <form method="POST" action="{{ route('staff.eventos.crear') }}" class="mb-8 grid items-end gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[2fr_2fr_1fr_1fr_auto]">
        @csrf
        <div><label for="nombre" class="text-xs font-bold text-billete-700">Nombre</label><input id="nombre" name="nombre" required maxlength="150" class="{{ $campo }}" placeholder="Semana Nacional de Educación Financiera"></div>
        <div><label for="sede" class="text-xs font-bold text-billete-700">Sede</label><input id="sede" name="sede" maxlength="150" class="{{ $campo }}"></div>
        <div><label for="fecha_inicio" class="text-xs font-bold text-billete-700">Inicio</label><input id="fecha_inicio" name="fecha_inicio" type="date" class="{{ $campo }}"></div>
        <div><label for="fecha_fin" class="text-xs font-bold text-billete-700">Fin</label><input id="fecha_fin" name="fecha_fin" type="date" class="{{ $campo }}"></div>
        <button class="rounded-lg bg-oro-400 px-4 py-2 font-bold text-billete-950 hover:bg-oro-600">Crear y activar</button>
    </form>

    <ul class="divide-y rounded-xl bg-white shadow-sm">
        @foreach ($eventos as $e)
            <li class="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                    <p class="font-bold">{{ $e->nombre }} @if ($e->activo)<span class="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-900">Activo</span>@endif</p>
                    <p class="text-sm text-billete-700">
                        {{ $e->sede ?: 'Sin sede' }}
                        @if ($e->fecha_inicio) · {{ $e->fecha_inicio->format('d/m/Y') }}@endif
                        @if ($e->fecha_fin) – {{ $e->fecha_fin->format('d/m/Y') }}@endif
                        · {{ $e->jugadores_count }} jugadores
                    </p>
                </div>
                @unless ($e->activo)
                    <form method="POST" action="{{ route('staff.eventos.activar', $e) }}">
                        @csrf
                        <button class="rounded-lg border border-billete-700/30 px-3 py-2 text-sm hover:border-billete-700">Activar</button>
                    </form>
                @endunless
            </li>
        @endforeach
    </ul>
@endsection
