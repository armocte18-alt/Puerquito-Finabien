import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { cuentaRegresiva, esc, flotar } from '../util.js';

const X_TARJETA = 0.13; // la tarjeta vive en el 13% izquierdo del camino
const ALCANCE = 0.055;  // distancia horizontal que cuenta como choque

/**
 * El viaje de la remesa: la Tarjeta FINABIEN cruza de Estados Unidos a México en tres carriles.
 * La ruta la genera el servidor; aquí solo se reporta qué piezas tocó la tarjeta.
 */
export function remesa(ctx) {
    const { datos, raiz } = ctx;
    const { piezas } = datos;
    const duracion = datos.segundos * 1000;
    const pendientes = [...datos.items].sort((a, b) => a.t - b.t);
    const activos = [];
    const recogidos = [];
    const golpes = [];
    let carril = 1;
    let dolares = datos.dolares;
    let terminado = false;
    let raf = 0;
    let inicio = 0;

    raiz.innerHTML = `
        ${ctx.cabecera(null, '<span data-dolares></span>')}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="ruta" aria-hidden="true">
            <span>🏙️ Estados Unidos</span>
            <div class="ruta-linea"><i data-avance></i></div>
            <span>México 🏡</span>
        </div>
        <div class="remesa" aria-label="Camino de la remesa: toca un carril o usa las flechas arriba y abajo">
            <div class="carril"></div><div class="carril"></div><div class="carril"></div>
            <div class="tarjeta-fb" data-tarjeta><b>FINABIEN</b><small>Tarjeta</small></div>
        </div>
        <p class="evento-linea" data-evento aria-live="polite">Junta lo que suma y esquiva lo que le quita valor a tu envío.</p>`;

    const escena = raiz.querySelector('.remesa');
    const tarjeta = raiz.querySelector('[data-tarjeta]');
    const $dolares = raiz.querySelector('[data-dolares]');
    const $evento = raiz.querySelector('[data-evento]');
    const $avance = raiz.querySelector('[data-avance]');
    const barra = raiz.querySelector('.tiempo');
    const relleno = barra.firstElementChild;

    const centroCarril = (c) => `${c * 33.333 + 16.666}%`;
    const pintarDolares = () => { $dolares.textContent = `$${dolares} USD en camino`; };

    function mover(nuevo) {
        if (terminado) return;
        carril = Math.max(0, Math.min(2, nuevo));
        tarjeta.style.top = centroCarril(carril);
    }

    function crear(item) {
        const p = piezas[item.tipo];
        const el = document.createElement('div');
        el.className = `pieza ${p.bueno ? 'buena' : 'mala'}`;
        el.style.top = centroCarril(item.carril);
        el.innerHTML = `<span class="emoji" aria-hidden="true">${esc(p.icono)}</span><span class="corto">${esc(p.corto)}</span>`;
        escena.append(el);
        activos.push({ item, el, hecho: false });
    }

    function tocar(a) {
        a.hecho = true;
        const p = piezas[a.item.tipo];
        if (p.bueno) {
            recogidos.push(a.item.id);
            dolares += p.valor;
            sonido.bien();
            a.el.classList.add('recogida');
            flotar(p.corto, tarjeta);
            $evento.textContent = `${p.icono} ${p.texto}: +$${p.valor}`;
        } else {
            golpes.push(a.item.id);
            dolares = Math.max(0, dolares - p.valor);
            sonido.mal();
            a.el.classList.add('golpe');
            tarjeta.classList.remove('sacudida');
            void tarjeta.offsetWidth;
            tarjeta.classList.add('sacudida');
            $evento.textContent = `${p.icono} ${p.texto}: −$${p.valor}`;
        }
        $evento.classList.toggle('mal', !p.bueno);
        pintarDolares();
    }

    function tic(ahora) {
        if (terminado) return;
        const t = ahora - inicio;
        while (pendientes.length && pendientes[0].t <= t) crear(pendientes.shift());

        for (let k = activos.length - 1; k >= 0; k--) {
            const a = activos[k];
            // Cada pieza llega a la tarjeta exactamente "viaje_ms" después de aparecer.
            const x = 1 - ((t - a.item.t) / datos.viaje_ms) * (1 - X_TARJETA);
            a.el.style.left = `${x * 100}%`;
            if (!a.hecho && a.item.carril === carril && Math.abs(x - X_TARJETA) < ALCANCE) tocar(a);
            if (x < -0.08) {
                a.el.remove();
                activos.splice(k, 1);
            }
        }

        const avance = Math.min(1, t / duracion);
        $avance.style.width = `${avance * 100}%`;
        relleno.style.transform = `scaleX(${1 - avance})`;
        barra.classList.toggle('urgente', avance > 0.8);
        if (avance >= 1) finalizar();
        else raf = requestAnimationFrame(tic);
    }

    async function finalizar() {
        if (terminado) return;
        terminado = true;
        cancelAnimationFrame(raf);
        removeEventListener('keydown', teclas);
        tarjeta.classList.add('llega');
        try {
            const resumen = await api.terminar(datos.partida, { recogidos, golpes });
            const d = resumen.detalle;
            ctx.alTerminar(resumen, [], {
                titulo: '¡Tu remesa llegó a México!',
                html: `
                    <div class="cifras">
                        <div><small>Enviaste</small><b>$${d.enviados} USD</b></div>
                        <div class="${d.llegaron >= d.enviados ? 'bien' : 'mal'}"><small>Llegaron a tu familia</small><b>$${d.llegaron} USD</b></div>
                    </div>
                    <p>${resumen.aciertos} beneficios recogidos · ${resumen.errores} cobros que te alcanzaron</p>`,
                cierre: datos.cierre,
            });
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    function teclas(e) {
        if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); mover(carril - 1); }
        if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); mover(carril + 1); }
    }

    // Tocar cualquier punto del camino lleva la tarjeta a ese carril.
    escena.addEventListener('pointerdown', (e) => {
        const r = escena.getBoundingClientRect();
        mover(Math.floor(((e.clientY - r.top) / r.height) * 3));
    });
    addEventListener('keydown', teclas);

    pintarDolares();
    mover(1);
    cuentaRegresiva(escena, () => !terminado).then((sigue) => {
        if (!sigue) return;
        inicio = performance.now();
        raf = requestAnimationFrame(tic);
    });

    return () => { terminado = true; cancelAnimationFrame(raf); removeEventListener('keydown', teclas); };
}
