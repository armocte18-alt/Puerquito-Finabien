<?php

namespace App\Services;

use App\Models\Partida;
use Illuminate\Support\Arr;
use Illuminate\Validation\ValidationException;

/**
 * Juegos de servicios FINABIEN y Puerquito Ahorrador. Los arcade (remesa, cosecha, maratón y puerquito) se
 * generan aquí y el kiosco solo reporta qué piezas tocó: los puntos se
 * recalculan con la secuencia guardada. El emprendedor se califica por
 * decisión, como la trivia, sin revelar el efecto de cada opción antes.
 */
class JuegosServicios
{
    public const ARCADE = ['remesa', 'cosecha', 'maraton', 'puerquito'];

    /**
     * @return array{0: array<int, array>, 1: array<int, array>, 2: array<string, mixed>} items guardados, items públicos y datos extra del payload
     */
    public function preparar(string $juego, string $grupo): array
    {
        return match ($juego) {
            'remesa' => $this->prepararRemesa($grupo),
            'cosecha' => $this->prepararCosecha($grupo),
            'maraton' => $this->prepararMaraton($grupo),
            'emprendedor' => $this->prepararEmprendedor($grupo),
            'puerquito' => $this->prepararPuerquito($grupo),
        };
    }

    // ------------------------------------------------------------ El viaje de la remesa

    private function prepararRemesa(string $grupo): array
    {
        $cfg = config('reto.juegos.remesa');
        $piezas = config('reto_servicios.remesa.piezas');
        $pesos = config('reto_servicios.remesa.pesos');
        $buenos = array_keys(array_filter($piezas, fn ($p) => $p['bueno']));
        $malos = array_keys(array_filter($piezas, fn ($p) => ! $p['bueno']));

        $duracion = $cfg['segundos'][$grupo] * 1000;
        $viaje = $cfg['viaje_ms'][$grupo];
        $items = [];

        // Oleadas de una o dos piezas en carriles distintos: nunca se bloquean los tres.
        for ($t = 1200; $t + $viaje < $duracion; $t += $cfg['intervalo_ms'][$grupo]) {
            $carriles = Arr::shuffle([0, 1, 2]);
            $tipos = random_int(1, 100) <= 35
                ? [$this->sortear($buenos, $pesos), $this->sortear($malos, $pesos)]
                : [$this->sortear(array_keys($piezas), $pesos)];

            foreach ($tipos as $k => $tipo) {
                $items[] = ['id' => count($items), 't' => $t, 'carril' => $carriles[$k], 'tipo' => $tipo];
            }
        }

        $extra = [
            'segundos' => $cfg['segundos'][$grupo],
            'viaje_ms' => $viaje,
            'dolares' => $cfg['dolares'],
            'piezas' => $piezas,
            'cierre' => config('reto_servicios.remesa.cierre'),
        ];

        return [$items, $items, $extra];
    }

    /** @param  array<int, string>  $claves */
    private function sortear(array $claves, array $pesos): string
    {
        $bolsa = collect($claves)->flatMap(fn ($c) => array_fill(0, max(1, $pesos[$c] ?? 1), $c))->all();

        return $bolsa[array_rand($bolsa)];
    }

    // ------------------------------------------------------------ Cosecha tu ahorro

    private function prepararCosecha(string $grupo): array
    {
        $cfg = config('reto.juegos.cosecha');
        $etiquetas = config("reto_servicios.cosecha.ingresos.$grupo");
        $duracion = $cfg['segundos'] * 1000;
        $intervalo = $cfg['intervalo_ms'][$grupo];
        $items = [];

        for ($t = 800; $t + $intervalo <= $duracion; $t += $intervalo) {
            $items[] = [
                'id' => count($items),
                't' => $t,
                'tipo' => 'ingreso',
                'valor' => Arr::random($cfg['valores'][$grupo]),
                'texto' => Arr::random($etiquetas),
            ];
        }

        // Un imprevisto en casa a media partida: solo afecta lo que esté bajo el colchón.
        $items[] = ['id' => count($items), 't' => (int) round($duracion * random_int(55, 70) / 100), 'tipo' => 'perdida'];
        usort($items, fn ($a, $b) => $a['t'] <=> $b['t']);

        $extra = [
            'segundos' => $cfg['segundos'],
            'segundos_por_anio' => $cfg['segundos_por_anio'],
            'tasa_anual' => $cfg['tasa_anual'],
            'vida_ms' => $intervalo - 100,
            'perdida_colchon' => $cfg['perdida_colchon'],
            'destinos' => config('reto_servicios.cosecha.destinos'),
            'aviso_perdida' => config('reto_servicios.cosecha.perdida'),
            'cierre' => config('reto_servicios.cosecha.cierre'),
        ];

        return [$items, $items, $extra];
    }

