<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Premio extends Model
{
    protected $table = 'premios';

    protected $fillable = ['nombre', 'descripcion', 'icono', 'costo', 'stock', 'activo', 'orden'];

    protected function casts(): array
    {
        return ['activo' => 'boolean', 'costo' => 'integer', 'stock' => 'integer'];
    }

    public function disponible(): bool
    {
        return $this->activo && ($this->stock === null || $this->stock > 0);
    }

    public function canjes(): HasMany
    {
        return $this->hasMany(Canje::class);
    }
}
