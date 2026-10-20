<?php

namespace Tests\Feature;

use App\Models\Jugador;
use App\Models\Partida;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JuegosServiciosTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function iniciar(string $juego, int $edad = 30): array
    {
        $j = $this->postJson('/api/jugadores', ['nombre' => 'Ana', 'edad' => $edad, 'avatar' => 'abeja'])->assertCreated()->json();

        return $this->postJson("/api/jugadores/{$j['codigo']}/partidas", ['juego' => $juego])->assertCreated()->json()
            + ['codigo' => $j['codigo']];
    }

    public function test_emprendedor_califica_cada_decision_sin_revelar_efectos(): void
    {
        $d = $this->iniciar('emprendedor');
        $this->assertCount(5, $d['items']);
        // El kiosco solo recibe el texto de cada opción, no sus efectos.
        $this->assertContainsOnlyString($d['items'][0]['opciones']);

        $partida = Partida::find($d['partida']);
        $item = $partida->items[0];
        $opciones = config("reto_servicios.emprendedor.escenarios.adultos.{$item['id']}.2");
        $mejor = array_search(0, $item['orden'], true); // en el contenido, la opción 0 es la mejor

        $r = $this->postJson("/api/partidas/{$d['partida']}/respuestas", ['item' => $item['id'], 'respuesta' => $mejor])
            ->assertOk()->json();

        $this->assertTrue($r['acierto']);
        $this->assertSame(min(60, ($opciones[0][1] + $opciones[0][2]) * 2), $r['puntos_item']);
        $this->assertSame(50 + $opciones[0][1], $r['barras']['bienestar']);
        $this->assertSame(50 + $opciones[0][2], $r['barras']['negocio']);

        $this->postJson("/api/partidas/{$d['partida']}/respuestas", ['item' => $partida->items[1]['id'], 'respuesta' => 5])
            ->assertStatus(422);
    }

    public function test_remesa_recalcula_puntos_y_ignora_piezas_que_no_corresponden(): void
    {
        $d = $this->iniciar('remesa');
        $piezas = config('reto_servicios.remesa.piezas');
        $buenas = collect($d['items'])->filter(fn ($i) => $piezas[$i['tipo']]['bueno'])->pluck('id');
        $malas = collect($d['items'])->reject(fn ($i) => $piezas[$i['tipo']]['bueno'])->pluck('id');

        $this->postJson("/api/partidas/{$d['partida']}/terminar", ['recogidos' => $buenas->all()])->assertStatus(422);

        $this->travel(41)->seconds();
        $fin = $this->postJson("/api/partidas/{$d['partida']}/terminar", [
            // Reportar obstáculos como "recogidos" o repetir piezas no suma.
            'recogidos' => [...$buenas->take(3)->all(), $buenas->first(), ...$malas->take(2)->all()],
            'golpes' => $malas->take(1)->all(),
        ])->assertOk()->json();

        $this->assertSame(max(30, 3 * 12 - 15), $fin['puntos']);
        $this->assertSame(3, $fin['aciertos']);
        $this->assertSame(1, $fin['errores']);
        $this->assertSame(300, $fin['detalle']['enviados']);
    }

    public function test_cosecha_premia_el_ahorro_formal_y_castiga_el_colchon(): void
    {
        $d = $this->iniciar('cosecha', 8);
        $ingresos = collect($d['items'])->where('tipo', 'ingreso');
        $this->travel(31)->seconds();

        $todoAhorro = $this->postJson("/api/partidas/{$d['partida']}/terminar", [
            'decisiones' => $ingresos->mapWithKeys(fn ($i) => [$i['id'] => 'ahorro'])->all(),
        ])->assertOk()->json();

        $this->assertSame(300, $todoAhorro['puntos']);
        $this->assertSame($todoAhorro['detalle']['maximo'], $todoAhorro['detalle']['ahorro']);
        $this->assertGreaterThan($ingresos->sum('valor'), $todoAhorro['detalle']['ahorro']);

        $d2 = $this->postJson("/api/jugadores/{$d['codigo']}/partidas", ['juego' => 'cosecha'])->json();
        $this->travel(31)->seconds();
        $todoColchon = $this->postJson("/api/partidas/{$d2['partida']}/terminar", [
            'decisiones' => collect($d2['items'])->where('tipo', 'ingreso')->mapWithKeys(fn ($i) => [$i['id'] => 'colchon'])->all(),
        ])->assertOk()->json();

        $this->assertGreaterThan(0, $todoColchon['detalle']['perdido']);
        $this->assertLessThan(75, $todoColchon['puntos']);
    }

    public function test_maraton_castiga_pagar_fraudes(): void
    {
        $d = $this->iniciar('maraton');
        Partida::whereKey($d['partida'])->update(['items' => collect($d['items'])
            ->map(fn ($i, $k) => ['fraude' => $k === 0] + $i)->all()]);
        $this->travel(46)->seconds();

        $fin = $this->postJson("/api/partidas/{$d['partida']}/terminar", ['pagados' => [0, 1, 2, 3]])->assertOk()->json();

        $this->assertSame(6, $fin['puntos']); // 3 recibos × 12 − 1 fraude × 30
        $this->assertSame(1, $fin['detalle']['fraudes_pagados']);
        $this->assertSame(3, $fin['detalle']['pagados']);
        $this->assertSame(6, Jugador::where('codigo', $d['codigo'])->value('puntos'));
    }
}
