<?php

namespace Database\Seeders;

use App\Models\Par;
use App\Models\Pregunta;
use App\Models\Tarjeta;
use Illuminate\Database\Seeder;

/**
 * Banco inicial de contenido. Se edita después desde /staff/preguntas.
 *
 * Formato de trivia: la PRIMERA opción es la correcta; el servidor las
 * revuelve en cada partida. Las preguntas con tema "finabien" usan datos
 * públicos de gob.mx/finabien y notas de prensa (oct. 2026): revisa cifras
 * y tarifas con el área responsable antes de cada evento.
 */
class ContenidoSeeder extends Seeder
{
    public function run(): void
    {
        foreach ($this->preguntas() as $grupo => $preguntas) {
            foreach ($preguntas as [$tema, $enunciado, $opciones, $explicacion]) {
                Pregunta::updateOrCreate(
                    ['grupo' => $grupo, 'enunciado' => $enunciado],
                    ['tema' => $tema, 'opciones' => $opciones, 'correcta' => 0, 'explicacion' => $explicacion, 'activa' => true],
                );
            }
        }

        foreach ($this->tarjetas() as $grupo => $tarjetas) {
            foreach ($tarjetas as [$icono, $texto, $categoria, $explicacion]) {
                Tarjeta::updateOrCreate(
                    ['grupo' => $grupo, 'texto' => $texto],
                    ['icono' => $icono, 'categoria' => $categoria, 'explicacion' => $explicacion, 'activa' => true],
                );
            }
        }

        foreach ($this->pares() as $grupo => $pares) {
            foreach ($pares as [$icono, $termino, $definicion]) {
                Par::updateOrCreate(
                    ['grupo' => $grupo, 'termino' => $termino],
                    ['icono' => $icono, 'definicion' => $definicion, 'activo' => true],
                );
            }
        }
    }

