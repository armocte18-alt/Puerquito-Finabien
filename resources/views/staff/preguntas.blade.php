@extends('staff.layout')
@section('titulo', 'Preguntas')

@section('contenido')
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 class="text-2xl font-bold">Preguntas de trivia</h1>
        <a href="{{ route('staff.preguntas.nueva', ['grupo' => $grupo]) }}" class="rounded-lg bg-oro-400 px-4 py-2 font-bold text-billete-950 hover:bg-oro-600">Nueva pregunta</a>
    </div>

    <nav class="mb-4 flex flex-wrap gap-2" aria-label="Grupo de edad">
        @foreach (config('reto.grupos') as $clave => $g)
            <a href="{{ route('staff.preguntas', ['grupo' => $clave]) }}"
               class="rounded-full px-4 py-2 text-sm {{ $grupo === $clave ? 'bg-billete-900 font-bold text-white' : 'bg-white hover:bg-white/70' }}">
                {{ $g['nombre'] }} · {{ $g['rango'] }}
            </a>
        @endforeach
    </nav>

    <p class="mb-4 text-sm text-billete-700">
        {{ $preguntas->where('activa', true)->count() }} activas. Cada partida usa {{ config("reto.juegos.trivia.preguntas.$grupo") }} al azar;
        conviene tener al menos el doble para que no se repitan.
    </p>

    <ul class="space-y-2">
        @foreach ($preguntas as $p)
            <li class="flex flex-wrap items-start gap-4 rounded-xl bg-white p-4 shadow-sm {{ $p->activa ? '' : 'opacity-60' }}">
                <div class="min-w-0 flex-1">
                    <p class="font-bold">{{ $p->enunciado }}</p>
                    <p class="mt-1 text-sm text-emerald-800">✓ {{ $p->opciones[$p->correcta] ?? '—' }}</p>
                    <p class="mt-1 text-xs uppercase tracking-wide text-billete-700">{{ $p->tema === 'finabien' ? 'FINABIEN' : 'Educación financiera' }}</p>
                </div>
                <div class="flex gap-2">
                    <a href="{{ route('staff.preguntas.editar', $p) }}" class="rounded-lg border border-billete-700/30 px-3 py-2 text-sm hover:border-billete-700">Editar</a>
                    <form method="POST" action="{{ route('staff.preguntas.alternar', $p) }}">
                        @csrf @method('PATCH')
                        <button class="rounded-lg border border-billete-700/30 px-3 py-2 text-sm hover:border-billete-700">{{ $p->activa ? 'Desactivar' : 'Activar' }}</button>
                    </form>
                </div>
            </li>
        @endforeach
    </ul>
@endsection
