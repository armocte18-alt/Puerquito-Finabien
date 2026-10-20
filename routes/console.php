<?php

use App\Models\Canje;
use App\Models\Evento;
use App\Models\Jugador;
use App\Models\Partida;
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

Artisan::command('reto:estado', function () {
    $evento = Evento::activo();
    $grupos = config('reto.grupos');

    $this->info('Base de datos: '.config('database.default').' · '.config('database.connections.'.config('database.default').'.database'));
    $this->info($evento ? "Evento activo: «{$evento->nombre}» (id {$evento->id})" : 'Sin evento activo: el ranking muestra a todos los jugadores.');

    $delEvento = Jugador::when($evento, fn ($q) => $q->where('evento_id', $evento->id))->count();
    $this->line('Jugadores registrados: '.Jugador::count().($evento ? " · en este evento: {$delEvento}" : ''));
    $fuera = $evento ? Jugador::where(fn ($q) => $q->whereNull('evento_id')->orWhere('evento_id', '!=', $evento->id))->count() : 0;
    if ($fuera > 0) {
        $this->warn("{$fuera} jugadores son de otro evento o de antes de crearlo: no salen en el ranking actual.");
    }

    // La misma consulta que usa la portada del kiosco.
    $this->newLine();
    $this->info('Ranking que muestra la portada (top 5 por grupo):');
    foreach ($grupos as $clave => $g) {
        $top = Jugador::when($evento, fn ($q) => $q->where('evento_id', $evento->id))
            ->where('grupo', $clave)->where('puntos_totales', '>', 0)
            ->orderByDesc('puntos_totales')->orderBy('id')->limit(5)->get(['nombre', 'puntos_totales']);
        $this->line("  {$g['nombre']} ({$g['rango']}): ".($top->isEmpty() ? 'nadie con puntos' : $top->map(fn ($j) => "{$j->nombre} {$j->puntos_totales}")->join(' · ')));
    }

    $this->newLine();
    $this->info('Últimas 10 partidas:');
    $partidas = Partida::with('jugador:id,nombre,grupo,evento_id')->latest()->limit(10)->get();
    if ($partidas->isEmpty()) {
        $this->line('  Todavía no hay partidas en esta base de datos.');
    } else {
        $this->table(['Jugador', 'Grupo', 'Juego', 'Estado', 'Puntos', '¿Sumó?', 'Hora'], $partidas->map(fn (Partida $p) => [
            $p->jugador->nombre,
            $grupos[$p->jugador->grupo]['nombre'],
            config("reto.juegos.{$p->juego}.nombre", $p->juego),
            match ($p->estado) {
                'terminada' => 'terminada',
                'expirada' => 'expirada (no se cerró a tiempo)',
                default => $p->vencida() ? 'abandonada' : 'en curso',
            },
            $p->puntos,
            $p->estado !== 'terminada' ? 'no' : ($p->cuenta_puntos ? 'sí' : 'no (práctica)'),
            $p->created_at->format('d/m H:i'),
        ]));
    }

    return 0;
})->purpose('Muestra el evento activo, el ranking de la portada y las últimas partidas, para revisar por qué alguien no aparece');