    // ------------------------------------------------------------ Maratón de pagos

    private function prepararMaraton(string $grupo): array
    {
        $cfg = config('reto.juegos.maraton');
        $delGrupo = fn (array $tipos) => array_filter($tipos, fn ($r) => in_array($grupo, $r['grupos'] ?? [$grupo], true));
        $recibos = $delGrupo(config('reto_servicios.maraton.recibos'));
        $fraudes = $delGrupo(config('reto_servicios.maraton.fraudes'));

        $duracion = $cfg['segundos'][$grupo] * 1000;
        $caida = $cfg['caida_ms'][$grupo];
        $items = [];
        $t = 1000;

        while ($t + $caida * 0.6 < $duracion) {
            $esFraude = random_int(1, 100) <= $cfg['fraude_pct'][$grupo];
            $tipo = array_rand($esFraude ? $fraudes : $recibos);
            [$min, $max] = ($esFraude ? $fraudes : $recibos)[$tipo]['monto'];
            $items[] = [
                'id' => count($items),
                't' => $t,
                'x' => random_int(10, 90),
                'tipo' => $tipo,
                'fraude' => $esFraude,
                'monto' => random_int($min, $max),
            ];
            // El ritmo acelera hasta 60% del intervalo inicial.
            $t += (int) round($cfg['intervalo_ms'][$grupo] * (1 - 0.4 * min(1, $t / $duracion)));
        }

        $extra = [
            'segundos' => $cfg['segundos'][$grupo],
            'caida_ms' => $caida,
            'tipos' => ['recibos' => $recibos, 'fraudes' => $fraudes],
            'cierre' => config('reto_servicios.maraton.cierre'),
        ];

        return [$items, $items, $extra];
    }

    // ------------------------------------------------------------ Puerquito Ahorrador

    private function prepararPuerquito(string $grupo): array
    {
        $cfg = config('reto.juegos.puerquito');
        $duracion = $cfg['segundos'][$grupo] * 1000;
        [$caidaMin, $caidaMax] = $cfg['caida_ms'][$grupo];
        $items = [];

        for ($t = 600; $t + $caidaMin / (1 + $cfg['aceleracion'][$grupo]) < $duracion;) {
            $progreso = $t / $duracion;
            $azar = random_int(1, 100);
            // Las trampas son más frecuentes conforme avanza la partida.
            $tipo = match (true) {
                $azar <= $cfg['poder_pct'][$grupo] => $this->sortear(array_keys($cfg['poderes']), $cfg['poderes']),
                $azar <= $cfg['poder_pct'][$grupo] + $cfg['trampa_pct'][$grupo] * (0.75 + $progreso * 0.5) => $this->sortear(array_keys($cfg['trampas'][$grupo]), $cfg['trampas'][$grupo]),
                default => $this->sortear(array_keys($cfg['dinero'][$grupo]), $cfg['dinero'][$grupo]),
            };
            $caida = (int) round(random_int($caidaMin, $caidaMax) / (1 + $cfg['aceleracion'][$grupo] * $progreso));

            // Solo cae lo que alcanza a llegar al piso antes de que se acabe el tiempo.
            if ($t + $caida <= $duracion) {
                $items[] = [
                    'id' => count($items),
                    't' => $t,
                    'caida' => $caida,
                    'x' => random_int(6, 94),
                    'zig' => random_int(1, 100) <= $cfg['zigzag_pct'][$grupo] ? random_int(6, 14) : 0,
                    'tipo' => $tipo,
                ];
            }

            // Más rápido conforme avanza y en los últimos 10 segundos.
            $frenesi = $duracion - $t < 10000 ? 0.7 : 1;
            $t += (int) round($cfg['intervalo_ms'][$grupo] * (1 - 0.35 * $progreso) * $frenesi * random_int(75, 125) / 100);
        }

        $contenido = config('reto_servicios.puerquito');
        $extra = [
            'segundos' => $cfg['segundos'][$grupo],
            'escala' => $cfg['escala'][$grupo],
            'margen_atrape' => $cfg['margen_atrape'][$grupo],
            'resaltar_trampas' => $cfg['resaltar_trampas'][$grupo],
            'estrella_seg' => $cfg['estrella_seg'],
            'iman_seg' => $cfg['iman_seg'],
            'racha' => $cfg['racha'],
            'dinero' => collect($contenido['dinero'])->map(fn ($d) => Arr::only($d, ['texto', 'valor'])),
            'trampas' => collect($contenido['trampas'])->map(fn ($d) => Arr::only($d, ['texto', 'leccion'])),
            'poderes' => $contenido['poderes'],
            'sprite' => asset('img/alcancia-sprite.png'),
            'cierre' => $contenido['cierre'][$grupo],
        ];

        return [$items, $items, $extra];
    }

