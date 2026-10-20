<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Partida extends Model
{
    use HasUuids;

    protected $table = 'partidas';

    protected $fillable = ['jugador_id', 'juego', 'estado', 'items', 'detalle', 'aciertos', 'errores', 'puntos', 'cuenta_puntos', 'terminada_at'];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'detalle' => 'array',
            'cuenta_puntos' => 'boolean',
            'terminada_at' => 'datetime',
        ];
    }

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function vencida(): bool
    {
        return $this->created_at->lt(now()->subMinutes(config('reto.partida_expira_min')));
    }
}
