<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Puntaje extends Model
{
    /** @use HasFactory<\Database\Factories\PuntajeFactory> */
    use HasFactory;

    protected $table = 'puntajes';

    protected $fillable = [
        'nombre',
        'grupo',
        'puntos',
        'monedas',
        'billetes',
        'trampas',
        'ahorro',
        'duracion',
    ];

    protected function casts(): array
    {
        return [
            'puntos' => 'integer',
            'monedas' => 'integer',
            'billetes' => 'integer',
            'trampas' => 'integer',
            'ahorro' => 'integer',
            'duracion' => 'integer',
        ];
    }

    /**
     * Mejores puntajes de un rango de edad.
     */
    public function scopeMejores(Builder $query, string $grupo, int $limite): Builder
    {
        return $query->where('grupo', $grupo)
            ->orderByDesc('puntos')
            ->orderBy('created_at')
            ->limit($limite);
    }
}
