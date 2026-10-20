<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarjeta extends Model
{
    protected $table = 'tarjetas';

    protected $fillable = ['grupo', 'texto', 'icono', 'categoria', 'explicacion', 'activa'];

    protected function casts(): array
    {
        return ['activa' => 'boolean'];
    }
}
