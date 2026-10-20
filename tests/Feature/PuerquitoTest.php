<?php

namespace Tests\Feature;

use App\Models\Canje;
use App\Models\Jugador;
use App\Models\Partida;
use App\Models\Premio;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PuerquitoTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function iniciar(int $edad = 30): array
    {
        $j = $this->postJson('/api/jugadores', ['nombre' => 'Ana', 'edad' => $edad, 'avatar' => 'cerdito'])->assertCreated()->json();

        return $this->postJson("/api/jugadores/{$j['codigo']}/partidas", ['juego' => 'puerquito'])->assertCreated()->json()
            + ['codigo' => $j['codigo']];
    }

    public function test_la_secuencia_depende_del_grupo_y_todo_alcanza_a_caer(): void
    {
        foreach ([8 => 'ninos', 13 => 'jovenes', 40 => 'adultos'] as $edad => $grupo) {
            $d = $this->iniciar($edad);
            $cfg = config('reto.juegos.puerquito');
            $tipos = collect($d['items'])->pluck('tipo')->unique();

            $this->assertSame($cfg['segundos'][$grupo], $d['segundos']);
            $this->assertGreaterThan(20, count($d['items']));
            $this->assertEmpty($tipos->diff([...array_keys($cfg['dinero'][$grupo]), ...array_keys($cfg['trampas'][$grupo]), ...array_keys($cfg['poderes'])]));
            foreach ($d['items'] as $item) {
                $this->assertLessThanOrEqual($cfg['segundos'][$grupo] * 1000, $item['t'] + $item['caida']);
            }
        }
    }

    public function test_recalcula_los_puntos_con_la_racha_y_las_trampas(): void
    {
        $d = $this->iniciar();
        $partida = Partida::find($d['partida']);
        $contenido = config('reto_servicios.puerquito');
        $cfg = config('reto.juegos.puerquito');

        // Secuencia controlada: 6 monedas de $10, luego un fraude.
        $items = [];
        for ($i = 0; $i < 6; $i++) {
            $items[] = ['id' => $i, 't' => 1000 * ($i + 1), 'caida' => 2000, 'x' => 50, 'zig' => 0, 'tipo' => 'm10'];
        }
        $items[] = ['id' => 6, 't' => 8000, 'caida' => 2000, 'x' => 50, 'zig' => 0, 'tipo' => 'anzuelo'];
        $items[] = ['id' => 7, 't' => 9000, 'caida' => 2000, 'x' => 50, 'zig' => 0, 'tipo' => 'b20'];
        $partida->update(['items' => $items]);

        $this->postJson("/api/partidas/{$d['partida']}/terminar", ['atrapados' => [0, 1]])->assertStatus(422);

        $this->travel($cfg['segundos']['adultos'] + 1)->seconds();
        $fin = $this->postJson("/api/partidas/{$d['partida']}/terminar", [
            // Repetidos y piezas que no existen no cuentan.
            'atrapados' => [0, 1, 2, 3, 4, 5, 5, 6, 99],
        ])->assertOk()->json();

        $m10 = $contenido['dinero']['m10']['puntos'];
        $bruto = 4 * $m10 + 1.5 * $m10 + 1.5 * $m10 + $contenido['trampas']['anzuelo']['puntos']; // la 5.ª y 6.ª van con racha ×1.5
        $base = 6 * $m10 + $contenido['dinero']['b20']['puntos'];

        $this->assertSame(max($cfg['puntos_min'], (int) round(300 * $bruto / $base)), $fin['puntos']);
        $this->assertSame(6, $fin['aciertos']);
        $this->assertSame(1, $fin['errores']);
        $this->assertSame(60, $fin['detalle']['ahorro']);
        $this->assertSame(80, $fin['detalle']['disponible']);
        $this->assertSame(6, $fin['detalle']['mejor_racha']);
        $this->assertSame($fin['puntos'], Jugador::where('codigo', $d['codigo'])->value('puntos'));
    }

    public function test_la_estrella_duplica_y_el_tope_es_300(): void
    {
        $d = $this->iniciar();
        $items = [['id' => 0, 't' => 500, 'caida' => 1000, 'x' => 50, 'zig' => 0, 'tipo' => 'estrella']];
        for ($i = 1; $i <= 10; $i++) {
            $items[] = ['id' => $i, 't' => 500 + 200 * $i, 'caida' => 1000, 'x' => 50, 'zig' => 0, 'tipo' => 'b500'];
        }
        Partida::find($d['partida'])->update(['items' => $items]);
        $this->travel(60)->seconds();

        $fin = $this->postJson("/api/partidas/{$d['partida']}/terminar", ['atrapados' => range(0, 10)])->assertOk()->json();

        $this->assertSame(300, $fin['puntos']);
        $this->assertSame(5000, $fin['detalle']['ahorro']);
    }

    public function test_aparece_en_el_kiosco_y_cuenta_para_el_limite_de_partidas(): void
    {
        $this->getJson('/api/configuracion')->assertOk()->assertJsonPath('juegos.puerquito.nombre', 'Puerquito Ahorrador');

        $d = $this->iniciar();
        $this->travel(60)->seconds();
        $this->postJson("/api/partidas/{$d['partida']}/terminar", ['atrapados' => []])->assertOk();

        $this->getJson("/api/jugadores/{$d['codigo']}")->assertOk()->assertJsonPath('jugadas.puerquito', 1);
    }

    public function test_limpiar_borra_jugadores_y_devuelve_existencias(): void
    {
        $premio = Premio::orderBy('costo')->first();
        $stock = $premio->stock;
        $d = $this->iniciar();
        Jugador::where('codigo', $d['codigo'])->update(['puntos' => 5000]);
        $this->postJson("/api/jugadores/{$d['codigo']}/canjes", ['premio' => $premio->id])->assertCreated();
        $this->assertSame($stock - 1, $premio->fresh()->stock);

        $this->artisan('reto:limpiar')
            ->expectsConfirmation('Se borrarán 1 jugadores de todos los eventos, con sus partidas y 1 canjes. ¿Continuar?', 'no')
            ->assertSuccessful();
        $this->assertSame(1, Jugador::count());

        $this->artisan('reto:limpiar', ['--evento' => true, '--force' => true])->assertSuccessful();

        $this->assertSame(0, Jugador::count());
        $this->assertSame(0, Partida::count());
        $this->assertSame(0, Canje::count());
        $this->assertSame($stock, $premio->fresh()->stock);
    }
}