    private function preguntas(): array
    {
        return [
            // 10 años o menos: 3 opciones, lenguaje concreto, situaciones cotidianas.
            'ninos' => [
                ['educacion', '¿Para qué sirve una alcancía?', ['Para guardar dinero y usarlo después', 'Para gastar todo hoy', 'Para tirar las monedas'], 'Una alcancía te ayuda a juntar dinero poco a poco para algo que quieres.'],
                ['educacion', 'Quieres un juguete de $100 y ahorras $20 cada semana. ¿Cuántas semanas necesitas?', ['5 semanas', '2 semanas', '10 semanas'], '20 + 20 + 20 + 20 + 20 = 100. ¡En 5 semanas lo logras!'],
                ['educacion', '¿Qué es una necesidad?', ['Algo que necesitas para vivir, como la comida', 'Un videojuego nuevo', 'Un juguete de moda'], 'Las necesidades son lo que nos hace falta para vivir bien: comida, agua, casa, ropa y escuela.'],
                ['educacion', '¿Qué significa ahorrar?', ['Guardar una parte de tu dinero', 'Gastar todo tu dinero', 'Pedir dinero prestado'], 'Ahorrar es guardar una parte hoy para tenerla mañana.'],
                ['educacion', 'Te regalan $50. ¿Qué es mejor hacer?', ['Guardar una parte y gastar otra', 'Gastarlo todo en dulces', 'Esconderlo y olvidarlo'], 'Si guardas un poco cada vez que recibes dinero, tu ahorro crece.'],
                ['educacion', '¿Cuál es la moneda de México?', ['El peso', 'El dólar', 'El euro'], 'En México usamos pesos. Su símbolo es $.'],
                ['educacion', '¿Qué es una meta de ahorro?', ['Algo que quieres lograr juntando dinero poco a poco', 'Una portería de futbol', 'Gastar todo en un día'], 'Ponerle nombre a tu meta, por ejemplo "bicicleta", te ayuda a no rendirte.'],
                ['educacion', 'Antes de comprar algo, ¿qué conviene hacer?', ['Comparar precios', 'Comprar lo primero que veas', 'Comprar dos de cada cosa'], 'Comparar precios en varios lugares te ayuda a gastar menos.'],
                ['educacion', '¿De dónde viene el dinero de una familia?', ['Del trabajo de las personas', 'De los árboles', 'De la alcancía mágica'], 'Las personas trabajan para ganar dinero y cubrir lo que su familia necesita.'],
                ['finabien', 'FINABIEN es...', ['Una institución financiera del Gobierno de México', 'Una tienda de juguetes', 'Un equipo de futbol'], 'FINABIEN significa Financiera para el Bienestar.'],
                ['finabien', '¿Qué es una remesa?', ['Dinero que manda un familiar que trabaja en otro país', 'Un dulce típico', 'Una moneda antigua'], 'Muchas familias reciben remesas de familiares que trabajan en Estados Unidos.'],
                ['finabien', '¿Dónde puede tu familia cobrar el dinero que le mandan desde otro país?', ['En una sucursal de FINABIEN', 'En el parque', 'En la papelería'], 'FINABIEN tiene sucursales en todo México para enviar y cobrar dinero.'],
            ],

            // 11 a 15 años: 4 opciones, conceptos básicos y seguridad digital.
            'jovenes' => [
                ['educacion', '¿Qué es un presupuesto?', ['Un plan de cuánto vas a recibir, gastar y ahorrar', 'Una lista de deudas', 'Un tipo de tarjeta', 'Un impuesto'], 'Con un presupuesto decides a dónde va tu dinero antes de gastarlo.'],
                ['educacion', 'Si ahorras $50 cada semana, ¿cuánto juntas en un año?', ['$2,600', '$500', '$1,200', '$5,200'], 'Un año tiene 52 semanas: 52 × 50 = $2,600.'],
                ['educacion', '¿Qué es el interés?', ['Lo que pagas por usar dinero prestado, o lo que ganas por ahorrar', 'Una comisión del cajero', 'Un descuento en la tienda', 'Un tipo de billete'], 'Si pides prestado, pagas interés; si ahorras o inviertes, puedes ganarlo.'],
                ['educacion', '¿Cuál es la diferencia entre tarjeta de débito y de crédito?', ['Con la de débito usas tu propio dinero; con la de crédito, dinero prestado', 'Son exactamente iguales', 'La de débito siempre cobra intereses', 'La de crédito solo sirve en el extranjero'], 'Con una tarjeta de crédito el banco te presta y debes pagar después.'],
                ['educacion', '¿Qué es la inflación?', ['Cuando los precios suben y tu dinero alcanza para menos', 'Cuando los precios bajan', 'Un aumento de tu domingo', 'Un tipo de ahorro'], 'Por la inflación, lo que hoy cuesta $100 puede costar más el próximo año.'],
                ['educacion', 'Alguien por redes sociales te pide el NIP de la tarjeta de tus papás para darte un premio. ¿Qué haces?', ['No lo comparto y aviso a un adulto', 'Se lo mando rápido', 'Lo comparto solo con amigos', 'Lo publico en mis historias'], 'Tu NIP y tus contraseñas son secretos. Nadie de confianza te los pedirá.'],
                ['educacion', '¿Qué es un fondo de emergencia?', ['Dinero guardado para imprevistos', 'Dinero para vacaciones', 'Un préstamo del banco', 'Saldo para videojuegos'], 'Sirve para gastos inesperados, como reparar algo o una consulta médica.'],
                ['educacion', 'Ahorras $1,000 con 10% de interés al año. ¿Cuánto tendrás en un año?', ['$1,100', '$1,010', '$2,000', '$1,000'], 'El 10% de $1,000 son $100, así que tendrás $1,100.'],
                ['educacion', '¿Qué institución te ayuda si tienes un problema con un banco o financiera?', ['CONDUSEF', 'SEP', 'INE', 'IMSS'], 'La CONDUSEF orienta y defiende a las personas usuarias de servicios financieros.'],
                ['educacion', '¿Cuál es un deseo y no una necesidad?', ['Tenis de edición limitada cuando los tuyos están bien', 'Útiles escolares', 'Comida', 'Pasaje para ir a la escuela'], 'Los deseos se valen, pero conviene planearlos después de cubrir lo necesario.'],
                ['finabien', '¿Cómo se llamaba antes la institución que hoy es FINABIEN?', ['Telecomm', 'Banxico', 'CONDUSEF', 'SAT'], 'Telecomunicaciones de México (Telecomm) se transformó en Financiera para el Bienestar.'],
                ['finabien', '¿Para qué sirve principalmente la Tarjeta Finabien?', ['Para enviar dinero de Estados Unidos a México', 'Para entrar al metro', 'Para juntar puntos en el cine', 'Para pagar la escuela'], 'Con ella, las personas mexicanas en Estados Unidos envían remesas a sus familias.'],
                ['finabien', '¿Cuál de estos servicios ofrece FINABIEN?', ['Envío y cobro de remesas', 'Venta de autos', 'Seguros para mascotas', 'Boletos de avión'], 'También ofrece pago de servicios, retiros y opciones de ahorro.'],
            ],

            // 16 años o más: 4 opciones, crédito, ahorro formal, fraudes y FINABIEN.
            'adultos' => [
                ['finabien', '¿Qué es FINABIEN?', ['Financiera para el Bienestar, institución financiera del Gobierno de México', 'Un banco privado', 'Una aplicación de pagos extranjera', 'Una casa de empeño'], 'FINABIEN acerca servicios financieros a comunidades de todo el país.'],
                ['finabien', 'FINABIEN surgió de la transformación de...', ['Telecomm (Telecomunicaciones de México)', 'Nacional Financiera', 'El SAT', 'La Casa de Moneda'], 'La red de sucursales de Telecomm hoy opera como Financiera para el Bienestar.'],
                ['finabien', '¿Dónde puede tramitar la Tarjeta Finabien una persona que vive en Estados Unidos?', ['En consulados de México o en línea', 'Solo en sucursales dentro de México', 'En cualquier supermercado', 'Únicamente por teléfono'], 'Se tramita sin costo en consulados mexicanos o en línea, con envío a domicilio.'],
                ['finabien', 'Aproximadamente, ¿cuántas sucursales tiene FINABIEN en México?', ['Cerca de 1,700', 'Alrededor de 50', 'Unas 200', 'Más de 10,000'], 'Su red llega a muchas localidades donde no hay bancos.'],
                ['finabien', 'Desde 2026, Estados Unidos cobra 1% a las remesas enviadas en efectivo. ¿Cómo se puede evitar?', ['Enviando desde una cuenta o tarjeta, como la Tarjeta Finabien', 'Enviando el dinero en un sobre', 'Dividiendo el envío en partes', 'No hay forma de evitarlo'], 'Las transferencias desde cuentas o tarjetas no pagan ese impuesto.'],
                ['educacion', '¿Qué es el CAT?', ['El Costo Anual Total: sirve para comparar el costo de los créditos', 'Una cuenta de ahorro', 'Una comisión por apertura', 'El rendimiento de una inversión'], 'Entre dos créditos parecidos, conviene el de menor CAT.'],
                ['educacion', 'Si solo pagas el mínimo de tu tarjeta de crédito...', ['Pagas más intereses y tardas más en liquidar', 'Ahorras en intereses', 'Tu deuda se cancela sola', 'Mejoras tu historial más rápido'], 'Pagar el total, o lo más posible, reduce lo que pagas en intereses.'],
                ['educacion', '¿Cuánto se recomienda tener en un fondo de emergencia?', ['De 3 a 6 meses de tus gastos', 'Una semana de gastos', 'Dos años de sueldo', 'No es necesario'], 'Empieza con poco y ve aumentando hasta cubrir varios meses.'],
                ['educacion', 'Te llega un mensaje: "Tu cuenta será bloqueada, entra a este enlace y confirma tus datos". ¿Qué es?', ['Un posible fraude: contacta a tu institución por sus canales oficiales', 'Un aviso normal del banco', 'Una promoción', 'Un error sin importancia'], 'Las instituciones nunca te piden NIP, contraseñas ni códigos por mensaje.'],
                ['educacion', 'En la regla 50/30/20, ¿qué significa cada parte?', ['50% necesidades, 30% deseos, 20% ahorro', '50% ahorro, 30% deudas, 20% ocio', '50% deseos, 30% ahorro, 20% necesidades', '50% impuestos, 30% renta, 20% comida'], 'Es una guía para repartir tus ingresos; ajústala a tu realidad.'],
                ['educacion', '¿Qué registra el Buró de Crédito?', ['Tu historial de pagos de créditos, buenos y malos', 'Solo a las personas que deben', 'El dinero que tienes ahorrado', 'Tus impuestos'], 'Pagar a tiempo construye un buen historial y abre mejores opciones de crédito.'],
                ['educacion', '¿Para qué sirve una AFORE?', ['Para administrar tu ahorro para el retiro', 'Para dar créditos de vivienda', 'Para asegurar tu auto', 'Para enviar remesas'], 'Revisar tu AFORE y hacer aportaciones voluntarias mejora tu pensión.'],
                ['educacion', 'Al comparar opciones para enviar o recibir remesas, ¿qué conviene revisar?', ['La comisión y el tipo de cambio', 'Solo la publicidad', 'El color de la tarjeta', 'Nada, todas cuestan igual'], 'Una comisión baja con un mal tipo de cambio puede salir más cara.'],
            ],
        ];
    }

