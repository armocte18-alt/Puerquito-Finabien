<?php

use App\Http\Controllers\Api\KioscoController;
use Illuminate\Support\Facades\Route;

// API del kiosco: sin sesión ni CSRF para que una pantalla encendida todo el día nunca caduque.
Route::middleware('throttle:kiosco')->controller(KioscoController::class)->group(function () {
    Route::get('configuracion', 'configuracion');
    Route::get('ranking', 'ranking');
    Route::post('jugadores', 'registrar')->middleware('throttle:registro');
    Route::get('jugadores/{codigo}', 'jugador')->middleware('throttle:codigo');
    Route::post('jugadores/{codigo}/partidas', 'iniciarPartida');
    Route::post('jugadores/{codigo}/canjes', 'canjear');
    Route::post('partidas/{partida}/respuestas', 'responder');
    Route::post('partidas/{partida}/terminar', 'terminar');
});
