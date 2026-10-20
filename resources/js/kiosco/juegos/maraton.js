import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { cuentaRegresiva, esc, flotar, pesos } from '../util.js';

const TOQUE_MS = 280;  // pulsación corta = pagar sin arrastrar
const TOQUE_PX = 14;

/**
 * Maratón de pagos: los recibos caen y se pagan arrastrándolos (o tocándolos) a la ventanilla
 * FINABIEN antes de que lleguen al piso. Los cobros fraudulentos no se pagan.
 */
export function maraton(ctx) {
    const { datos, raiz } = ctx;
    const duracion = datos.segundos * 1000;
    const pendientes = [...datos.items].sort((a, b) => a.t - b.t);
    const activos = new Map(); // id → { item, el, y, arrastre }
    const pagados = [];
    let pagadosOk = 0;
    let terminado = false;
    let raf = 0;
    let inicio = 0;
    let previo = 0;

    raiz.innerHTML = `
        ${ctx.cabecera(null, '<span data-cuenta>0 pagos</span>')}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="maraton">
            <div class="cielo" data-cielo></div>
            <div class="ventanilla" data-ventanilla>
                <span class="emoji" aria-hidden="true">🏦</span>
                <b>Ventanilla FINABIEN</b>
                <small>Arrastra o toca un recibo para pagarlo · Espacio paga el más urgente</small>
            </div>
        </div>
        <p class="evento-linea" data-evento aria-live="polite">¡Ojo! Si un recibo te pide pagar para recibir un premio, es fraude: déjalo caer.</p>`;

    const cielo = raiz.querySelector('[data-cielo]');
    const ventanilla = raiz.querySelector('[data-ventanilla]');
    const $cuenta = raiz.querySelector('[data-cuenta]');
    const $evento = raiz.querySelector('[data-evento]');
    const barra = raiz.querySelector('.tiempo');
    const relleno = barra.firstElementChild;
    const tipoDe = (item) => (item.fraude ? datos.tipos.fraudes : datos.tipos.recibos)[item.tipo];

    function evento(texto, mal = false) {
        $evento.textContent = texto;
        $evento.classList.toggle('mal', mal);
    }

    function crear(item) {
        const tipo = tipoDe(item);
        const el = document.createElement('button');
        el.className = 'recibo';
        el.style.left = `${item.x}%`;
        el.dataset.id = item.id;
        el.innerHTML = `
            <span class="emoji" aria-hidden="true">${esc(tipo.icono)}</span>
            <span class="concepto">${esc(tipo.texto)}</span>
            <b>${pesos(item.monto)}</b>`;
        el.setAttribute('aria-label', `${tipo.texto}, ${pesos(item.monto)}`);
        cielo.append(el);
        activos.set(item.id, { item, el, y: -0.12, arrastre: null });
    }

    function quitar(a) {
        activos.delete(a.item.id);
        setTimeout(() => a.el.remove(), 420);
    }

    function pagar(a) {
        if (terminado || !activos.has(a.item.id)) return;
        pagados.push(a.item.id);
        const tipo = tipoDe(a.item);
        a.el.classList.add(a.item.fraude ? 'fraude-pagado' : 'pagado');
        flotar(a.item.fraude ? '¡Fraude!' : '✓', ventanilla);
        if (a.item.fraude) {
            sonido.mal();
            ventanilla.classList.add('alerta');
            setTimeout(() => ventanilla.classList.remove('alerta'), 500);
            evento(`${tipo.icono} Pagaste un cobro falso: "${tipo.texto}". Nunca pagues para recibir un premio o un préstamo.`, true);
        } else {
            sonido.bien();
            pagadosOk++;
            $cuenta.textContent = `${pagadosOk} ${pagadosOk === 1 ? 'pago' : 'pagos'}`;
            evento(`${tipo.icono} ${tipo.texto} pagado: ${pesos(a.item.monto)}`);
        }
        quitar(a);
    }

    function caer(a) {
        a.el.classList.add(a.item.fraude ? 'evitado' : 'vencido');
        const tipo = tipoDe(a.item);
        if (a.item.fraude) evento(`🛡️ ¡Bien! No pagaste "${tipo.texto}".`);
        else evento(`${tipo.icono} Se venció tu recibo de ${tipo.texto.toLowerCase()}: pagar tarde genera recargos.`, true);
        quitar(a);
    }

    function sobreVentanilla(x, y) {
        const r = ventanilla.getBoundingClientRect();
        return x >= r.left && x <= r.right && y >= r.top - 20 && y <= r.bottom;
    }

    // Arrastre con Pointer Events: funciona igual con dedo, lápiz o mouse.
    cielo.addEventListener('pointerdown', (e) => {
        const el = e.target.closest('.recibo');
        const a = el && activos.get(Number(el.dataset.id));
        if (!a || terminado) return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        const r = cielo.getBoundingClientRect();
        a.arrastre = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: performance.now(), r };
        el.classList.add('arrastrando');
    });
    cielo.addEventListener('pointermove', (e) => {
        const el = e.target.closest('.recibo');
        const a = el && activos.get(Number(el.dataset.id));
        if (!a?.arrastre || a.arrastre.id !== e.pointerId) return;
        const { r } = a.arrastre;
        a.el.style.left = `${((e.clientX - r.left) / r.width) * 100}%`;
        a.y = (e.clientY - r.top) / r.height;
        ventanilla.classList.toggle('lista', sobreVentanilla(e.clientX, e.clientY));
    });
    const soltar = (e) => {
        const el = e.target.closest('.recibo');
        const a = el && activos.get(Number(el.dataset.id));
        if (!a?.arrastre || a.arrastre.id !== e.pointerId) return;
        const { x0, y0, t0 } = a.arrastre;
        const fueToque = performance.now() - t0 < TOQUE_MS && Math.hypot(e.clientX - x0, e.clientY - y0) < TOQUE_PX;
        a.arrastre = null;
        el.classList.remove('arrastrando');
        ventanilla.classList.remove('lista');
        if (fueToque || sobreVentanilla(e.clientX, e.clientY)) pagar(a);
    };
    cielo.addEventListener('pointerup', soltar);
    cielo.addEventListener('pointercancel', soltar);

    function tic(ahora) {
        if (terminado) return;
        const t = ahora - inicio;
        const dt = ahora - previo;
        previo = ahora;
        while (pendientes.length && pendientes[0].t <= t) crear(pendientes.shift());

        for (const a of activos.values()) {
            if (a.arrastre) continue;
            a.y += dt / datos.caida_ms;
            a.el.style.top = `${a.y * 100}%`;
            if (a.y >= 1) caer(a);
        }

        const resta = Math.max(0, 1 - t / duracion);
        relleno.style.transform = `scaleX(${resta})`;
        barra.classList.toggle('urgente', resta < 0.2);
        if (resta <= 0) finalizar();
        else raf = requestAnimationFrame(tic);
    }

    async function finalizar() {
        if (terminado) return;
        terminado = true;
        cancelAnimationFrame(raf);
        removeEventListener('keydown', teclas);
        try {
            const resumen = await api.terminar(datos.partida, { pagados });
            const d = resumen.detalle;
            ctx.alTerminar(resumen, [], {
                titulo: d.fraudes_pagados ? '¡Cuidado con los fraudes!' : d.pagados >= d.recibos * 0.8 ? '¡Todo al corriente!' : '¡Buen maratón!',
                html: `
                    <div class="cifras">
                        <div class="bien"><small>Recibos pagados</small><b>${d.pagados} de ${d.recibos}</b></div>
                        <div><small>Total pagado</small><b>${pesos(d.pesos)}</b></div>
                        <div class="${d.fraudes_pagados ? 'mal' : 'bien'}"><small>Fraudes evitados</small><b>${d.fraudes_evitados}</b></div>
                    </div>`,
                cierre: datos.cierre,
            });
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    // Teclado: espacio o Enter pagan el recibo que va más abajo (el más urgente).
    function teclas(e) {
        if (e.key !== ' ' && e.key !== 'Enter') return;
        if (document.activeElement?.closest?.('[data-abandonar]')) return;
        e.preventDefault();
        const urgente = [...activos.values()].filter((a) => !a.arrastre).sort((a, b) => b.y - a.y)[0];
        if (urgente) pagar(urgente);
    }
    addEventListener('keydown', teclas);

    cuentaRegresiva(raiz.querySelector('.maraton'), () => !terminado).then((sigue) => {
        if (!sigue) return;
        inicio = previo = performance.now();
        raf = requestAnimationFrame(tic);
    });

    return () => { terminado = true; cancelAnimationFrame(raf); removeEventListener('keydown', teclas); };
}
