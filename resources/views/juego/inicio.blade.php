@extends('layouts.app')

@section('clase_body', 'pagina-inicio')

@section('contenido')
<main class="inicio">
    <header class="inicio__cabecera">
        <img class="inicio__alcancia" src="{{ asset('img/alcancia-sprite.png') }}" alt="Alcancía en forma de puerquito de Financiera para el Bienestar" width="260">
        <div>
            <p class="inicio__marca">Financiera para el Bienestar</p>
            <h1 class="inicio__titulo">Puerquito <span>Ahorrador</span></h1>
            <p class="inicio__lema">¡Atrapa monedas y billetes, esquiva las trampas y llena tu alcancía!</p>
        </div>
    </header>

    <section class="inicio__jugador" aria-labelledby="titulo-nombre">
        <label id="titulo-nombre" for="nombre" class="inicio__etiqueta">1. ¿Cómo te llamas?</label>
        <input id="nombre" class="campo" type="text" maxlength="20" autocomplete="nickname" placeholder="Escribe tu nombre" spellcheck="false">
    </section>

    <section aria-labelledby="titulo-edad">
        <h2 id="titulo-edad" class="inicio__etiqueta">2. Elige tu edad</h2>
        <div class="grupos" role="list">
            @foreach ($grupos as $clave => $grupo)
                <a href="{{ route('jugar', $clave) }}"
                   class="grupo"
                   role="listitem"
                   style="--color-grupo: {{ $grupo['color'] }}"
                   data-grupo="{{ $clave }}"
                   aria-keyshortcuts="{{ $loop->iteration }}">
                    <span class="grupo__tecla" aria-hidden="true">{{ $loop->iteration }}</span>
                    <span class="grupo__emoji" aria-hidden="true">{{ $grupo['emoji'] }}</span>
                    <span class="grupo__rango">{{ $grupo['rango'] }}</span>
                    <span class="grupo__nombre">{{ $grupo['nombre'] }}</span>
                    <span class="grupo__desc">{{ $grupo['descripcion'] }}</span>
                    <span class="grupo__datos">
                        <span>⏱ {{ $grupo['duracion'] }} s</span>
                        <span>{{ $grupo['vidas'] ? '❤ '.$grupo['vidas'].' vidas' : '❤ Sin límite' }}</span>
                    </span>
                    <span class="grupo__record" data-record="{{ $clave }}">Récord: —</span>
                    <span class="grupo__boton">¡Jugar!</span>
                </a>
            @endforeach
        </div>
    </section>

    <section class="como-jugar" aria-labelledby="titulo-como">
        <h2 id="titulo-como" class="inicio__etiqueta">¿Cómo se juega?</h2>
        <div class="como-jugar__columnas">
            <div class="leyenda leyenda--bien">
                <h3>Atrápalos ✔</h3>
                <ul>
                    <li><canvas data-objeto="m10" width="96" height="96"></canvas><span>Monedas</span></li>
                    <li><canvas data-objeto="b100" width="96" height="96"></canvas><span>Billetes</span></li>
                    <li><canvas data-objeto="estrella" width="96" height="96"></canvas><span>Puntos ×2</span></li>
                    <li><canvas data-objeto="iman" width="96" height="96"></canvas><span>Imán</span></li>
                    <li><canvas data-objeto="corazon" width="96" height="96"></canvas><span>Vida extra</span></li>
                </ul>
            </div>
            <div class="leyenda leyenda--mal">
                <h3>Esquívalos ✖</h3>
                <ul>
                    <li><canvas data-objeto="antojo" width="96" height="96"></canvas><span>Antojos</span></li>
                    <li><canvas data-objeto="hormiga" width="96" height="96"></canvas><span>Gasto hormiga</span></li>
                    <li><canvas data-objeto="tarjeta" width="96" height="96"></canvas><span>Deudas</span></li>
                    <li><canvas data-objeto="anzuelo" width="96" height="96"></canvas><span>Fraudes</span></li>
                    <li><canvas data-objeto="falso" width="96" height="96"></canvas><span>Billete falso</span></li>
                </ul>
            </div>
            <div class="leyenda leyenda--controles">
                <h3>Controles</h3>
                <ul class="controles">
                    <li><kbd>🖱</kbd> Mueve el ratón</li>
                    <li><kbd>←</kbd><kbd>→</kbd> o <kbd>A</kbd><kbd>D</kbd> Teclado</li>
                    <li><kbd>🎮</kbd> Control / gamepad</li>
                    <li><kbd>P</kbd> Pausa · <kbd>M</kbd> Sonido · <kbd>F</kbd> Pantalla completa</li>
                </ul>
            </div>
        </div>
    </section>
</main>
@endsection

@push('scripts')
<script>
    window.PUERQUITO_RECORDS = @json(collect($grupos)->keys()->mapWithKeys(fn ($c) => [$c => route('puntajes.index', $c)]));
</script>
<script src="{{ asset('js/inicio.js') }}?v={{ filemtime(public_path('js/inicio.js')) }}"></script>
@endpush
