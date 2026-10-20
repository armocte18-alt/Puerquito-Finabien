<?php

use App\Models\Puntaje;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('puntajes:limpiar {grupo? : pequenos, exploradores o expertos (vacío = todos)} {--force : No pedir confirmación}', function (?string $grupo = null) {
    $grupos = array_keys(config('juego.grupos'));

    if ($grupo !== null && ! in_array($grupo, $grupos, true)) {
        $this->error('Rango desconocido. Usa uno de: '.implode(', ', $grupos));

        return 1;
    }

    $consulta = Puntaje::query()->when($grupo, fn ($q) => $q->where('grupo', $grupo));
    $total = $consulta->count();
    $donde = $grupo ? "del rango «{$grupo}»" : 'de todos los rangos';

    if ($total === 0) {
        $this->info("No hay puntajes {$donde}.");

        return 0;
    }

    if (! $this->option('force') && ! $this->confirm("Se borrarán {$total} puntajes {$donde}. ¿Continuar?")) {
        $this->line('Cancelado.');

        return 0;
    }

    $grupo ? $consulta->delete() : Puntaje::truncate();
    $this->info("Listo: se borraron {$total} puntajes {$donde}.");

    return 0;
})->purpose('Borra los puntajes guardados (por ejemplo, los de prueba)');
