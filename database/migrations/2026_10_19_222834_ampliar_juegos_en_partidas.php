<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La columna "juego" deja de ser enum para que agregar un juego nuevo
 * no requiera otra migración; MotorJuegos::JUEGOS valida los valores.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partidas', function (Blueprint $table) {
            $table->string('juego', 20)->change();
        });
    }

    public function down(): void
    {
        Schema::table('partidas', function (Blueprint $table) {
            $table->enum('juego', ['trivia', 'clasifica', 'memorama'])->change();
        });
    }
};
