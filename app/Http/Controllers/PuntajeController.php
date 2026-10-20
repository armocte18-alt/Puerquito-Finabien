<?php

namespace App\Http\Controllers;

use App\Http\Requests\GuardarPuntajeRequest;
use App\Models\Puntaje;
use Illuminate\Http\JsonResponse;

class PuntajeController extends Controller
{
    /**
     * Tabla de los mejores puntajes de un rango de edad.
     */
    public function index(string $grupo): JsonResponse
    {
        abort_unless(array_key_exists($grupo, config('juego.grupos')), 404);

        return response()->json([
            'grupo' => $grupo,
            'puntajes' => $this->tabla($grupo),
        ]);
    }

    /**
     * Guarda el resultado de una partida y devuelve su posición.
     */
    public function store(GuardarPuntajeRequest $request): JsonResponse
    {
        $puntaje = Puntaje::create($request->validated());

        $posicion = Puntaje::where('grupo', $puntaje->grupo)
            ->where(fn ($q) => $q->where('puntos', '>', $puntaje->puntos)
                ->orWhere(fn ($q) => $q->where('puntos', $puntaje->puntos)->where('id', '<', $puntaje->id)))
            ->count() + 1;

        return response()->json([
            'id' => $puntaje->id,
            'posicion' => $posicion,
            'puntajes' => $this->tabla($puntaje->grupo),
        ], 201);
    }

    private function tabla(string $grupo): array
    {
        return Puntaje::mejores($grupo, config('juego.tabla_limite'))
            ->get(['id', 'nombre', 'puntos', 'ahorro', 'created_at'])
            ->map(fn (Puntaje $p) => [
                'id' => $p->id,
                'nombre' => $p->nombre,
                'puntos' => $p->puntos,
                'ahorro' => $p->ahorro,
            ])
            ->all();
    }
}
