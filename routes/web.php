<?php

use App\Http\Controllers\JuegoController;
use App\Http\Controllers\PuntajeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [JuegoController::class, 'inicio'])->name('inicio');
Route::get('/jugar/{grupo}', [JuegoController::class, 'jugar'])->name('jugar');

Route::get('/puntajes/{grupo}', [PuntajeController::class, 'index'])->name('puntajes.index');
Route::post('/puntajes', [PuntajeController::class, 'store'])
    ->middleware('throttle:30,1')
    ->name('puntajes.store');
