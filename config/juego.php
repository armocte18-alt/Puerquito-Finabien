<?php

/*
|--------------------------------------------------------------------------
| Puerquito Finabien – configuración del juego
|--------------------------------------------------------------------------
|
| Todo el balance del juego vive aquí: el catálogo de objetos que caen y
| los parámetros de cada rango de edad. El front-end recibe este arreglo
| como JSON, así que ajustar la dificultad no requiere tocar JavaScript.
|
| Las velocidades están en píxeles por segundo sobre un lienzo lógico de
| 1920×1080; el juego escala a cualquier resolución (PC, TV o proyector).
|
*/

return [

    'objetos' => [
        // Dinero: suma puntos y alimenta el combo.
        'm1' => ['tipo' => 'moneda', 'valor' => 1, 'puntos' => 10, 'etiqueta' => '$1'],
        'm2' => ['tipo' => 'moneda', 'valor' => 2, 'puntos' => 20, 'etiqueta' => '$2'],
        'm5' => ['tipo' => 'moneda', 'valor' => 5, 'puntos' => 50, 'etiqueta' => '$5'],
        'm10' => ['tipo' => 'moneda', 'valor' => 10, 'puntos' => 100, 'etiqueta' => '$10'],
        'b20' => ['tipo' => 'billete', 'valor' => 20, 'puntos' => 200, 'etiqueta' => '$20'],
        'b50' => ['tipo' => 'billete', 'valor' => 50, 'puntos' => 500, 'etiqueta' => '$50'],
        'b100' => ['tipo' => 'billete', 'valor' => 100, 'puntos' => 1000, 'etiqueta' => '$100'],
        'b200' => ['tipo' => 'billete', 'valor' => 200, 'puntos' => 2000, 'etiqueta' => '$200'],
        'b500' => ['tipo' => 'billete', 'valor' => 500, 'puntos' => 5000, 'etiqueta' => '$500'],

        // Trampas: restan puntos, rompen el combo y (si el rango tiene vidas) quitan una.
        'antojo' => ['tipo' => 'trampa', 'puntos' => -100, 'etiqueta' => '¡Antojo!', 'leccion' => 'Antes de comprar, pregúntate: ¿lo necesito o lo quiero?'],
        'hormiga' => ['tipo' => 'trampa', 'puntos' => -150, 'etiqueta' => '¡Gasto hormiga!', 'leccion' => 'Los gastos pequeños de todos los días suman mucho dinero.'],
        'tarjeta' => ['tipo' => 'trampa', 'puntos' => -500, 'etiqueta' => '¡Deuda!', 'leccion' => 'Usa el crédito con responsabilidad y paga a tiempo.'],
        'anzuelo' => ['tipo' => 'trampa', 'puntos' => -1000, 'etiqueta' => '¡Fraude!', 'leccion' => 'Nunca compartas tu NIP ni tus claves por teléfono o mensaje.'],
        'falso' => ['tipo' => 'trampa', 'puntos' => -800, 'etiqueta' => '¡Billete falso!', 'leccion' => 'Revisa los elementos de seguridad de tus billetes.'],

        // Potenciadores.
        'estrella' => ['tipo' => 'poder', 'etiqueta' => '¡Puntos ×2!', 'duracion' => 8],
        'iman' => ['tipo' => 'poder', 'etiqueta' => '¡Imán de ahorro!', 'duracion' => 6],
        'corazon' => ['tipo' => 'poder', 'etiqueta' => '¡Vida extra!'],
    ],

    'grupos' => [

        'pequenos' => [
            'nombre' => 'Pequeños Ahorradores',
            'rango' => 'Hasta 8 años',
            'emoji' => '🐣',
            'color' => '#f2b134',
            'descripcion' => 'Caídas lentas, objetos grandes y sin vidas que perder. ¡Solo diviértete ahorrando!',
            'duracion' => 60,
            'vidas' => null,
            'velocidad' => [150, 230],
            'aceleracion' => 0.25,
            'intervalo' => 0.95,
            'probabilidad_trampa' => 0.14,
            'probabilidad_poder' => 0.06,
            'escala' => 1.35,
            'zigzag' => 0,
            'margen_atrape' => 1.35,
            'resaltar_trampas' => true,
            'velocidad_alcancia' => 1100,
            'dinero' => ['m1' => 4, 'm2' => 3, 'm5' => 3, 'm10' => 2, 'b20' => 2, 'b50' => 1],
            'trampas' => ['antojo' => 2, 'hormiga' => 1],
            'poderes' => ['estrella' => 1, 'iman' => 2],
            'consejos' => [
                'Guardar un poquito cada día hace que tu alcancía crezca.',
                'Ahorrar es guardar hoy para algo que quieres mañana.',
                'Antes de comprar un dulce, piensa si prefieres ahorrar para un juguete.',
                'Contar tus monedas te ayuda a saber cuánto has ahorrado.',
            ],
        ],

        'exploradores' => [
            'nombre' => 'Exploradores del Ahorro',
            'rango' => 'De 9 a 15 años',
            'emoji' => '🚀',
            'color' => '#2fa37a',
            'descripcion' => 'Más velocidad, 3 vidas y combos. Cuidado con los antojos y las deudas.',
            'duracion' => 75,
            'vidas' => 3,
            'velocidad' => [230, 370],
            'aceleracion' => 0.4,
            'intervalo' => 0.72,
            'probabilidad_trampa' => 0.24,
            'probabilidad_poder' => 0.05,
            'escala' => 1.1,
            'zigzag' => 0.15,
            'margen_atrape' => 1.1,
            'resaltar_trampas' => true,
            'velocidad_alcancia' => 1300,
            'dinero' => ['m1' => 3, 'm2' => 3, 'm5' => 3, 'm10' => 3, 'b20' => 2, 'b50' => 2, 'b100' => 1, 'b200' => 1],
            'trampas' => ['antojo' => 2, 'hormiga' => 2, 'tarjeta' => 1],
            'poderes' => ['estrella' => 2, 'iman' => 2, 'corazon' => 1],
            'consejos' => [
                'Separa tu dinero en tres partes: gastar, ahorrar y compartir.',
                'Ponte una meta de ahorro y anota cuánto te falta para lograrla.',
                'Un gasto hormiga de $15 al día son más de $5,000 al año.',
                'Compara precios antes de comprar: el ahorro también está en gastar bien.',
            ],
        ],

        'expertos' => [
            'nombre' => 'Expertos Financieros',
            'rango' => 'De 16 años en adelante',
            'emoji' => '🏆',
            'color' => '#1d5c3f',
            'descripcion' => 'Velocidad alta, zigzag, fraudes y billetes falsos. Solo para manos rápidas.',
            'duracion' => 90,
            'vidas' => 3,
            'velocidad' => [320, 540],
            'aceleracion' => 0.55,
            'intervalo' => 0.55,
            'probabilidad_trampa' => 0.32,
            'probabilidad_poder' => 0.04,
            'escala' => 0.95,
            'zigzag' => 0.35,
            'margen_atrape' => 1.0,
            'resaltar_trampas' => false,
            'velocidad_alcancia' => 1500,
            'dinero' => ['m1' => 2, 'm2' => 2, 'm5' => 3, 'm10' => 3, 'b20' => 3, 'b50' => 2, 'b100' => 2, 'b200' => 1, 'b500' => 1],
            'trampas' => ['hormiga' => 2, 'tarjeta' => 2, 'anzuelo' => 2, 'falso' => 2],
            'poderes' => ['estrella' => 2, 'iman' => 1, 'corazon' => 1],
            'consejos' => [
                'Ten un fondo de emergencia equivalente a 3 a 6 meses de tus gastos.',
                'Ninguna institución te pedirá tu NIP o contraseña por teléfono, correo o mensaje.',
                'Ahorra primero y gasta después: aparta tu ahorro en cuanto recibas tu ingreso.',
                'Compara el Costo Anual Total (CAT) antes de contratar un crédito.',
            ],
        ],
    ],

    // Combo: cada N atrapadas seguidas de dinero sube el multiplicador.
    'combo' => ['cada' => 5, 'incremento' => 0.5, 'maximo' => 3],

    // Tope de seguridad para rechazar puntajes imposibles en el servidor.
    'puntos_maximos_por_segundo' => 20000,

    'tabla_limite' => 10,
];
