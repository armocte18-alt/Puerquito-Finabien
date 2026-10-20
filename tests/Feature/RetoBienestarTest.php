<?php

namespace Tests\Feature;

use App\Models\Jugador;
use App\Models\Partida;
use App\Models\Pregunta;
use App\Models\Premio;
use App\Models\Tarjeta;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RetoBienestarTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    private function registrar(int $edad = 12): array
    {
        return $this->postJson('/api/jugadores', ['nombre' => 'Ana', 'edad' => $edad, 'avatar' => 'abeja'])
            ->assertCreated()->json();
    }

    public function test_asigna_grupo_por_rango_de_edad(): void
    {
        $this->assertSame('ninos', Jugador::grupoPorEdad(10));
        $this->assertSame('jovenes', Jugador::grupoPorEdad(11));
        $this->assertSame('jovenes', Jugador::grupoPorEdad(15));
        $this->assertSame('adultos', Jugador::grupoPorEdad(16));
    }

    public function test_configuracion_no_expone_respuestas(): void
    {
        $j = $this->registrar(8);
        $datos = $this->postJson("/api/jugadores/{$j['codigo']}/partidas", ['juego' => 'trivia'])->assertCreated()->json();

        $this->assertCount(5, $datos['items']);
        $this->assertArrayNotHasKey('correcta', $datos['items'][0]);
        $this->assertCount(3, $datos['items'][0]['opciones']);
        // Solo preguntas del grupo de edad del jugador.
        $this->assertSame(['ninos'], Pregunta::whereIn('id', array_column($datos['items'], 'id'))->distinct()->pluck('grupo')->all());
    }

    public function test_trivia_califica_en_servidor_y_abona_puntos(): void
    {
        $j = $this->registrar();
        $datos = $this->postJson("/api/jugadores/{$j['codigo']}/partidas", ['juego' => 'trivia'])->json();
        $partida = Partida::find($datos['partida']);

        foreach ($datos['items'] as $q) {
            $item = collect($partida->items)->firstWhere('id', $q['id']);
            $correcta = array_search(Pregunta::find($q['id'])->correcta, $item['orden'], true);
            $r = $this->postJson("/api/partidas/{$datos['partida']}/respuestas", ['item' => $q['id'], 'respuesta' => $correcta, 'ms' => 25000])
                ->assertOk()->json();
            $this->assertTrue($r['acierto']);
            $this->assertSame(50, $r['puntos_item']); // tiempo agotado: sin bono
        }

        $this->postJson("/api/partidas/{$datos['partida']}/respuestas", ['item' => $datos['items'][0]['id'], 'respuesta' => 0])
            ->assertStatus(422); // no se puede contestar dos veces

        $fin = $this->postJson("/api/partidas/{$datos['partida']}/terminar")->assertOk()->json();
        $this->assertSame(300, $fin['puntos']);
        $this->assertSame(300, $fin['jugador']['puntos']);

        // Terminar dos veces no duplica puntos.
        $this->postJson("/api/partidas/{$datos['partida']}/terminar")->assertOk();
        $this->assertSame(300, Jugador::where('codigo', $j['codigo'])->value('puntos'));
    }

    public function test_solo_las_primeras_partidas_suman_puntos(): void
    {
        $j = $this->registrar(30);
        config(['reto.jugadas_con_puntos' => 1]);

        foreach ([true, false] as $esperado) {
            $d = $this->postJson("/api/jugadores/{$j['codigo']}/partidas", ['juego' => 'clasifica'])->json();
            $this->assertSame($esperado, $d['cuenta_puntos']);
            $t = $d['items'][0];
            $this->postJson("/api/partidas/{$d['partida']}/respuestas", ['item' => $t['id'], 'respuesta' => Tarjeta::find($t['id'])->categoria])->assertOk();
            $this->postJson("/api/partidas/{$d['partida']}/terminar")->assertOk();
        }

        $this->assertSame(20, Jugador::where('codigo', $j['codigo'])->value('puntos'));
    }

    public function test_memorama_rechaza_partidas_imposibles(): void
    {
        $j = $this->registrar();
        $d = $this->postJson("/api/jugadores/{$j['codigo']}/partidas", ['juego' => 'memorama'])->json();

        $this->postJson("/api/partidas/{$d['partida']}/terminar", ['movimientos' => 6, 'segundos' => 2])->assertStatus(422);

        $this->travel(30)->seconds();
        $fin = $this->postJson("/api/partidas/{$d['partida']}/terminar", ['movimientos' => 10, 'segundos' => 30])->assertOk()->json();
        $this->assertSame(260, $fin['puntos']); // 300 - 10 × (10 - 6)
    }

    public function test_canje_descuenta_puntos_y_existencias(): void
    {
        $j = $this->registrar();
        Jugador::where('codigo', $j['codigo'])->update(['puntos' => 500]);
        $premio = Premio::where('costo', 450)->first();
        $stock = $premio->stock;

        $r = $this->postJson("/api/jugadores/{$j['codigo']}/canjes", ['premio' => $premio->id])->assertCreated()->json();
        $this->assertStringStartsWith('RF-', $r['folio']);
        $this->assertSame(50, $r['jugador']['puntos']);
        $this->assertSame($stock - 1, $premio->fresh()->stock);

        $this->postJson("/api/jugadores/{$j['codigo']}/canjes", ['premio' => $premio->id])
            ->assertStatus(422)->assertJsonPath('errors.premio.0', 'Todavía no tienes puntos suficientes para este premio.');
    }

    public function test_panel_staff_requiere_pin(): void
    {
        $this->get('/staff')->assertRedirect('/staff/entrar');
        $this->post('/staff/entrar', ['pin' => '000'])->assertSessionHasErrors('pin');
        $this->post('/staff/entrar', ['pin' => config('reto.staff_pin')])->assertRedirect('/staff');
        $this->get('/staff')->assertOk()->assertSee('Premios por entregar');
        $this->get('/staff/preguntas?grupo=adultos')->assertOk()->assertSee('FINABIEN');
    }

    public function test_kiosco_carga(): void
    {
        $this->get('/')->assertOk()->assertSee('Reto Finabien');
        $this->getJson('/api/configuracion')->assertOk()->assertJsonStructure(['grupos', 'premios', 'ranking', 'avatares']);
    }
}
