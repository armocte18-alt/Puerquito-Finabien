<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Canje;
use App\Models\Evento;
use App\Models\Jugador;
use App\Models\Partida;
use App\Models\Premio;
use App\Services\MotorJuegos;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class KioscoController extends Controller
{
    public const AVATARES = ['cerdito', 'buho', 'abeja', 'zorro', 'tortuga', 'rana', 'leon', 'pulpo'];

    public function __construct(private MotorJuegos $motor) {}

    /** Todo lo que la pantalla de inicio necesita en una sola llamada. */
    public function configuracion(): JsonResponse
    {
        $evento = Evento::activo();

        return response()->json([
            'evento' => $evento ? ['nombre' => $evento->nombre, 'sede' => $evento->sede] : null,
            'grupos' => collect(config('reto.grupos'))->map(fn ($g) => [
                'nombre' => $g['nombre'], 'rango' => $g['rango'], 'edad_max' => $g['edad_max'],
                'titulo_clasifica' => $g['titulo_clasifica'],
            ]),
            'juegos' => collect(config('reto.juegos'))->map(fn ($j) => ['nombre' => $j['nombre']]),
            'jugadas_con_puntos' => config('reto.jugadas_con_puntos'),
            'inactividad_seg' => config('reto.inactividad_seg'),
            'avatares' => self::AVATARES,
            'premios' => $this->premios(),
            'ranking' => $this->rankingPorGrupo($evento),
        ]);
    }

    public function ranking(): JsonResponse
    {
        return response()->json($this->rankingPorGrupo(Evento::activo()));
    }

    public function registrar(Request $request): JsonResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'min:2', 'max:20'],
            'edad' => ['required', 'integer', 'min:3', 'max:110'],
            'avatar' => ['required', Rule::in(self::AVATARES)],
        ], [
            'nombre.required' => 'Escribe tu nombre o un apodo.',
            'nombre.min' => 'Tu nombre debe tener al menos 2 letras.',
            'edad.*' => 'Elige tu edad.',
            'avatar.*' => 'Elige un personaje.',
        ]);

        $jugador = Jugador::create([
            'evento_id' => Evento::activo()?->id,
            'codigo' => Jugador::nuevoCodigo(),
            'nombre' => Str::of($datos['nombre'])->squish()->limit(20, ''),
            'edad' => $datos['edad'],
            'grupo' => Jugador::grupoPorEdad($datos['edad']),
            'avatar' => $datos['avatar'],
            'puntos' => 0,
            'puntos_totales' => 0,
        ]);

        return response()->json($jugador->paraKiosco(), 201);
    }

    public function jugador(string $codigo): JsonResponse
    {
        return response()->json($this->buscarJugador($codigo)->paraKiosco());
    }

    public function iniciarPartida(Request $request, string $codigo): JsonResponse
    {
        $datos = $request->validate(['juego' => ['required', Rule::in(MotorJuegos::JUEGOS)]]);
        $jugador = $this->buscarJugador($codigo);

        return response()->json($this->motor->iniciar($jugador, $datos['juego'])['payload'], 201);
    }

    public function responder(Request $request, Partida $partida): JsonResponse
    {
        $datos = $request->validate([
            'item' => ['required', 'integer'],
            'respuesta' => ['nullable'],
            'ms' => ['nullable', 'integer', 'min:0'],
        ]);

        $respuesta = $datos['respuesta'] ?? null;
        if (in_array($partida->juego, ['trivia', 'emprendedor'], true) && $respuesta !== null) {
            $respuesta = (int) $respuesta;
        }

        return response()->json($this->motor->responder($partida, (int) $datos['item'], $respuesta, (int) ($datos['ms'] ?? 0)));
    }

    public function terminar(Request $request, Partida $partida): JsonResponse
    {
        $datos = $request->validate([
            'movimientos' => ['nullable', 'integer', 'min:0', 'max:500'],
            'segundos' => ['nullable', 'integer', 'min:0', 'max:3600'],
            // Arcade: índices de las piezas que el jugador tocó.
            'recogidos' => ['nullable', 'array', 'max:300'],
            'recogidos.*' => ['integer', 'min:0'],
            'golpes' => ['nullable', 'array', 'max:300'],
            'golpes.*' => ['integer', 'min:0'],
            'pagados' => ['nullable', 'array', 'max:300'],
            'pagados.*' => ['integer', 'min:0'],
            'atrapados' => ['nullable', 'array', 'max:300'],
            'atrapados.*' => ['integer', 'min:0'],
            'decisiones' => ['nullable', 'array', 'max:300'],
            'decisiones.*' => ['nullable', Rule::in(['colchon', 'antojo', 'ahorro'])],
        ]);

        return response()->json($this->motor->terminar($partida, $datos));
    }

    public function canjear(Request $request, string $codigo): JsonResponse
    {
        $datos = $request->validate(['premio' => ['required', 'integer']]);

        $resultado = DB::transaction(function () use ($codigo, $datos) {
            $jugador = Jugador::where('codigo', Jugador::normalizarCodigo($codigo))->lockForUpdate()->firstOrFail();
            $premio = Premio::lockForUpdate()->findOrFail($datos['premio']);

            if (! $premio->disponible()) {
                throw ValidationException::withMessages(['premio' => 'Este premio ya se agotó. Elige otro.']);
            }
            if ($jugador->puntos < $premio->costo) {
                throw ValidationException::withMessages(['premio' => 'Todavía no tienes puntos suficientes para este premio.']);
            }

            $jugador->decrement('puntos', $premio->costo);
            if ($premio->stock !== null) {
                $premio->decrement('stock');
            }

            $canje = Canje::create([
                'folio' => $this->nuevoFolio(),
                'jugador_id' => $jugador->id,
                'premio_id' => $premio->id,
                'costo' => $premio->costo,
            ]);

            return ['canje' => $canje, 'jugador' => $jugador->fresh()];
        });

        return response()->json([
            'folio' => $resultado['canje']->folio,
            'jugador' => $resultado['jugador']->paraKiosco(),
            'premios' => $this->premios(),
        ], 201);
    }

    private function buscarJugador(string $codigo): Jugador
    {
        $jugador = Jugador::where('codigo', Jugador::normalizarCodigo($codigo))->first();

        if (! $jugador) {
            throw ValidationException::withMessages(['codigo' => 'No encontramos ese código. Revisa las letras e intenta de nuevo.']);
        }

        return $jugador;
    }

    private function nuevoFolio(): string
    {
        do {
            $folio = 'RF-'.Str::upper(Str::random(5));
        } while (Canje::where('folio', $folio)->exists());

        return $folio;
    }

    private function premios(): array
    {
        return Premio::where('activo', true)->orderBy('orden')->orderBy('costo')->get()
            ->map(fn (Premio $p) => [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'descripcion' => $p->descripcion,
                'icono' => $p->icono,
                'costo' => $p->costo,
                'agotado' => ! $p->disponible(),
            ])->all();
    }

    private function rankingPorGrupo(?Evento $evento): array
    {
        return collect(array_keys(config('reto.grupos')))->mapWithKeys(fn ($grupo) => [
            $grupo => Jugador::query()
                ->when($evento, fn ($q) => $q->where('evento_id', $evento->id))
                ->where('grupo', $grupo)->where('puntos_totales', '>', 0)
                ->orderByDesc('puntos_totales')->orderBy('id')->limit(5)
                ->get(['nombre', 'avatar', 'puntos_totales'])
                ->map(fn ($j) => ['nombre' => $j->nombre, 'avatar' => $j->avatar, 'puntos' => $j->puntos_totales]),
        ])->all();
    }
}
