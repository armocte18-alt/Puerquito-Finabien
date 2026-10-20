<?php

/*
|--------------------------------------------------------------------------
| Reto Finabien — reglas del juego
|--------------------------------------------------------------------------
| Todo lo que el equipo del stand puede querer ajustar sin tocar código.
*/

return [

    // PIN numérico para entrar al panel de staff (/staff).
    'staff_pin' => (string) env('STAFF_PIN', '246810'),

    // Cuántas partidas de un mismo juego suman puntos por jugador. Las demás son de práctica.
    'jugadas_con_puntos' => (int) env('RETO_JUGADAS_CON_PUNTOS', 2),

    // Segundos sin actividad antes de que el kiosco regrese a la pantalla de inicio.
    'inactividad_seg' => (int) env('RETO_INACTIVIDAD_SEG', 90),

    // Una partida abierta más de este tiempo ya no acepta respuestas.
    'partida_expira_min' => 10,

    /*
    | Rangos de edad. Edad máxima inclusiva de cada grupo; el último no tiene tope.
    | 10 años o menos → ninos · 11 a 15 → jovenes · 16 o más → adultos
    */
    'grupos' => [
        'ninos' => [
            'nombre' => 'Exploradores',
            'rango' => '10 años o menos',
            'edad_max' => 10,
            'etiquetas_clasifica' => ['a' => 'Lo necesito', 'b' => 'Lo quiero'],
            'titulo_clasifica' => '¿Lo necesito o lo quiero?',
        ],
        'jovenes' => [
            'nombre' => 'Retadores',
            'rango' => '11 a 15 años',
            'edad_max' => 15,
            'etiquetas_clasifica' => ['a' => 'Necesidad', 'b' => 'Deseo'],
            'titulo_clasifica' => '¿Necesidad o deseo?',
        ],
        'adultos' => [
            'nombre' => 'Expertos',
            'rango' => '16 años o más',
            'edad_max' => 200,
            'etiquetas_clasifica' => ['a' => 'Buena decisión', 'b' => 'Riesgo'],
            'titulo_clasifica' => '¿Buena decisión o riesgo?',
        ],
    ],

    'juegos' => [
        'trivia' => [
            'nombre' => 'Trivia Bienestar',
            'preguntas' => ['ninos' => 5, 'jovenes' => 6, 'adultos' => 6],
            'segundos' => ['ninos' => 30, 'jovenes' => 25, 'adultos' => 20],
            'puntos_acierto' => 50,
            'bono_rapidez_max' => 25,
        ],
        'clasifica' => [
            'nombre' => 'Decide rápido',
            'segundos' => ['ninos' => 50, 'jovenes' => 45, 'adultos' => 45],
            'tarjetas' => 12,
            'puntos_acierto' => 20,
        ],
        'memorama' => [
            'nombre' => 'Memorama',
            'pares' => 6,
            'puntos_max' => 300,
            'puntos_min' => ['ninos' => 120, 'jovenes' => 100, 'adultos' => 100],
            'castigo_por_movimiento' => 10,
            'segundos_minimos' => 8, // nadie resuelve 12 cartas más rápido; evita envíos falsos
        ],

        /*
        | Juegos de servicios FINABIEN. Textos, cifras y mensajes de cierre: config/reto_servicios.php.
        | Los arcade (remesa, cosecha, maratón) se generan en el servidor y se recalifican al terminar.
        */
        'remesa' => [
            'nombre' => 'El viaje de la remesa',
            'segundos' => ['ninos' => 35, 'jovenes' => 40, 'adultos' => 40],
            'intervalo_ms' => ['ninos' => 1500, 'jovenes' => 850, 'adultos' => 750], // entre oleadas
            'viaje_ms' => ['ninos' => 5000, 'jovenes' => 3000, 'adultos' => 2700],   // de la orilla a la tarjeta
            'dolares' => 300,
            'puntos_bueno' => 12,
            'castigo_obstaculo' => 15,
            'puntos_min' => 30,
            'puntos_max' => 300,
        ],
        'cosecha' => [
            'nombre' => 'Cosecha tu ahorro',
            'segundos' => 30,
            'segundos_por_anio' => 5,          // 30 s de juego = 6 años de ahorro
            'tasa_anual' => 0.10,              // ilustrativa; se muestra como tal en el cierre
            'intervalo_ms' => ['ninos' => 2400, 'jovenes' => 1400, 'adultos' => 1250],
            'valores' => ['ninos' => [10, 20, 50], 'jovenes' => [20, 50, 100], 'adultos' => [100, 200, 500]],
            'perdida_colchon' => 0.3,          // parte del colchón que se pierde en el imprevisto
            'peso_colchon' => 0.25,            // cuánto vale para los puntos un peso guardado en casa
            'puntos_max' => 300,
        ],
        'emprendedor' => [
            'nombre' => 'Simulador del emprendedor',
            'rondas' => 5,
            'inicio_barras' => 50,
            'puntos_por_punto' => 2,           // puntos = (Δ bienestar + Δ negocio) × 2, máximo por ronda
            'puntos_max_ronda' => 60,
        ],
        'maraton' => [
            'nombre' => 'Maratón de pagos',
            'segundos' => ['ninos' => 40, 'jovenes' => 45, 'adultos' => 45],
            'intervalo_ms' => ['ninos' => 2000, 'jovenes' => 1200, 'adultos' => 1050],
            'caida_ms' => ['ninos' => 9500, 'jovenes' => 6000, 'adultos' => 5400],
            'fraude_pct' => ['ninos' => 12, 'jovenes' => 18, 'adultos' => 22],
            'puntos_pago' => 12,
            'castigo_fraude' => 30,
            'puntos_max' => 300,
        ],

        /*
        | Puerquito Ahorrador: la alcancía atrapa monedas y billetes y esquiva trampas.
        | Objetos, lecciones y consejos: config/reto_servicios.php. Se califica como los arcade:
        | puntos = puntos_max × (lo atrapado, con racha) ÷ (todo el dinero que cayó).
        */
        'puerquito' => [
            'nombre' => 'Puerquito Ahorrador',
            'segundos' => ['ninos' => 45, 'jovenes' => 50, 'adultos' => 55],
            'intervalo_ms' => ['ninos' => 950, 'jovenes' => 720, 'adultos' => 560],
            'caida_ms' => ['ninos' => [4200, 6000], 'jovenes' => [2900, 4300], 'adultos' => [2100, 3300]], // de arriba al piso
            'aceleracion' => ['ninos' => 0.2, 'jovenes' => 0.35, 'adultos' => 0.45], // caen hasta este % más rápido al final
            'trampa_pct' => ['ninos' => 14, 'jovenes' => 24, 'adultos' => 32],
            'poder_pct' => ['ninos' => 6, 'jovenes' => 5, 'adultos' => 4],
            'zigzag_pct' => ['ninos' => 0, 'jovenes' => 15, 'adultos' => 35],
            'escala' => ['ninos' => 1.3, 'jovenes' => 1.1, 'adultos' => 0.95],         // tamaño de los objetos
            'margen_atrape' => ['ninos' => 1.35, 'jovenes' => 1.1, 'adultos' => 1.0],  // ancho de la ranura
            'resaltar_trampas' => ['ninos' => true, 'jovenes' => true, 'adultos' => false],
            'dinero' => [ // probabilidad relativa de cada pieza
                'ninos' => ['m1' => 4, 'm2' => 3, 'm5' => 3, 'm10' => 2, 'b20' => 2, 'b50' => 1],
                'jovenes' => ['m1' => 3, 'm2' => 3, 'm5' => 3, 'm10' => 3, 'b20' => 2, 'b50' => 2, 'b100' => 1, 'b200' => 1],
                'adultos' => ['m1' => 2, 'm2' => 2, 'm5' => 3, 'm10' => 3, 'b20' => 3, 'b50' => 2, 'b100' => 2, 'b200' => 1, 'b500' => 1],
            ],
            'trampas' => [
                'ninos' => ['antojo' => 2, 'hormiga' => 1],
                'jovenes' => ['antojo' => 2, 'hormiga' => 2, 'tarjeta' => 1],
                'adultos' => ['hormiga' => 2, 'tarjeta' => 2, 'anzuelo' => 2, 'falso' => 2],
            ],
            'poderes' => ['estrella' => 1, 'iman' => 1],
            'estrella_seg' => 8,   // puntos ×2
            'iman_seg' => 6,       // atrae el dinero hacia la alcancía
            'racha' => ['cada' => 5, 'incremento' => 0.5, 'maximo' => 2], // multiplicador por atrapadas seguidas
            'puntos_min' => 20,
            'puntos_max' => 300,
        ],
    ],

    // Margen para el reloj y la red al validar que un arcade duró lo que debía.
    'arcade_tolerancia_seg' => 3,
];
