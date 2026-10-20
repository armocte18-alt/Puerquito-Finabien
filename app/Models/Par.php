<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Par extends Model
{
    protected $table = 'pares';

    protected $fillable = ['grupo', 'termino', 'definicion', 'icono', 'activo'];

    protected function casts(): array
    {
        return ['activo' => 'boolean'];
    }
}
