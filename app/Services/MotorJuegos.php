<?php

namespace App\Services;

use App\Models\Jugador;
use App\Models\Par;
use App\Models\Partida;
use App\Models\Pregunta;
use App\Models\Tarjeta;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Reglas y puntuación de los juegos. Las respuestas correctas nunca
 * viajan al kiosco antes de contestar: el servidor califica cada respuesta.
 * Los juegos de servicios FINABIEN viven en JuegosServicios.
 */
class MotorJuegos
{
    public const JUEGOS = ['trivia', 'clasifica', 'memorama', 'puerquito', 'remesa', 'cosecha', 'emprendedor', 'maraton'];

    public function __construct(private JuegosServicios $servicios) {}

    /** @return array{partida: Partida, payload: array} */
    public function iniciar(Jugador $jugador, string $juego): array
    {
        $grupo = $jugador->grupo;
        $cfg = config("reto.juegos.$juego");
        $limite = config('reto.jugadas_con_puntos');
        $cuentaPuntos = $jugador->jugadasConPuntos()[$juego] < $limite;

        [$items, $publico, $extra] = match ($juego) {
            'trivia' => [...$this->prepararTrivia($grupo, $cfg['preguntas'][$grupo]), []],
            'clasifica' => [...$this->prepararClasifica($grupo, $cfg['tarjetas']), []],
            'memorama' => [...$this->prepararMemorama($grupo, $cfg['pares']), []],
            default => $this->servicios->preparar($juego, $grupo),
        };

        if (count($items) === 0) {
            throw ValidationException::withMessages([
                'juego' => 'Este juego todavía no tiene contenido para tu grupo de edad. Avísale al personal del stand.',
            ]);
        }

        $partida = Partida::create([
            'jugador_id' => $jugador->id,
            'juego' => $juego,
            'items' => $items,
            'detalle' => [],
            'cuenta_puntos' => $cuentaPuntos,
        ]);

        $payload = [
            'partida' => $partida->id,
            'juego' => $juego,
            'cuenta_puntos' => $cuentaPuntos,
            'items' => $publico,
        ];

        if ($juego === 'trivia') {
            $payload['segundos'] = $cfg['segundos'][$grupo];
        } elseif ($juego === 'clasifica') {
            $payload['segundos'] = $cfg['segundos'][$grupo];
            $payload['etiquetas'] = config("reto.grupos.$grupo.etiquetas_clasifica");
            $payload['titulo'] = config("reto.grupos.$grupo.titulo_clasifica");
        }

        return ['partida' => $partida, 'payload' => $payload + $extra];
    }

    private function prepararTrivia(string $grupo, int $cuantas): array
    {
        $preguntas = Pregunta::where('grupo', $grupo)->where('activa', true)->inRandomOrder()->limit($cuantas)->get();
        $items = [];
        $publico = [];

        foreach ($preguntas as $p) {
            $orden = array_keys($p->opciones);
            shuffle($orden);
            $items[] = ['id' => $p->id, 'orden' => $orden];
            $publico[] = [
                'id' => $p->id,
                'enunciado' => $p->enunciado,
                'opciones' => array_map(fn ($i) => $p->opciones[$i], $orden),
            ];
        }

        return [$items, $publico];
    }

    private function prepararClasifica(string $grupo, int $cuantas): array
    {
        // Mitad y mitad, para que contestar siempre lo mismo no funcione.
        $porCategoria = (int) ceil($cuantas / 2);
        $tarjetas = collect(['a', 'b'])
            ->flatMap(fn ($cat) => Tarjeta::where('grupo', $grupo)->where('activa', true)
                ->where('categoria', $cat)->inRandomOrder()->limit($porCategoria)->get())
            ->shuffle()->take($cuantas)->values();

        return [
            $tarjetas->map(fn ($t) => ['id' => $t->id])->all(),
            $tarjetas->map(fn ($t) => ['id' => $t->id, 'texto' => $t->texto, 'icono' => $t->icono])->all(),
        ];
    }

    private function prepararMemorama(string $grupo, int $cuantos): array
    {
        $pares = Par::where('grupo', $grupo)->where('activo', true)->inRandomOrder()->limit($cuantos)->get();

        return [
            $pares->map(fn ($p) => ['id' => $p->id])->all(),
            $pares->map(fn ($p) => [
                'id' => $p->id, 'termino' => $p->termino, 'definicion' => $p->definicion, 'icono' => $p->icono,
            ])->all(),
        ];
    }

