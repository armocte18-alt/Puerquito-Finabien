<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Evento extends Model
{
    protected $table = 'eventos';

    protected $fillable = ['nombre', 'sede', 'fecha_inicio', 'fecha_fin', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'fecha_inicio' => 'date', 'fecha_fin' => 'date'];
    }

    public static function activo(): ?self
    {
        return static::where('activo', true)->latest('id')->first();
    }

    public function jugadores(): HasMany
    {
        return $this->hasMany(Jugador::class);
    }
}
