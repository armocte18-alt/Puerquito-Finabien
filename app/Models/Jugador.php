<?php

namespace App\Models;

use App\Services\MotorJuegos;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Jugador extends Model
{
    protected $table = 'jugadores';

    protected $fillable = ['evento_id', 'codigo', 'nombre', 'edad', 'grupo', 'avatar', 'puntos', 'puntos_totales'];

    // Sin 0/O ni 1/I/L para que el código se dicte y se lea sin errores.
    private const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

    public static function grupoPorEdad(int $edad): string
    {
        foreach (config('reto.grupos') as $clave => $grupo) {
            if ($edad <= $grupo['edad_max']) {
                return $clave;
            }
        }

        return 'adultos';
    }

    public static function nuevoCodigo(): string
    {
        do {
            $codigo = '';
            for ($i = 0; $i < 5; $i++) {
                $codigo .= self::ALFABETO[random_int(0, strlen(self::ALFABETO) - 1)];
            }
        } while (static::where('codigo', $codigo)->exists());

        return $codigo;
    }

    public static function normalizarCodigo(string $codigo): string
    {
        return Str::upper(preg_replace('/[^A-Za-z0-9]/', '', $codigo));
    }

    public function evento(): BelongsTo
    {
        return $this->belongsTo(Evento::class);
    }

    public function partidas(): HasMany
    {
        return $this->hasMany(Partida::class);
    }

    public function canjes(): HasMany
    {
        return $this->hasMany(Canje::class);
    }

    /** Partidas terminadas por juego que ya sumaron puntos. */
    public function jugadasConPuntos(): array
    {
        $conteo = $this->partidas()
            ->where('estado', 'terminada')->where('cuenta_puntos', true)
            ->selectRaw('juego, count(*) as total')->groupBy('juego')
            ->pluck('total', 'juego')->all();

        return array_merge(array_fill_keys(MotorJuegos::JUEGOS, 0), array_map('intval', $conteo));
    }

    public function paraKiosco(): array
    {
        return [
            'codigo' => $this->codigo,
            'nombre' => $this->nombre,
            'edad' => $this->edad,
            'grupo' => $this->grupo,
            'avatar' => $this->avatar,
            'puntos' => $this->puntos,
            'puntos_totales' => $this->puntos_totales,
            'jugadas' => $this->jugadasConPuntos(),
            'canjes' => $this->canjes()->with('premio:id,nombre,icono')->latest('id')->get()
                ->map(fn (Canje $c) => [
                    'folio' => $c->folio,
                    'premio' => $c->premio->nombre,
                    'icono' => $c->premio->icono,
                    'entregado' => $c->entregado_at !== null,
                ])->all(),
        ];
    }
}
