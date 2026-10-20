<?php

namespace Database\Factories;

use App\Models\Puntaje;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Puntaje>
 */
class PuntajeFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nombre' => fake()->firstName(),
            'grupo' => fake()->randomElement(['pequenos', 'exploradores', 'expertos']),
            'puntos' => fake()->numberBetween(0, 50000),
            'monedas' => fake()->numberBetween(0, 60),
            'billetes' => fake()->numberBetween(0, 30),
            'trampas' => fake()->numberBetween(0, 10),
            'ahorro' => fake()->numberBetween(0, 3000),
            'duracion' => 60,
        ];
    }
}