    /** Categoría a = necesidad / buena decisión; b = deseo / riesgo. */
    private function tarjetas(): array
    {
        return [
            'ninos' => [
                ['🍎', 'Fruta para el lunch', 'a', null],
                ['💧', 'Agua para tomar', 'a', null],
                ['📚', 'Útiles escolares', 'a', null],
                ['👟', 'Zapatos para ir a la escuela', 'a', null],
                ['🩺', 'Ir al doctor', 'a', null],
                ['🧥', 'Suéter para el frío', 'a', null],
                ['🛏️', 'Una cama para dormir', 'a', null],
                ['🎮', 'Un videojuego nuevo', 'b', null],
                ['🧸', 'Otro peluche', 'b', null],
                ['🍬', 'Dulces', 'b', null],
                ['🎈', 'Un globo de la feria', 'b', null],
                ['🍦', 'Un helado', 'b', null],
                ['🎠', 'Subir otra vez al juego mecánico', 'b', null],
            ],
            'jovenes' => [
                ['🚌', 'Pasaje para ir a la escuela', 'a', 'Sin transporte no llegas a clases.'],
                ['🍽️', 'Comida de la semana', 'a', 'La alimentación es una necesidad básica.'],
                ['💊', 'Medicinas', 'a', 'La salud va primero.'],
                ['👕', 'Uniforme escolar', 'a', 'Es requisito para ir a la escuela.'],
                ['📓', 'Cuadernos para el semestre', 'a', 'Son herramientas para estudiar.'],
                ['💡', 'Pagar la luz de la casa', 'a', 'Es un servicio básico del hogar.'],
                ['🕹️', 'Skin para tu videojuego', 'b', 'Es divertido, pero no indispensable.'],
                ['👟', 'Tenis de edición limitada', 'b', 'Unos tenis normales cumplen la misma función.'],
                ['📺', 'Tres plataformas de streaming', 'b', 'Puedes elegir una y rotarla cada mes.'],
                ['🎧', 'Audífonos de lujo', 'b', 'Un deseo que puedes planear con ahorro.'],
                ['🍔', 'Comida rápida todos los días', 'b', 'Cocinar en casa cuesta menos.'],
                ['📱', 'Celular último modelo', 'b', 'Si el tuyo funciona, es un deseo.'],
                ['🎤', 'Boletos para un concierto', 'b', 'Vale la pena si lo ahorras con tiempo.'],
            ],
            'adultos' => [
                ['🔎', 'Comparar comisión y tipo de cambio antes de enviar dinero', 'a', 'Pequeñas diferencias suman mucho al año.'],
                ['🐷', 'Ahorrar 10% de cada ingreso', 'a', 'Pagarte primero a ti hace crecer tu ahorro.'],
                ['💳', 'Pagar el total de la tarjeta cada mes', 'a', 'Así no pagas intereses.'],
                ['📄', 'Revisar tu estado de cuenta cada mes', 'a', 'Detectas cargos que no reconoces.'],
                ['🛟', 'Tener un fondo de emergencia', 'a', 'Te evita endeudarte ante un imprevisto.'],
                ['✅', 'Verificar que una financiera esté registrada en CONDUSEF', 'a', 'Consulta el SIPRES antes de contratar.'],
                ['🏦', 'Enviar remesas desde cuenta o tarjeta y no en efectivo', 'a', 'Es más seguro y evita el impuesto de 1% en EE. UU.'],
                ['📞', 'Dar tu NIP por teléfono a quien dice ser del banco', 'b', 'Ninguna institución te pedirá tu NIP.'],
                ['🔁', 'Pedir un préstamo para pagar otro préstamo', 'b', 'Puede volverse una deuda que no deja de crecer.'],
                ['💬', 'Préstamo "sin requisitos" ofrecido por WhatsApp', 'b', 'Es una señal típica de fraude o extorsión.'],
                ['📶', 'Entrar a tu banca en línea desde Wi-Fi público', 'b', 'Usa tus datos móviles para operaciones bancarias.'],
                ['✍️', 'Firmar un contrato sin leerlo', 'b', 'Lee comisiones, plazos y penalizaciones antes.'],
                ['🤝', 'Prestar tu tarjeta y tu NIP a un conocido', 'b', 'Tú respondes por todo lo que se haga con ella.'],
                ['🛍️', 'Comprar a meses sin revisar tu presupuesto', 'b', 'Varias mensualidades juntas pueden ahogarte.'],
            ],
        ];
    }

