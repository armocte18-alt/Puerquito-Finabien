<?php

namespace Database\Seeders;

use App\Models\Evento;
use App\Models\Premio;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(ContenidoSeeder::class);

        if (! Evento::exists()) {
            Evento::create(['nombre' => 'Feria de Educación Financiera', 'sede' => 'Stand FINABIEN', 'activo' => true]);
        }

        // Catálogo de ejemplo: ajusta costos y existencias en /staff/premios antes del evento.
        $premios = [
            ['icono' => '⭐', 'nombre' => 'Hoja de stickers', 'descripcion' => 'Calcomanías de ahorro', 'costo' => 150, 'stock' => 300],
            ['icono' => '✏️', 'nombre' => 'Lápiz o pluma', 'descripcion' => 'Para anotar tus metas', 'costo' => 250, 'stock' => 200],
            ['icono' => '🐷', 'nombre' => 'Alcancía', 'descripcion' => 'Empieza a ahorrar hoy', 'costo' => 450, 'stock' => 100],
            ['icono' => '🥤', 'nombre' => 'Termo', 'descripcion' => 'Termo conmemorativo', 'costo' => 700, 'stock' => 50],
            ['icono' => '🎒', 'nombre' => 'Mochila', 'descripcion' => 'Premio mayor', 'costo' => 1000, 'stock' => 20],
        ];

        foreach ($premios as $i => $premio) {
            Premio::firstOrCreate(['nombre' => $premio['nombre']], $premio + ['orden' => $i, 'activo' => true]);
        }
    }
}
