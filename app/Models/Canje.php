<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Canje extends Model
{
    protected $table = 'canjes';

    protected $fillable = ['folio', 'jugador_id', 'premio_id', 'costo', 'entregado_at'];

    protected function casts(): array
    {
        return ['entregado_at' => 'datetime'];
    }

    public function jugador(): BelongsTo
    {
        return $this->belongsTo(Jugador::class);
    }

    public function premio(): BelongsTo
    {
        return $this->belongsTo(Premio::class);
    }
}
