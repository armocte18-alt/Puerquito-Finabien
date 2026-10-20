<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eventos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 150);
            $table->string('sede', 150)->nullable();
            $table->date('fecha_inicio')->nullable();
            $table->date('fecha_fin')->nullable();
            $table->boolean('activo')->default(false)->index();
            $table->timestamps();
        });

        Schema::create('jugadores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('evento_id')->nullable()->constrained('eventos')->nullOnDelete();
            $table->string('codigo', 8)->unique();
            $table->string('nombre', 40);
            $table->unsignedTinyInteger('edad');
            $table->enum('grupo', ['ninos', 'jovenes', 'adultos'])->index();
            $table->string('avatar', 20);
            $table->unsignedInteger('puntos')->default(0)->comment('Saldo disponible para canjear');
            $table->unsignedInteger('puntos_totales')->default(0)->comment('Puntos ganados históricos (ranking)');
            $table->timestamps();

            $table->index(['evento_id', 'grupo', 'puntos_totales']);
        });

        Schema::create('preguntas', function (Blueprint $table) {
            $table->id();
            $table->enum('grupo', ['ninos', 'jovenes', 'adultos'])->index();
            $table->string('tema', 40)->default('educacion')->comment('educacion | finabien');
            $table->string('enunciado', 300);
            $table->json('opciones');
            $table->unsignedTinyInteger('correcta')->comment('Índice (0-based) dentro de opciones');
            $table->string('explicacion', 400)->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        Schema::create('tarjetas', function (Blueprint $table) {
            $table->id();
            $table->enum('grupo', ['ninos', 'jovenes', 'adultos'])->index();
            $table->string('texto', 120);
            $table->string('icono', 16)->nullable();
            $table->enum('categoria', ['a', 'b'])->comment('a = necesidad / buena decisión; b = deseo / riesgo');
            $table->string('explicacion', 300)->nullable();
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        Schema::create('pares', function (Blueprint $table) {
            $table->id();
            $table->enum('grupo', ['ninos', 'jovenes', 'adultos'])->index();
            $table->string('termino', 60);
            $table->string('definicion', 120);
            $table->string('icono', 16)->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        Schema::create('partidas', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('jugador_id')->constrained('jugadores')->cascadeOnDelete();
            $table->enum('juego', ['trivia', 'clasifica', 'memorama']);
            $table->enum('estado', ['en_curso', 'terminada', 'expirada'])->default('en_curso');
            $table->json('items')->comment('IDs servidos, en orden');
            $table->json('detalle')->nullable()->comment('Respuestas por item');
            $table->unsignedSmallInteger('aciertos')->default(0);
            $table->unsignedSmallInteger('errores')->default(0);
            $table->unsignedInteger('puntos')->default(0);
            $table->boolean('cuenta_puntos')->default(true);
            $table->timestamp('terminada_at')->nullable();
            $table->timestamps();

            $table->index(['jugador_id', 'juego', 'estado']);
        });

        Schema::create('premios', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80);
            $table->string('descripcion', 160)->nullable();
            $table->string('icono', 16)->nullable();
            $table->unsignedInteger('costo');
            $table->unsignedInteger('stock')->nullable()->comment('NULL = sin límite');
            $table->boolean('activo')->default(true);
            $table->unsignedSmallInteger('orden')->default(0);
            $table->timestamps();
        });

        Schema::create('canjes', function (Blueprint $table) {
            $table->id();
            $table->string('folio', 12)->unique();
            $table->foreignId('jugador_id')->constrained('jugadores')->cascadeOnDelete();
            $table->foreignId('premio_id')->constrained('premios')->restrictOnDelete();
            $table->unsignedInteger('costo');
            $table->timestamp('entregado_at')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('canjes');
        Schema::dropIfExists('premios');
        Schema::dropIfExists('partidas');
        Schema::dropIfExists('pares');
        Schema::dropIfExists('tarjetas');
        Schema::dropIfExists('preguntas');
        Schema::dropIfExists('jugadores');
        Schema::dropIfExists('eventos');
    }
};
