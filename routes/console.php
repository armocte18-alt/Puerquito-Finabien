<?php

use App\Models\Canje;
use App\Models\Evento;
use App\Models\Jugador;
use App\Models\Premio;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('reto:limpiar {--evento : Solo los jugadores del evento activo} {--force : No pedir confirmación}', function () {
    $evento = $this->option('evento') ? Evento::activo() : null;

    if ($this->option('evento') && ! $evento) {
        $this->error('No hay un evento activo.');

        return 1;
    }

    $jugadores = Jugador::query()->when($evento, fn ($q) => $q->where('evento_id', $evento->id));
    $total = $jugadores->count();
    $donde = $evento ? "del evento «{$evento->nombre}»" : 'de todos los eventos';

    if ($total === 0) {
        $this->info("No hay jugadores {$donde}.");

        return 0;
    }

    $canjes = Canje::whereIn('jugador_id', (clone $jugadores)->select('id'))->count();
    if (! $this->option('force') && ! $this->confirm("Se borrarán {$total} jugadores {$donde}, con sus partidas y {$canjes} canjes. ¿Continuar?")) {
        $this->line('Cancelado.');

        return 0;
    }

    DB::transaction(function () use ($jugadores) {
        // Los premios canjeados vuelven a las existencias.
        Canje::whereIn('jugador_id', (clone $jugadores)->select('id'))
            ->selectRaw('premio_id, count(*) as total')->groupBy('premio_id')->get()
            ->each(fn ($c) => Premio::whereKey($c->premio_id)->whereNotNull('stock')->increment('stock', $c->total));

        // Partidas y canjes se borran en cascada con el jugador.
        $jugadores->delete();
    });

    $this->info("Listo: se borraron {$total} jugadores {$donde}. Preguntas, premios y eventos no se tocaron.");

    return 0;
})->purpose('Borra jugadores, partidas y canjes (por ejemplo, los de prueba antes de un evento)');