    // ------------------------------------------------------------ Simulador del emprendedor

    private function prepararEmprendedor(string $grupo): array
    {
        $escenarios = config("reto_servicios.emprendedor.escenarios.$grupo", []);
        $rondas = min(config('reto.juegos.emprendedor.rondas'), count($escenarios));
        $ids = collect(array_keys($escenarios))->shuffle()->take($rondas)->sort()->values();
        $items = [];
        $publico = [];

        foreach ($ids as $id) {
            [$icono, $situacion, $opciones] = $escenarios[$id];
            $orden = Arr::shuffle(array_keys($opciones));
            $items[] = ['id' => $id, 'orden' => $orden];
            $publico[] = [
                'id' => $id,
                'icono' => $icono,
                'situacion' => $situacion,
                'opciones' => array_map(fn ($i) => $opciones[$i][0], $orden),
            ];
        }

        $extra = [
            'negocio' => config("reto_servicios.emprendedor.negocio.$grupo"),
            'inicio_barras' => config('reto.juegos.emprendedor.inicio_barras'),
            'cierre' => config('reto_servicios.emprendedor.cierre'),
        ];

        return [$items, $publico, $extra];
    }

    /**
     * Califica una decisión del emprendedor.
     *
     * @return array{acierto: bool, puntos: int, detalle: array, resultado: array}
     */
    public function decidir(Partida $partida, array $item, mixed $respuesta): array
    {
        $cfg = config('reto.juegos.emprendedor');
        $grupo = $partida->jugador->grupo;
        $opciones = config("reto_servicios.emprendedor.escenarios.$grupo.{$item['id']}.2");

        if (! is_int($respuesta) || ! isset($item['orden'][$respuesta])) {
            throw ValidationException::withMessages(['respuesta' => 'Elige una de las dos opciones.']);
        }

        [, $deltaBienestar, $deltaNegocio, $explicacion] = $opciones[$item['orden'][$respuesta]];
        $sumas = array_map(fn ($o) => $o[1] + $o[2], $opciones);
        $mejor = array_search(max($sumas), $sumas, true);
        $acierto = $item['orden'][$respuesta] === $mejor;
        $puntos = max(0, min($cfg['puntos_max_ronda'], ($deltaBienestar + $deltaNegocio) * $cfg['puntos_por_punto']));

        // Las barras se reconstruyen con todas las decisiones previas, en orden.
        $bienestar = $negocio = $cfg['inicio_barras'];
        foreach ($partida->detalle ?? [] as $previa) {
            $bienestar = max(0, min(100, $bienestar + $previa['db']));
            $negocio = max(0, min(100, $negocio + $previa['dn']));
        }
        $bienestar = max(0, min(100, $bienestar + $deltaBienestar));
        $negocio = max(0, min(100, $negocio + $deltaNegocio));

        return [
            'acierto' => $acierto,
            'puntos' => $puntos,
            'detalle' => ['db' => $deltaBienestar, 'dn' => $deltaNegocio],
            'resultado' => [
                'correcta' => array_search($mejor, $item['orden'], true),
                'explicacion' => $explicacion,
                'delta' => ['bienestar' => $deltaBienestar, 'negocio' => $deltaNegocio],
                'barras' => ['bienestar' => $bienestar, 'negocio' => $negocio],
            ],
        ];
    }