    private function pares(): array
    {
        return [
            // Niñas y niños: la pareja es el mismo dibujo con su nombre.
            'ninos' => [
                ['🐷', 'Alcancía', 'Alcancía'],
                ['🪙', 'Moneda', 'Moneda'],
                ['💵', 'Billete', 'Billete'],
                ['🎯', 'Meta', 'Meta'],
                ['🛒', 'Compra', 'Compra'],
                ['🏦', 'Sucursal', 'Sucursal'],
                ['💼', 'Trabajo', 'Trabajo'],
                ['📒', 'Cuenta', 'Cuenta'],
            ],
            'jovenes' => [
                ['🐷', 'Ahorro', 'Guardar una parte de tu dinero'],
                ['📋', 'Presupuesto', 'Plan de ingresos y gastos'],
                ['📈', 'Interés', 'Costo o ganancia del dinero en el tiempo'],
                ['✉️', 'Remesa', 'Dinero enviado desde otro país'],
                ['🎈', 'Inflación', 'Aumento general de los precios'],
                ['🧾', 'Deuda', 'Dinero que debes pagar'],
                ['🔐', 'NIP', 'Clave secreta de tu tarjeta'],
                ['🛟', 'Fondo de emergencia', 'Dinero para imprevistos'],
            ],
            'adultos' => [
                ['📊', 'CAT', 'Costo Anual Total de un crédito'],
                ['👵', 'AFORE', 'Ahorro para tu retiro'],
                ['⚖️', 'CONDUSEF', 'Defiende a usuarios de servicios financieros'],
                ['🏛️', 'FINABIEN', 'Financiera para el Bienestar'],
                ['💳', 'Tarjeta Finabien', 'Envía dinero de EE. UU. a México'],
                ['📁', 'Buró de Crédito', 'Historial de tus pagos de créditos'],
                ['🎣', 'Phishing', 'Engaño para robar tus datos'],
                ['💱', 'Tipo de cambio', 'Cuántos pesos vale un dólar'],
            ],
        ];
    }
}
