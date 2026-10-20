@extends('staff.layout')
@section('titulo', 'Entregas')

@php($grupos = config('reto.grupos'))

@section('contenido')
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
            <p class="text-sm uppercase tracking-wide text-billete-700">Evento activo</p>
            <h1 class="text-2xl font-bold">{{ $evento?->nombre ?? 'Sin evento activo' }}</h1>
            @if ($evento?->sede)<p class="text-billete-700">{{ $evento->sede }}</p>@endif
        </div>
        <div class="flex flex-wrap gap-2 text-sm">
            <a href="{{ route('staff.exportar', 'jugadores') }}" class="rounded-lg border border-billete-700/30 bg-white px-3 py-2 hover:border-billete-700">Descargar jugadores (CSV)</a>
            <a href="{{ route('staff.exportar', 'canjes') }}" class="rounded-lg border border-billete-700/30 bg-white px-3 py-2 hover:border-billete-700">Descargar canjes (CSV)</a>
        </div>
    </div>

    <section class="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        @foreach ($grupos as $clave => $g)
            <div class="rounded-xl bg-white p-4 shadow-sm">
                <p class="text-sm text-billete-700">{{ $g['nombre'] }} · {{ $g['rango'] }}</p>
                <p class="mt-1 text-3xl font-bold tabular-nums">{{ number_format($porGrupo[$clave]->jugadores ?? 0) }}</p>
                <p class="text-sm text-billete-700">jugadores · {{ number_format($porGrupo[$clave]->puntos ?? 0) }} pts ganados</p>
            </div>
        @endforeach
        <div class="rounded-xl bg-white p-4 shadow-sm">
            <p class="text-sm text-billete-700">Partidas terminadas</p>
            <p class="mt-1 text-3xl font-bold tabular-nums">{{ number_format($partidas->sum()) }}</p>
            <p class="text-sm text-billete-700">
                @foreach (config('reto.juegos') as $clave => $juego)
                    {{ $juego['nombre'] }} {{ $partidas[$clave] ?? 0 }}@if (! $loop->last) · @endif
                @endforeach
            </p>
        </div>
    </section>

    <section class="mb-8">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-bold">Premios por entregar <span class="text-billete-700">({{ $pendientes->count() }})</span></h2>
            <form method="GET" class="flex gap-2">
                <label for="q" class="sr-only">Buscar folio, código o nombre</label>
                <input id="q" name="q" value="{{ $busqueda }}" placeholder="Folio, código o nombre"
                       class="w-64 rounded-lg border border-billete-700/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oro-400">
                <button class="rounded-lg bg-billete-900 px-4 py-2 font-bold text-white">Buscar</button>
                @if ($busqueda !== '')<a href="{{ route('staff.inicio') }}" class="px-2 py-2 text-billete-700 underline">Limpiar</a>@endif
            </form>
        </div>

        <div class="overflow-x-auto rounded-xl bg-white shadow-sm">
            <table class="w-full text-left text-sm">
                <thead class="border-b bg-billete-100/60 text-billete-700">
                    <tr><th class="px-4 py-2">Folio</th><th class="px-4 py-2">Premio</th><th class="px-4 py-2">Jugador</th><th class="px-4 py-2">Grupo</th><th class="px-4 py-2">Hora</th><th class="px-4 py-2"></th></tr>
                </thead>
                <tbody>
                @forelse ($pendientes as $c)
                    <tr class="border-b last:border-0">
                        <td class="px-4 py-3 font-mono text-base font-bold">{{ $c->folio }}</td>
                        <td class="px-4 py-3">{{ $c->premio->icono }} {{ $c->premio->nombre }}</td>
                        <td class="px-4 py-3">{{ $c->jugador->nombre }} <span class="font-mono text-billete-700">{{ $c->jugador->codigo }}</span></td>
                        <td class="px-4 py-3">{{ $grupos[$c->jugador->grupo]['nombre'] }}</td>
                        <td class="px-4 py-3 tabular-nums">{{ $c->created_at->format('H:i') }}</td>
                        <td class="px-4 py-3 text-right">
                            <form method="POST" action="{{ route('staff.entregar', $c) }}">
                                @csrf
                                <button class="rounded-lg bg-oro-400 px-4 py-2 font-bold text-billete-950 hover:bg-oro-600">Marcar entregado</button>
                            </form>
                        </td>
                    </tr>
                @empty
                    <tr><td colspan="6" class="px-4 py-8 text-center text-billete-700">
                        {{ $busqueda !== '' ? 'Ningún canje pendiente coincide con la búsqueda.' : 'No hay premios pendientes. Cuando alguien canjee en el kiosco aparecerá aquí con su folio.' }}
                    </td></tr>
                @endforelse
                </tbody>
            </table>
        </div>
    </section>

    <section class="grid gap-6 lg:grid-cols-2">
        <div>
            <h2 class="mb-3 text-xl font-bold">Existencias</h2>
            <ul class="divide-y rounded-xl bg-white shadow-sm">
                @foreach ($premios as $p)
                    <li class="flex items-center justify-between px-4 py-2 text-sm">
                        <span>{{ $p->icono }} {{ $p->nombre }} @unless($p->activo)<span class="text-billete-700">(oculto)</span>@endunless</span>
                        <span class="tabular-nums {{ $p->stock !== null && $p->stock <= 5 ? 'font-bold text-red-700' : '' }}">
                            {{ $p->stock === null ? 'Sin límite' : $p->stock.' disp.' }}
                        </span>
                    </li>
                @endforeach
            </ul>
        </div>
        <div>
            <h2 class="mb-3 text-xl font-bold">Últimas entregas</h2>
            <ul class="divide-y rounded-xl bg-white shadow-sm">
                @forelse ($entregados as $c)
                    <li class="flex items-center justify-between px-4 py-2 text-sm">
                        <span><span class="font-mono font-bold">{{ $c->folio }}</span> · {{ $c->premio->nombre }} · {{ $c->jugador->nombre }}</span>
                        <span class="tabular-nums text-billete-700">{{ $c->entregado_at->format('H:i') }}</span>
                    </li>
                @empty
                    <li class="px-4 py-6 text-center text-sm text-billete-700">Todavía no se entrega ningún premio.</li>
                @endforelse
            </ul>
        </div>
    </section>
@endsection