    // ------------------------------------------------------------ Cierre de arcades

    /**
     * Recalcula una partida arcade con lo que reportó el kiosco.
     *
     * @return array{puntos: int, aciertos: int, errores: int, detalle: array<string, int>}
     */
    public function calificar(Partida $partida, string $grupo, array $datos): array
    {
        $cfg = config("reto.juegos.{$partida->juego}");
        $segundos = is_array($cfg['segundos']) ? $cfg['segundos'][$grupo] : $cfg['segundos'];

        if ($partida->created_at->diffInSeconds(now()) < $segundos - config('reto.arcade_tolerancia_seg')) {
            throw ValidationException::withMessages(['partida' => 'No pudimos validar la partida. Intenta de nuevo.']);
        }

        $items = collect($partida->items)->keyBy('id');
        $tocados = fn (string $clave) => collect($datos[$clave] ?? [])->map(fn ($i) => (int) $i)->unique()
            ->filter(fn ($i) => $items->has($i))->map(fn ($i) => $items[$i]);

        return match ($partida->juego) {
            'remesa' => $this->calificarRemesa($cfg, $tocados('recogidos'), $tocados('golpes')),
            'cosecha' => $this->calificarCosecha($cfg, $partida->items, $datos['decisiones'] ?? []),
            'maraton' => $this->calificarMaraton($cfg, $tocados('pagados'), $items),
            'puerquito' => $this->calificarPuerquito($cfg, $tocados('atrapados'), $items),
        };
    }

    private function calificarRemesa(array $cfg, $recogidos, $golpes): array
    {
        $piezas = config('reto_servicios.remesa.piezas');
        $buenos = $recogidos->filter(fn ($i) => $piezas[$i['tipo']]['bueno']);
        $malos = $golpes->reject(fn ($i) => $piezas[$i['tipo']]['bueno']);

        $dolares = $cfg['dolares']
            + $buenos->sum(fn ($i) => $piezas[$i['tipo']]['valor'])
            - $malos->sum(fn ($i) => $piezas[$i['tipo']]['valor']);
        $puntos = $buenos->count() * $cfg['puntos_bueno'] - $malos->count() * $cfg['castigo_obstaculo'];

        return [
            'puntos' => max($cfg['puntos_min'], min($cfg['puntos_max'], $puntos)),
            'aciertos' => $buenos->count(),
            'errores' => $malos->count(),
            'detalle' => ['enviados' => $cfg['dolares'], 'llegaron' => max(0, $dolares)],
        ];
    }

    private function calificarCosecha(array $cfg, array $items, array $decisiones): array
    {
        $tasa = $cfg['tasa_anual'];
        $ahorro = $colchon = $antojo = $perdido = $maximo = 0.0;
        $aciertos = 0;

        foreach ($items as $item) {
            if ($item['tipo'] === 'perdida') {
                $perdido += $colchon * $cfg['perdida_colchon'];
                $colchon *= 1 - $cfg['perdida_colchon'];

                continue;
            }

            // Lo que entra al ahorro capitaliza los "años" que faltan para terminar.
            $anios = ($cfg['segundos'] - $item['t'] / 1000) / $cfg['segundos_por_anio'];
            $crecido = $item['valor'] * (1 + $tasa) ** $anios;
            $maximo += $crecido;

            $destino = $decisiones[$item['id']] ?? null;
            if ($destino === 'ahorro') {
                $ahorro += $crecido;
                $aciertos++;
            } elseif ($destino === 'colchon') {
                $colchon += $item['valor'];
            } elseif ($destino === 'antojo') {
                $antojo += $item['valor'];
            }
        }

        $puntos = $maximo > 0 ? (int) round($cfg['puntos_max'] * ($ahorro + $cfg['peso_colchon'] * $colchon) / $maximo) : 0;
        $ingresos = count(array_filter($items, fn ($i) => $i['tipo'] === 'ingreso'));

        return [
            'puntos' => min($cfg['puntos_max'], $puntos),
            'aciertos' => $aciertos,
            'errores' => $ingresos - $aciertos,
            'detalle' => [
                'ahorro' => (int) round($ahorro),
                'colchon' => (int) round($colchon),
                'antojo' => (int) round($antojo),
                'perdido' => (int) round($perdido),
                'maximo' => (int) round($maximo),
            ],
        ];
    }

