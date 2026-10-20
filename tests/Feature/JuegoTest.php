<?php

namespace Tests\Feature;

use App\Models\Puntaje;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JuegoTest extends TestCase
{
    use RefreshDatabase;

    private function partida(array $cambios = []): array
    {
        return array_merge([
            'nombre' => 'Ana',
            'grupo' => 'exploradores',
            'puntos' => 12500,
            'monedas' => 30,
            'billetes' => 8,
            'trampas' => 2,
            'ahorro' => 640,
            'duracion' => 75,
        ], $cambios);
    }

    public function test_la_portada_muestra_los_tres_rangos_de_edad(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Hasta 8 años')
            ->assertSee('De 9 a 15 años')
            ->assertSee('De 16 años en adelante');
    }

    public function test_cada_rango_tiene_su_pantalla_de_juego(): void
    {
        foreach (array_keys(config('juego.grupos')) as $grupo) {
            $this->get(route('jugar', $grupo))
                ->assertOk()
                ->assertSee(config("juego.grupos.$grupo.nombre"))
                ->assertSee('window.PUERQUITO', false);
        }
    }

    public function test_un_rango_inexistente_da_404(): void
    {
        $this->get('/jugar/abuelos')->assertNotFound();
        $this->getJson('/puntajes/abuelos')->assertNotFound();
    }

    public function test_guarda_un_puntaje_y_devuelve_la_posicion(): void
    {
        Puntaje::factory()->create(['grupo' => 'exploradores', 'puntos' => 20000]);
        Puntaje::factory()->create(['grupo' => 'exploradores', 'puntos' => 5000]);
        Puntaje::factory()->create(['grupo' => 'expertos', 'puntos' => 99999]);

        $this->postJson('/puntajes', $this->partida())
            ->assertCreated()
            ->assertJsonPath('posicion', 2)
            ->assertJsonCount(3, 'puntajes')
            ->assertJsonPath('puntajes.1.nombre', 'Ana');

        $this->assertDatabaseHas('puntajes', ['nombre' => 'Ana', 'grupo' => 'exploradores', 'puntos' => 12500]);
    }

    public function test_limpia_el_nombre(): void
    {
        $this->postJson('/puntajes', $this->partida(['nombre' => '  <b>Luis</b>   Mario ']))->assertCreated();

        $this->assertDatabaseHas('puntajes', ['nombre' => 'Luis Mario']);
    }

    public function test_rechaza_datos_invalidos(): void
    {
        $this->postJson('/puntajes', $this->partida(['nombre' => '']))->assertJsonValidationErrors('nombre');
        $this->postJson('/puntajes', $this->partida(['nombre' => str_repeat('x', 21)]))->assertJsonValidationErrors('nombre');
        $this->postJson('/puntajes', $this->partida(['grupo' => 'otro']))->assertJsonValidationErrors('grupo');
        $this->postJson('/puntajes', $this->partida(['puntos' => -5]))->assertJsonValidationErrors('puntos');
    }

    public function test_rechaza_puntajes_imposibles(): void
    {
        $maximo = 75 * config('juego.puntos_maximos_por_segundo');

        $this->postJson('/puntajes', $this->partida(['puntos' => $maximo + 1]))->assertJsonValidationErrors('puntos');
        $this->postJson('/puntajes', $this->partida(['duracion' => 300]))->assertJsonValidationErrors('duracion');
    }

    public function test_la_tabla_esta_ordenada_y_limitada_por_rango(): void
    {
        Puntaje::factory()->count(15)->create(['grupo' => 'pequenos']);
        Puntaje::factory()->create(['grupo' => 'expertos', 'puntos' => 999999]);

        $puntos = collect($this->getJson('/puntajes/pequenos')->assertOk()->json('puntajes'))->pluck('puntos');

        $this->assertCount(config('juego.tabla_limite'), $puntos);
        $this->assertSame($puntos->sortDesc()->values()->all(), $puntos->all());
        $this->assertNotContains(999999, $puntos);
    }

    public function test_el_comando_limpia_los_puntajes(): void
    {
        Puntaje::factory()->count(3)->create(['grupo' => 'pequenos']);
        Puntaje::factory()->count(2)->create(['grupo' => 'expertos']);

        $this->artisan('puntajes:limpiar', ['grupo' => 'pequenos', '--force' => true])->assertSuccessful();
        $this->assertSame(0, Puntaje::where('grupo', 'pequenos')->count());
        $this->assertSame(2, Puntaje::count());

        $this->artisan('puntajes:limpiar')
            ->expectsConfirmation('Se borrarán 2 puntajes de todos los rangos. ¿Continuar?', 'no')
            ->assertSuccessful();
        $this->assertSame(2, Puntaje::count());

        $this->artisan('puntajes:limpiar', ['--force' => true])->assertSuccessful();
        $this->assertSame(0, Puntaje::count());

        $this->artisan('puntajes:limpiar', ['grupo' => 'abuelos'])->assertFailed();
    }
}