    /** Califica una respuesta de trivia o clasifica. */
    public function responder(Partida $partida, int $itemId, mixed $respuesta, int $ms): array
    {
        return DB::transaction(function () use ($partida, $itemId, $respuesta, $ms) {
            $partida = Partida::lockForUpdate()->findOrFail($partida->id);
            $this->asegurarAbierta($partida);

            $grupo = $partida->jugador->grupo;
            $item = collect($partida->items)->firstWhere('id', $itemId);
            $detalle = $partida->detalle ?? [];

            if (! $item) {
                throw ValidationException::withMessages(['item' => 'Esa pregunta no pertenece a esta partida.']);
            }
            if (isset($detalle[$itemId])) {
                throw ValidationException::withMessages(['item' => 'Esa pregunta ya fue contestada.']);
            }

            if ($partida->juego === 'trivia') {
                $cfg = config('reto.juegos.trivia');
                $pregunta = Pregunta::findOrFail($itemId);
                $limiteMs = $cfg['segundos'][$grupo] * 1000;
                $ms = max(0, min($ms, $limiteMs));
                $indiceCorrecto = array_search($pregunta->correcta, $item['orden'], true);
                $acierto = is_int($respuesta) && $respuesta === $indiceCorrecto;
                $puntos = $acierto
                    ? $cfg['puntos_acierto'] + (int) round($cfg['bono_rapidez_max'] * (1 - $ms / $limiteMs))
                    : 0;
                $resultado = ['correcta' => $indiceCorrecto, 'explicacion' => $pregunta->explicacion];
            } elseif ($partida->juego === 'clasifica') {
                $cfg = config('reto.juegos.clasifica');
                $gracia = 5;
                if ($partida->created_at->diffInSeconds(now()) > $cfg['segundos'][$grupo] + $gracia) {
                    throw ValidationException::withMessages(['tiempo' => 'Se acabó el tiempo de esta partida.']);
                }
                $tarjeta = Tarjeta::findOrFail($itemId);
                $acierto = $respuesta === $tarjeta->categoria;
                $puntos = $acierto ? $cfg['puntos_acierto'] : 0;
                $resultado = ['correcta' => $tarjeta->categoria, 'explicacion' => $tarjeta->explicacion];
            } elseif ($partida->juego === 'emprendedor') {
                $decision = $this->servicios->decidir($partida, $item, $respuesta);
                ['acierto' => $acierto, 'puntos' => $puntos, 'resultado' => $resultado] = $decision;
                $detalle[$itemId] = ['r' => $respuesta, 'ok' => $acierto, 'pts' => $puntos] + $decision['detalle'];
            } else {
                throw ValidationException::withMessages(['juego' => 'Este juego se califica al terminar.']);
            }

            $detalle[$itemId] ??= ['r' => $respuesta, 'ok' => $acierto, 'ms' => $ms, 'pts' => $puntos];
            $partida->detalle = $detalle;
            $partida->increment($acierto ? 'aciertos' : 'errores');
            $partida->puntos += $puntos;
            $partida->save();

            return $resultado + ['acierto' => $acierto, 'puntos_item' => $puntos, 'puntos' => $partida->puntos];
        });
    }

    /** Cierra la partida y abona puntos al jugador una sola vez. */
    public function terminar(Partida $partida, array $datos = []): array
    {
        return DB::transaction(function () use ($partida, $datos) {
            $partida = Partida::lockForUpdate()->findOrFail($partida->id);
            $jugador = Jugador::lockForUpdate()->findOrFail($partida->jugador_id);

            if ($partida->estado === 'terminada') {
                return $this->resumen($partida, $jugador);
            }
            if ($partida->estado === 'expirada' || $partida->vencida()) {
                $partida->update(['estado' => 'expirada', 'terminada_at' => now()]);
                throw ValidationException::withMessages(['partida' => 'La partida expiró. Inicia una nueva.']);
            }

            if ($partida->juego === 'memorama') {
                $partida->puntos = $this->puntosMemorama($partida, $jugador->grupo, $datos);
                $partida->aciertos = count($partida->items);
                $partida->errores = max(0, (int) ($datos['movimientos'] ?? 0) - count($partida->items));
                $partida->detalle = ['movimientos' => (int) ($datos['movimientos'] ?? 0), 'segundos' => (int) ($datos['segundos'] ?? 0)];
            } elseif (in_array($partida->juego, JuegosServicios::ARCADE, true)) {
                $calificacion = $this->servicios->calificar($partida, $jugador->grupo, $datos);
                $partida->fill(Arr::only($calificacion, ['puntos', 'aciertos', 'errores', 'detalle']));
            }

            // Se recalcula al cerrar: si el jugador abrió dos partidas a la vez, solo cuentan las permitidas.
            $cuenta = $partida->cuenta_puntos
                && $jugador->jugadasConPuntos()[$partida->juego] < config('reto.jugadas_con_puntos');

            $partida->cuenta_puntos = $cuenta;
            $partida->estado = 'terminada';
            $partida->terminada_at = now();
            $partida->save();

            if ($cuenta && $partida->puntos > 0) {
                $jugador->increment('puntos', $partida->puntos);
                $jugador->increment('puntos_totales', $partida->puntos);
            }

            return $this->resumen($partida, $jugador->fresh());
        });
    }

    private function puntosMemorama(Partida $partida, string $grupo, array $datos): int
    {
        $cfg = config('reto.juegos.memorama');
        $pares = count($partida->items);
        $movimientos = (int) ($datos['movimientos'] ?? 0);
        $segundosReales = $partida->created_at->diffInSeconds(now());

        // Un movimiento = voltear dos cartas. Menos movimientos que pares es imposible.
        if ($movimientos < $pares || $segundosReales < $cfg['segundos_minimos']) {
            throw ValidationException::withMessages(['memorama' => 'No pudimos validar la partida. Intenta de nuevo.']);
        }

        $puntos = $cfg['puntos_max'] - $cfg['castigo_por_movimiento'] * ($movimientos - $pares);

        return max($cfg['puntos_min'][$grupo], $puntos);
    }

    private function asegurarAbierta(Partida $partida): void
    {
        if ($partida->estado !== 'en_curso' || $partida->vencida()) {
            throw ValidationException::withMessages(['partida' => 'Esta partida ya terminó.']);
        }
    }

    private function resumen(Partida $partida, Jugador $jugador): array
    {
        return [
            'juego' => $partida->juego,
            'puntos' => $partida->puntos,
            'aciertos' => $partida->aciertos,
            'errores' => $partida->errores,
            'total_items' => count($partida->items),
            'cuenta_puntos' => $partida->cuenta_puntos,
            'jugador' => $jugador->paraKiosco(),
        ] + (in_array($partida->juego, JuegosServicios::ARCADE, true) ? ['detalle' => $partida->detalle] : []);
    }
}
