<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pregunta extends Model
{
    protected $table = 'preguntas';

    protected $fillable = ['grupo', 'tema', 'enunciado', 'opciones', 'correcta', 'explicacion', 'activa'];

    protected function casts(): array
    {
        return ['opciones' => 'array', 'activa' => 'boolean', 'correcta' => 'integer'];
    }
}
