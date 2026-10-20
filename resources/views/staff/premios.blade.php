@extends('staff.layout')
@section('titulo', 'Premios')

@section('contenido')
    <h1 class="mb-1 text-2xl font-bold">Premios</h1>
    <p class="mb-6 text-billete-700">El costo está en puntos. Deja las existencias vacías si el premio no tiene límite. Los premios ocultos no aparecen en el kiosco.</p>

    <div class="space-y-3">
        @foreach ($premios as $p)
            <form method="POST" action="{{ route('staff.premios.guardar', $p) }}" class="grid items-end gap-3 rounded-xl bg-white p-4 shadow-sm sm:grid-cols-[4rem_1fr_1fr_7rem_7rem_5rem_auto]">
                @csrf @method('PUT')
                @include('staff.partials.campos-premio', ['p' => $p, 'id' => 'p'.$p->id])
                <div class="flex items-center gap-3">
                    <span class="text-xs text-billete-700">{{ $p->canjes_count }} canjes</span>
                    <button class="rounded-lg bg-billete-900 px-4 py-2 font-bold text-white hover:bg-billete-700">Guardar</button>
                </div>
            </form>
        @endforeach
    </div>

    <h2 class="mb-3 mt-8 text-xl font-bold">Agregar premio</h2>
    <form method="POST" action="{{ route('staff.premios.crear') }}" class="grid items-end gap-3 rounded-xl border-2 border-dashed border-billete-700/30 bg-white p-4 sm:grid-cols-[4rem_1fr_1fr_7rem_7rem_5rem_auto]">
        @csrf
        @include('staff.partials.campos-premio', ['p' => new App\Models\Premio(['activo' => true]), 'id' => 'nuevo'])
        <button class="rounded-lg bg-oro-400 px-4 py-2 font-bold text-billete-950 hover:bg-oro-600">Agregar</button>
    </form>
@endsection
