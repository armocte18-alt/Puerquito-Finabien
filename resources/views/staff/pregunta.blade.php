@extends('staff.layout')
@section('titulo', $pregunta->exists ? 'Editar pregunta' : 'Nueva pregunta')

@php
    $campo = 'w-full rounded-lg border border-billete-700/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oro-400';
    $opciones = old('opciones', array_pad($pregunta->opciones ?? [], 4, ''));
    $correcta = (int) old('correcta', $pregunta->correcta);
@endphp

@section('contenido')
    <a href="{{ route('staff.preguntas', ['grupo' => $pregunta->grupo]) }}" class="text-sm text-billete-700 underline">← Volver a preguntas</a>
    <h1 class="mb-6 mt-2 text-2xl font-bold">{{ $pregunta->exists ? 'Editar pregunta' : 'Nueva pregunta' }}</h1>

    <form method="POST" action="{{ $pregunta->exists ? route('staff.preguntas.guardar', $pregunta) : route('staff.preguntas.crear') }}"
          class="max-w-3xl space-y-5 rounded-xl bg-white p-6 shadow-sm">
        @csrf
        @if ($pregunta->exists) @method('PUT') @endif

        <div class="grid gap-4 sm:grid-cols-2">
            <div>
                <label for="grupo" class="text-sm font-bold">Grupo de edad</label>
                <select id="grupo" name="grupo" class="{{ $campo }}">
                    @foreach (config('reto.grupos') as $clave => $g)
                        <option value="{{ $clave }}" @selected(old('grupo', $pregunta->grupo) === $clave)>{{ $g['nombre'] }} · {{ $g['rango'] }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <label for="tema" class="text-sm font-bold">Tema</label>
                <select id="tema" name="tema" class="{{ $campo }}">
                    <option value="educacion" @selected(old('tema', $pregunta->tema) === 'educacion')>Educación financiera</option>
                    <option value="finabien" @selected(old('tema', $pregunta->tema) === 'finabien')>FINABIEN</option>
                </select>
            </div>
        </div>

        <div>
            <label for="enunciado" class="text-sm font-bold">Pregunta</label>
            <textarea id="enunciado" name="enunciado" rows="2" maxlength="300" required class="{{ $campo }}">{{ old('enunciado', $pregunta->enunciado) }}</textarea>
        </div>

        <fieldset>
            <legend class="text-sm font-bold">Opciones <span class="font-normal text-billete-700">— marca la correcta. Para 10 años o menos usa 3 opciones.</span></legend>
            <div class="mt-2 space-y-2">
                @foreach ($opciones as $i => $texto)
                    <div class="flex items-center gap-3">
                        <input id="correcta-{{ $i }}" type="radio" name="correcta" value="{{ $i }}" @checked($correcta === $i) class="size-5 accent-emerald-700" aria-label="Opción {{ $i + 1 }} es la correcta">
                        <label for="opcion-{{ $i }}" class="sr-only">Opción {{ $i + 1 }}</label>
                        <input id="opcion-{{ $i }}" name="opciones[{{ $i }}]" value="{{ $texto }}" maxlength="140" placeholder="Opción {{ $i + 1 }}" class="{{ $campo }}">
                    </div>
                @endforeach
            </div>
        </fieldset>

        <div>
            <label for="explicacion" class="text-sm font-bold">Explicación <span class="font-normal text-billete-700">— se muestra después de contestar</span></label>
            <textarea id="explicacion" name="explicacion" rows="2" maxlength="400" class="{{ $campo }}">{{ old('explicacion', $pregunta->explicacion) }}</textarea>
        </div>

        <label for="activa" class="flex items-center gap-2">
            <input id="activa" type="checkbox" name="activa" value="1" @checked(old('activa', $pregunta->activa)) class="size-5 accent-billete-700"> Activa en el kiosco
        </label>

        <button class="rounded-lg bg-billete-900 px-5 py-2.5 font-bold text-white hover:bg-billete-700">Guardar pregunta</button>
    </form>
@endsection
