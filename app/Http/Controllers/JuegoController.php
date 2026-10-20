<?php

namespace App\Http\Controllers;

use Illuminate\View\View;

class JuegoController extends Controller
{
    /**
     * Pantalla de inicio: elección de rango de edad.
     */
    public function inicio(): View
    {
        return view('juego.inicio', [
            'grupos' => config('juego.grupos'),
        ]);
    }

    /**
     * El juego para un rango de edad.
     */
    public function jugar(string $grupo): View
    {
        abort_unless(array_key_exists($grupo, config('juego.grupos')), 404);

        return view('juego.jugar', [
            'clave' => $grupo,
            'grupo' => config('juego.grupos.'.$grupo),
            'configuracion' => [
                'clave' => $grupo,
                'grupo' => config('juego.grupos.'.$grupo),
                'objetos' => config('juego.objetos'),
                'combo' => config('juego.combo'),
                'rutas' => [
                    'guardar' => route('puntajes.store'),
                    'tabla' => route('puntajes.index', $grupo),
                    'inicio' => route('inicio'),
                ],
                'sprite' => asset('img/alcancia-sprite.png'),
            ],
        ]);
    }
}
