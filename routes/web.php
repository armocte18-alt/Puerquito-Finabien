<?php

use App\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

// Kiosco (pantalla de juegos para TV o tablet).
Route::view('/', 'kiosco')->name('kiosco');

// Panel del personal del stand.
Route::prefix('staff')->name('staff.')->controller(StaffController::class)->group(function () {
    Route::get('entrar', 'formEntrar')->name('entrar');
    Route::post('entrar', 'entrar')->middleware('throttle:pin-staff');

    Route::middleware('staff')->group(function () {
        Route::post('salir', 'salir')->name('salir');
        Route::get('/', 'inicio')->name('inicio');
        Route::post('canjes/{canje}/entregar', 'entregar')->name('entregar');

        Route::get('premios', 'premios')->name('premios');
        Route::post('premios', 'guardarPremio')->name('premios.crear');
        Route::put('premios/{premio}', 'guardarPremio')->name('premios.guardar');

        Route::get('preguntas', 'preguntas')->name('preguntas');
        Route::get('preguntas/nueva', 'formPregunta')->name('preguntas.nueva');
        Route::post('preguntas', 'guardarPregunta')->name('preguntas.crear');
        Route::get('preguntas/{pregunta}', 'formPregunta')->name('preguntas.editar');
        Route::put('preguntas/{pregunta}', 'guardarPregunta')->name('preguntas.guardar');
        Route::patch('preguntas/{pregunta}/alternar', 'alternarPregunta')->name('preguntas.alternar');

        Route::get('eventos', 'eventos')->name('eventos');
        Route::post('eventos', 'guardarEvento')->name('eventos.crear');
        Route::post('eventos/{evento}/activar', 'activarEvento')->name('eventos.activar');

        Route::get('exportar/{tipo}', 'exportar')->name('exportar');
    });
});
