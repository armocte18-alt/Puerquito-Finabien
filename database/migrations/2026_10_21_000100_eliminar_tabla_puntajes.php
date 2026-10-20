<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * El Puerquito Ahorrador ahora es un juego del kiosco y guarda sus partidas en "partidas"
 * como los demás. La tabla de su versión independiente ya no se usa.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('puntajes');
    }

    public function down(): void
    {
        Schema::create('puntajes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 20);
            $table->string('grupo', 20);
            $table->unsignedInteger('puntos');
            $table->unsignedSmallInteger('monedas')->default(0);
            $table->unsignedSmallInteger('billetes')->default(0);
            $table->unsignedSmallInteger('trampas')->default(0);
            $table->unsignedInteger('ahorro')->default(0);
            $table->unsignedSmallInteger('duracion');
            $table->timestamps();

            $table->index(['grupo', 'puntos']);
        });
    }
};