    private function calificarPuerquito(array $cfg, $atrapados, $items): array
    {
        $contenido = config('reto_servicios.puerquito');
        $racha = $cfg['racha'];
        $bruto = 0.0;
        $seguidas = $mejorRacha = $ahorro = $monedas = $billetes = $trampas = 0;
        $estrellaHasta = -1;

        // Se recorren en el orden en que llegaron a la alcancía para reconstruir la racha.
        foreach ($atrapados->sortBy(fn ($i) => $i['t'] + $i['caida']) as $item) {
            $llega = $item['t'] + $item['caida'];
            $tipo = $item['tipo'];

            if (isset($contenido['dinero'][$tipo])) {
                $seguidas++;
                $mejorRacha = max($mejorRacha, $seguidas);
                $multiplicador = min($racha['maximo'], 1 + intdiv($seguidas, $racha['cada']) * $racha['incremento'])
                    * ($llega <= $estrellaHasta ? 2 : 1);
                $bruto += $contenido['dinero'][$tipo]['puntos'] * $multiplicador;
                $ahorro += $contenido['dinero'][$tipo]['valor'];
                str_starts_with($tipo, 'm') ? $monedas++ : $billetes++;
            } elseif (isset($contenido['trampas'][$tipo])) {
                $seguidas = 0;
                $bruto += $contenido['trampas'][$tipo]['puntos'];
                $trampas++;
            } elseif ($tipo === 'estrella') {
                $estrellaHasta = $llega + $cfg['estrella_seg'] * 1000;
            }
        }

        // Los puntos dependen de qué parte del dinero que cayó se atrapó: es justo para cualquier grupo.
        $dinero = $items->filter(fn ($i) => isset($contenido['dinero'][$i['tipo']]));
        $base = $dinero->sum(fn ($i) => $contenido['dinero'][$i['tipo']]['puntos']);
        $puntos = $base > 0 ? (int) round($cfg['puntos_max'] * $bruto / $base) : 0;

        return [
            'puntos' => max($cfg['puntos_min'], min($cfg['puntos_max'], $puntos)),
            'aciertos' => $monedas + $billetes,
            'errores' => $trampas,
            'detalle' => [
                'ahorro' => $ahorro,
                'disponible' => $dinero->sum(fn ($i) => $contenido['dinero'][$i['tipo']]['valor']),
                'monedas' => $monedas,
                'billetes' => $billetes,
                'trampas' => $trampas,
                'mejor_racha' => $mejorRacha,
            ],
        ];
    }

    private function calificarMaraton(array $cfg, $pagados, $items): array
    {
        $legitimos = $pagados->reject(fn ($i) => $i['fraude']);
        $fraudes = $pagados->filter(fn ($i) => $i['fraude']);
        $totalFraudes = $items->where('fraude', true)->count();
        $puntos = $legitimos->count() * $cfg['puntos_pago'] - $fraudes->count() * $cfg['castigo_fraude'];

        return [
            'puntos' => max(0, min($cfg['puntos_max'], $puntos)),
            'aciertos' => $legitimos->count(),
            'errores' => $fraudes->count(),
            'detalle' => [
                'pagados' => $legitimos->count(),
                'recibos' => $items->count() - $totalFraudes,
                'pesos' => $legitimos->sum('monto'),
                'fraudes_pagados' => $fraudes->count(),
                'fraudes_evitados' => $totalFraudes - $fraudes->count(),
            ],
        ];
    }
}
