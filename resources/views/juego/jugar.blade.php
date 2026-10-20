@extends('layouts.app')

@section('titulo', $grupo['nombre'].' · Puerquito Finabien')
@section('clase_body', 'pagina-juego')

@section('contenido')
<div class="juego" id="juego" style="--color-grupo: {{ $grupo['color'] }}">
    <canvas id="lienzo" class="juego__lienzo" aria-label="Área de juego: mueve la alcancía para atrapar el dinero" role="img"></canvas>

    {{-- Marcador --}}
    <div class="hud" id="hud" hidden>
        <div class="hud__bloque hud__puntos">
            <span class="hud__titulo">Puntos</span>
            <span class="hud__valor" id="hud-puntos">0</span>
        </div>
        <div class="hud__bloque hud__ahorro">
            <span class="hud__titulo">Ahorro</span>
            <span class="hud__valor" id="hud-ahorro">$0</span>
        </div>
        <div class="hud__centro">
            <div class="hud__tiempo" id="hud-tiempo">0</div>
            <div class="hud__barra"><span id="hud-barra"></span></div>
        </div>
        <div class="hud__bloque hud__combo" id="hud-combo-caja">
            <span class="hud__titulo">Combo</span>
            <span class="hud__valor" id="hud-combo">×1</span>
        </div>
        <div class="hud__bloque hud__vidas" id="hud-vidas-caja">
            <span class="hud__titulo">Vidas</span>
            <span class="hud__valor" id="hud-vidas"></span>
        </div>
        <div class="hud__poderes" id="hud-poderes"></div>
        <div class="hud__botones">
            <button type="button" class="boton-icono" id="btn-sonido" aria-label="Silenciar sonido" title="Sonido (M)">🔊</button>
            <button type="button" class="boton-icono" id="btn-pantalla" aria-label="Pantalla completa" title="Pantalla completa (F)">⛶</button>
            <button type="button" class="boton-icono" id="btn-pausa" aria-label="Pausar" title="Pausa (P)">⏸</button>
        </div>
    </div>

    <div class="leccion" id="leccion" role="status" aria-live="polite" hidden></div>

    {{-- Pantalla de instrucciones --}}
    <section class="capa" id="capa-intro" aria-labelledby="intro-titulo">
        <div class="tarjeta">
            <span class="tarjeta__insignia">{{ $grupo['emoji'] }} {{ $grupo['rango'] }}</span>
            <h1 id="intro-titulo" class="tarjeta__titulo">{{ $grupo['nombre'] }}</h1>
            <p class="tarjeta__texto">{{ $grupo['descripcion'] }}</p>
            <ul class="reglas">
                <li><canvas data-objeto="m5" width="72" height="72"></canvas> Atrapa monedas y billetes para sumar puntos.</li>
                <li><canvas data-objeto="{{ array_key_first($grupo['trampas']) }}" width="72" height="72"></canvas> Esquiva las trampas: restan puntos{{ $grupo['vidas'] ? ' y vidas' : '' }}.</li>
                <li><canvas data-objeto="estrella" width="72" height="72"></canvas> Atrapa {{ $grupo['vidas'] ? 'estrellas, imanes y corazones' : 'estrellas e imanes' }} para ayudarte.</li>
            </ul>
            <p class="tarjeta__controles">Ratón · <kbd>←</kbd><kbd>→</kbd> · <kbd>A</kbd><kbd>D</kbd> · Gamepad</p>
            <div class="tarjeta__acciones">
                <button type="button" class="boton boton--grande" id="btn-comenzar" autofocus>¡Comenzar! <small>Enter</small></button>
                <a class="boton boton--secundario" href="{{ route('inicio') }}">Cambiar edad</a>
            </div>
        </div>
    </section>

    {{-- Cuenta regresiva --}}
    <div class="cuenta" id="cuenta" aria-live="assertive" hidden></div>

    {{-- Pausa --}}
    <section class="capa" id="capa-pausa" aria-labelledby="pausa-titulo" hidden>
        <div class="tarjeta tarjeta--chica">
            <h2 id="pausa-titulo" class="tarjeta__titulo">Pausa</h2>
            <div class="tarjeta__acciones tarjeta__acciones--columna">
                <button type="button" class="boton boton--grande" id="btn-continuar">Continuar</button>
                <button type="button" class="boton boton--secundario" id="btn-reiniciar">Reiniciar</button>
                <a class="boton boton--secundario" href="{{ route('inicio') }}">Salir</a>
            </div>
        </div>
    </section>

    {{-- Fin de partida --}}
    <section class="capa" id="capa-fin" aria-labelledby="fin-titulo" hidden>
        <div class="tarjeta tarjeta--fin">
            <div class="fin__resumen">
                <h2 id="fin-titulo" class="tarjeta__titulo">¡Se acabó el tiempo!</h2>
                <p class="fin__puntos"><span id="fin-puntos">0</span> puntos</p>
                <p class="fin__ahorro">Tu alcancía juntó <strong id="fin-ahorro">$0</strong></p>
                <dl class="fin__estadisticas">
                    <div><dt>Monedas</dt><dd id="fin-monedas">0</dd></div>
                    <div><dt>Billetes</dt><dd id="fin-billetes">0</dd></div>
                    <div><dt>Trampas</dt><dd id="fin-trampas">0</dd></div>
                    <div><dt>Mejor combo</dt><dd id="fin-combo">0</dd></div>
                </dl>
                <p class="fin__consejo"><span aria-hidden="true">💡</span> <span id="fin-consejo"></span></p>

                <form class="fin__guardar" id="form-guardar">
                    <label for="fin-nombre">Tu nombre para la tabla de campeones</label>
                    <div class="fin__fila">
                        <input id="fin-nombre" class="campo" type="text" maxlength="20" required autocomplete="nickname" spellcheck="false">
                        <button type="submit" class="boton" id="btn-guardar">Guardar</button>
                    </div>
                    <p class="fin__mensaje" id="fin-mensaje" role="status" aria-live="polite"></p>
                </form>
            </div>
            <div class="fin__tabla">
                <h3>🏆 Campeones · {{ $grupo['rango'] }}</h3>
                <ol class="tabla" id="tabla"></ol>
            </div>
            <div class="tarjeta__acciones fin__acciones">
                <button type="button" class="boton boton--grande" id="btn-otra">Jugar otra vez</button>
                <a class="boton boton--secundario" href="{{ route('inicio') }}">Cambiar edad</a>
            </div>
        </div>
    </section>
</div>
@endsection

@push('scripts')
<script>
    window.PUERQUITO = @json($configuracion);
</script>
<script src="{{ asset('js/sonido.js') }}?v={{ filemtime(public_path('js/sonido.js')) }}"></script>
<script src="{{ asset('js/juego.js') }}?v={{ filemtime(public_path('js/juego.js')) }}"></script>
@endpush
