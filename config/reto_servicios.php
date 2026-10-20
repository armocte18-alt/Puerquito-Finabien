<?php

/*
|--------------------------------------------------------------------------
| Reto Finabien — contenido de los juegos arcade y de servicios FINABIEN
|--------------------------------------------------------------------------
| Textos, piezas y mensajes de cierre de El viaje de la remesa, Cosecha tu
| ahorro, Simulador del emprendedor, Maratón de pagos y Puerquito Ahorrador. Las cifras vienen de
| gob.mx/finabien, consulados y notas de prensa (oct. 2026): confírmalas con
| el área responsable antes de cada evento.
|
| Las reglas de puntuación están en config/reto.php.
*/

return [

    'remesa' => [
        // valor: dólares que suma (bueno) o resta (obstáculo) sobre el envío de config('reto.juegos.remesa.dolares').
        'piezas' => [
            'moneda' => ['icono' => '🪙', 'texto' => 'Dólares para tu familia', 'corto' => '+$10', 'bueno' => true, 'valor' => 10],
            'directo' => ['icono' => '⚡', 'texto' => 'Envío directo entre cuentas: llega al instante', 'corto' => '+$15', 'bueno' => true, 'valor' => 15],
            'boveda' => ['icono' => '🏦', 'texto' => 'Bóveda Virtual: tu ahorro gana 10% anual', 'corto' => '10%', 'bueno' => true, 'valor' => 25],
            'efectivo' => ['icono' => '💵', 'texto' => 'Impuesto de 1% a remesas enviadas en efectivo', 'corto' => '−1%', 'bueno' => false, 'valor' => 3],
            'fantasma' => ['icono' => '👻', 'texto' => 'Cargo fantasma de otra remesadora', 'corto' => '−$20', 'bueno' => false, 'valor' => 20],
            'cambio' => ['icono' => '📉', 'texto' => 'Tipo de cambio abusivo', 'corto' => '−$15', 'bueno' => false, 'valor' => 15],
            'fraude' => ['icono' => '🎣', 'texto' => 'Mensaje fraudulento que pide tus datos', 'corto' => '−$40', 'bueno' => false, 'valor' => 40],
        ],
        // Probabilidad relativa de cada pieza al generar la ruta.
        'pesos' => ['moneda' => 6, 'directo' => 2, 'boveda' => 1, 'efectivo' => 3, 'fantasma' => 2, 'cambio' => 2, 'fraude' => 1],
        'cierre' => [
            'titulo' => 'La Tarjeta FINABIEN cuida tu envío',
            'puntos' => [
                'Quienes viven en Estados Unidos la tramitan sin costo en consulados de México o en línea.',
                'Las transferencias entre cuentas llegan de inmediato a la Tarjeta FINABIEN de tu familia.',
                'Enviar desde una cuenta o tarjeta evita el impuesto de 1% que se cobra a las remesas en efectivo.',
                'Con la Bóveda Virtual de la app FINABIEN, el dinero que no usas genera rendimiento.',
            ],
        ],
    ],

    'cosecha' => [
        // Etiquetas de los ingresos que van apareciendo, por grupo de edad.
        'ingresos' => [
            'ninos' => ['Tu domingo', 'Ayudaste en casa', 'Regalo de cumpleaños', 'Vendiste dulces', 'Te dio tu abuela'],
            'jovenes' => ['Tu domingo', 'Vendiste pulseras', 'Cuidaste a tu primo', 'Regalo de cumpleaños', 'Paseaste perros'],
            'adultos' => ['Pago de la quincena', 'Venta de tu negocio', 'Remesa de tu familia', 'Trabajo extra', 'Aguinaldo'],
        ],
        'destinos' => [
            'colchon' => ['icono' => '🛏️', 'nombre' => 'Bajo el colchón', 'ayuda' => 'No crece y se puede perder'],
            'antojo' => ['icono' => '🍭', 'nombre' => 'Antojos', 'ayuda' => 'Se gasta al momento'],
            'ahorro' => ['icono' => '🌱', 'nombre' => 'Ahorro formal', 'ayuda' => 'CetesDirecto en FINABIEN: crece'],
        ],
        'perdida' => '¡Imprevisto en casa! Se perdió parte del dinero que tenías bajo el colchón.',
        'cierre' => [
            'titulo' => 'Tu ahorro florece en una institución formal',
            'puntos' => [
                'En las sucursales FINABIEN puedes ahorrar de forma formal, por ejemplo con una cuenta de CetesDirecto.',
                'FINABIEN tiene más de 1,700 sucursales en todo el país.',
                'El dinero en casa no gana intereses y se puede perder; en un ahorro formal está protegido y crece.',
            ],
            'nota' => 'Simulación ilustrativa con 10% anual; los rendimientos reales cambian con el tiempo.',
        ],
    ],

    'emprendedor' => [
        'negocio' => [
            'ninos' => ['nombre' => 'Tu puesto de aguas frescas', 'icono' => '🍋', 'barras' => ['Tu dinero', 'Tu puesto']],
            'jovenes' => ['nombre' => 'Tu emprendimiento de pulseras', 'icono' => '🧶', 'barras' => ['Bienestar financiero', 'Salud del negocio']],
            'adultos' => ['nombre' => 'Tu tienda de abarrotes', 'icono' => '🏪', 'barras' => ['Bienestar financiero', 'Salud del negocio']],
        ],
        /*
        | Escenarios por grupo. El id debe ser único y estable (las partidas lo guardan).
        | Cada opción: [texto, Δ bienestar financiero, Δ salud del negocio, explicación].
        | Se juegan en orden de id para que la historia avance.
        */
        'escenarios' => [
            'ninos' => [
                101 => ['🍋', 'Para abrir tu puesto necesitas limones y vasos.', [
                    ['Uso dinero de mi alcancía y anoto cuánto gasté', 10, 15, 'Anotar lo que gastas te dice si tu puesto está ganando.'],
                    ['Pido prestado a un amigo y no anoto cuánto', -10, 5, 'Si no anotas, se te olvida cuánto debes y puedes tener problemas.'],
                ]],
                102 => ['☀️', '¡Hizo mucho calor y vendiste todo!', [
                    ['Guardo una parte y con otra compro más limones', 15, 15, 'Guardar y volver a invertir hace crecer tu puesto.'],
                    ['Me lo gasto todo en dulces', -10, -10, 'Si gastas toda la ganancia, mañana no tendrás para comprar limones.'],
                ]],
                103 => ['💵', 'Alguien quiere pagarte con un billete que se ve raro.', [
                    ['Le pido a un adulto que me ayude a revisarlo', 10, 10, 'Los billetes tienen marcas de seguridad. Un adulto te ayuda a revisarlas.'],
                    ['Lo acepto sin revisar', -10, -5, 'Un billete falso no vale nada: perderías tu limonada y tu dinero.'],
                ]],
                104 => ['🧊', 'A media tarde se acaba el hielo.', [
                    ['Con lo que ahorré compro una hielera', 5, 15, 'Usar tu ahorro en algo que ayuda a tu puesto es una buena inversión.'],
                    ['Cierro el puesto y me voy a jugar', 0, -10, 'Cuando hay un problema, buscar una solución mantiene vivo tu negocio.'],
                ]],
                105 => ['🏷️', 'Otro puesto vende más barato que tú.', [
                    ['Ofrezco algo especial: agua con fruta natural', 5, 15, 'Ofrecer algo diferente atrae clientes sin perder dinero.'],
                    ['Bajo tanto el precio que ya no gano nada', -10, -5, 'Si vendes más barato de lo que te cuesta, pierdes dinero.'],
                ]],
                106 => ['🐷', 'Al final del verano te sobró dinero.', [
                    ['Lo guardo en una cuenta de ahorro con mi familia', 15, 5, 'En una institución formal tu dinero está seguro y puede crecer.'],
                    ['Lo escondo debajo del colchón', -5, 0, 'En casa el dinero no crece y se puede perder.'],
                ]],
            ],
            'jovenes' => [
                201 => ['🧵', 'Para empezar necesitas comprar hilo y cuentas.', [
                    ['Hago un presupuesto: cuánto cuesta, cuánto cobro y cuánto gano', 15, 10, 'Un presupuesto te dice si tu idea deja ganancia antes de gastar.'],
                    ['Compro todo lo que me gusta sin hacer cuentas', -10, -5, 'Sin cuentas es fácil gastar más de lo que vas a vender.'],
                ]],
                202 => ['📱', 'Una cuenta en redes promete "duplicar tu dinero" si le depositas $500.', [
                    ['No deposito: si suena demasiado bueno, es fraude', 15, 5, 'Nadie duplica tu dinero en días. Las promesas así son fraudes.'],
                    ['Deposito para crecer más rápido', -20, -10, 'Ese dinero casi nunca regresa. Reporta estas cuentas.'],
                ]],
                203 => ['🎉', 'Te piden 50 pulseras para una fiesta; te pagan al entregar.', [
                    ['Pido un anticipo para comprar el material', 10, 15, 'El anticipo protege tu dinero si el cliente se arrepiente.'],
                    ['Pongo todo de mi bolsa sin anticipo', -10, 5, 'Si no te pagan, pierdes el material y tu tiempo.'],
                ]],
                204 => ['💳', 'Tus clientes quieren pagarte por transferencia.', [
                    ['Abro una cuenta con ayuda de mis papás y separo el dinero del negocio', 10, 15, 'Una cuenta propia te deja ver cuánto vende tu negocio.'],
                    ['Uso la cuenta de un amigo', -10, -5, 'Prestar o usar cuentas ajenas es riesgoso y puede meterte en problemas.'],
                ]],
                205 => ['💸', 'Este mes ganaste $1,000.', [
                    ['Reinvierto una parte, ahorro otra y me doy un gusto pequeño', 15, 15, 'Repartir tu ganancia hace crecer el negocio y tu ahorro.'],
                    ['Me lo gasto todo en un celular nuevo', -15, -10, 'Sin reinvertir ni ahorrar, el negocio se queda sin material.'],
                ]],
                206 => ['📊', 'Un diseño casi no se vende.', [
                    ['Reviso qué se vende más y pruebo otro diseño', 5, 15, 'Medir tus ventas te ayuda a decidir mejor.'],
                    ['Sigo haciendo lo mismo', 0, -10, 'Si no cambias nada, el material se acumula y pierdes dinero.'],
                ]],
            ],
            'adultos' => [
                301 => ['📦', 'Necesitas surtir mercancía para la temporada alta.', [
                    ['Solicito un crédito formal con tasa clara, como los créditos solidarios de FINABIEN', 15, 15, 'Un crédito formal te da por escrito la tasa, el CAT y los plazos.'],
                    ['Pido un préstamo "gota a gota" que cobra 20% a la semana', -20, 5, 'Los préstamos informales cobran intereses abusivos y suelen usar amenazas.'],
                ]],
                302 => ['🧾', 'Al cierre del día juntas el dinero de la tienda con el de la casa.', [
                    ['Separo las cuentas y anoto ingresos y gastos', 10, 15, 'Separar el dinero te dice cuánto gana realmente tu negocio.'],
                    ['Lo dejo junto, total es lo mismo', -10, -10, 'Mezclar el dinero esconde pérdidas hasta que es tarde.'],
                ]],
                303 => ['💳', 'Tus clientes piden pagar con tarjeta o transferencia.', [
                    ['Acepto pagos digitales y recibo el dinero en una cuenta formal', 5, 15, 'Los pagos digitales atraen clientes y te dan historial para un crédito.'],
                    ['Solo efectivo, así no me complico', 0, -10, 'Pierdes ventas y cargar efectivo te expone a robos.'],
                ]],
                304 => ['🏦', 'Este mes te sobraron $3,000.', [
                    ['Los aparto en un ahorro formal para emergencias del negocio', 15, 5, 'Un fondo de emergencia evita endeudarte cuando algo falla.'],
                    ['Los dejo en la caja registradora', -5, 0, 'En la caja no crece y se puede perder o gastar sin darte cuenta.'],
                ]],
                305 => ['🚚', 'Un proveedor te ofrece mercancía a crédito con 30 días para pagar.', [
                    ['Acepto solo lo que puedo vender antes de la fecha de pago', 10, 10, 'Endeudarte por lo que sí vas a vender cuida tu flujo de dinero.'],
                    ['Acepto el triple para no quedarme sin nada', -15, 5, 'Si no vendes a tiempo, la deuda te alcanza.'],
                ]],
                306 => ['🤝', 'Otros comerciantes de tu colonia proponen formar una cooperativa.', [
                    ['Me uno: compramos juntos al mayoreo y bajamos costos', 10, 15, 'Organizarse en cooperativa da mejores precios y acceso a financiamiento productivo.'],
                    ['Prefiero seguir solo aunque compre más caro', 0, -5, 'Comprar al menudeo reduce tu ganancia en cada venta.'],
                ]],
                307 => ['📞', 'Te llaman "del banco" y te piden el NIP para cancelar un cargo.', [
                    ['Cuelgo y llamo yo al número oficial', 15, 5, 'Ninguna institución te pide tu NIP. Llama siempre al número oficial.'],
                    ['Doy el NIP para resolverlo rápido', -20, -10, 'Con tu NIP pueden vaciar tu cuenta y la de tu negocio.'],
                ]],
            ],
        ],
        'cierre' => [
            'titulo' => 'FINABIEN impulsa a quienes emprenden',
            'puntos' => [
                'FINABIEN ha otorgado créditos solidarios a personas emprendedoras; el dinero se deposita en la Tarjeta FINABIEN.',
                'Un crédito formal te dice por escrito la tasa, el CAT y los plazos. Compara antes de firmar.',
                'Separar el dinero del negocio y ahorrar para emergencias te protege de las deudas caras.',
            ],
        ],
    ],

    'maraton' => [
        // Recibos legítimos: el monto se elige al azar dentro del rango.
        'recibos' => [
            'luz' => ['icono' => '💡', 'texto' => 'Luz', 'monto' => [180, 950]],
            'agua' => ['icono' => '💧', 'texto' => 'Agua', 'monto' => [90, 420]],
            'telefono' => ['icono' => '☎️', 'texto' => 'Teléfono', 'monto' => [289, 499]],
            'internet' => ['icono' => '📡', 'texto' => 'Internet y TV', 'monto' => [349, 799]],
            'tiempo_aire' => ['icono' => '📱', 'texto' => 'Recarga de tiempo aire', 'monto' => [50, 200]],
            'fonacot' => ['icono' => '🧾', 'texto' => 'Crédito FONACOT', 'monto' => [600, 1800], 'grupos' => ['jovenes', 'adultos']],
            'tarjeta' => ['icono' => '💳', 'texto' => 'Pago de tarjeta de crédito', 'monto' => [500, 2500], 'grupos' => ['jovenes', 'adultos']],
        ],
        // Cobros falsos: no se pagan.
        'fraudes' => [
            'premio' => ['icono' => '🎁', 'texto' => '¡Ganaste un premio! Paga para cobrarlo', 'monto' => [300, 900]],
            'prestamo' => ['icono' => '🚩', 'texto' => 'Deposita para liberar tu préstamo', 'monto' => [500, 1500], 'grupos' => ['jovenes', 'adultos']],
            'multa' => ['icono' => '⚠️', 'texto' => 'Mensaje: paga hoy o te cortamos todo', 'monto' => [700, 2000], 'grupos' => ['jovenes', 'adultos']],
        ],
        'cierre' => [
            'titulo' => 'En FINABIEN pagas todo en un solo lugar',
            'puntos' => [
                'Las sucursales FINABIEN funcionan como corresponsal bancario: ahí haces operaciones de más de 10 bancos.',
                'Puedes pagar servicios, tarjetas y créditos, como FONACOT, con tu referencia de pago.',
                'Si te piden pagar para recibir un premio o un préstamo, es fraude. No pagues y repórtalo.',
            ],
        ],
    ],

    'puerquito' => [
        // Dinero: valor en pesos (lo que "ahorra" la alcancía) y puntos base de cada pieza.
        'dinero' => [
            'm1' => ['texto' => '$1', 'valor' => 1, 'puntos' => 2],
            'm2' => ['texto' => '$2', 'valor' => 2, 'puntos' => 3],
            'm5' => ['texto' => '$5', 'valor' => 5, 'puntos' => 5],
            'm10' => ['texto' => '$10', 'valor' => 10, 'puntos' => 8],
            'b20' => ['texto' => '$20', 'valor' => 20, 'puntos' => 10],
            'b50' => ['texto' => '$50', 'valor' => 50, 'puntos' => 14],
            'b100' => ['texto' => '$100', 'valor' => 100, 'puntos' => 18],
            'b200' => ['texto' => '$200', 'valor' => 200, 'puntos' => 22],
            'b500' => ['texto' => '$500', 'valor' => 500, 'puntos' => 28],
        ],
        // Trampas: restan puntos, cortan la racha y la primera vez muestran su lección.
        'trampas' => [
            'antojo' => ['texto' => '¡Antojo!', 'puntos' => -10, 'leccion' => 'Antes de comprar, pregúntate: ¿lo necesito o lo quiero?'],
            'hormiga' => ['texto' => '¡Gasto hormiga!', 'puntos' => -15, 'leccion' => 'Los gastos pequeños de todos los días suman mucho dinero.'],
            'tarjeta' => ['texto' => '¡Deuda!', 'puntos' => -25, 'leccion' => 'Usa el crédito con responsabilidad y paga a tiempo.'],
            'anzuelo' => ['texto' => '¡Fraude!', 'puntos' => -40, 'leccion' => 'Nunca compartas tu NIP ni tus claves por teléfono o mensaje.'],
            'falso' => ['texto' => '¡Billete falso!', 'puntos' => -30, 'leccion' => 'Revisa los elementos de seguridad de tus billetes.'],
        ],
        'poderes' => [
            'estrella' => ['texto' => '¡Puntos ×2!'],
            'iman' => ['texto' => '¡Imán de ahorro!'],
        ],
        // Se muestran al final, como la tarjeta "Así te ayuda FINABIEN" de los demás arcade.
        'cierre' => [
            'ninos' => [
                'titulo' => 'Tu alcancía crece poquito a poquito',
                'puntos' => [
                    'Guardar un poquito cada día hace que tu alcancía crezca.',
                    'Ahorrar es guardar hoy para algo que quieres mañana.',
                    'Antes de comprar un dulce, piensa si prefieres ahorrar para un juguete.',
                ],
            ],
            'jovenes' => [
                'titulo' => 'Ahorra con un plan',
                'puntos' => [
                    'Separa tu dinero en tres partes: gastar, ahorrar y compartir.',
                    'Ponte una meta de ahorro y anota cuánto te falta para lograrla.',
                    'Un gasto hormiga de $15 al día son más de $5,000 al año.',
                ],
            ],
            'adultos' => [
                'titulo' => 'Tu ahorro, mejor en una institución formal',
                'puntos' => [
                    'Ten un fondo de emergencia equivalente a 3 a 6 meses de tus gastos.',
                    'Ahorra primero y gasta después: aparta tu ahorro en cuanto recibas tu ingreso.',
                    'En las sucursales FINABIEN puedes ahorrar de forma formal y segura.',
                ],
            ],
        ],
    ],
];
