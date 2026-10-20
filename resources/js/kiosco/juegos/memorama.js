import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { esc, esperar, mezclar } from '../util.js';

/** Memorama: une cada concepto con su significado (niñas y niños: dibujos iguales). */
export function memorama(ctx) {
    const { datos, raiz } = ctx;
    const mismos = datos.items.every((p) => p.termino === p.definicion);
    const cartas = mezclar(datos.items.flatMap((p) => [
        { par: p.id, tipo: 't', p },
        { par: p.id, tipo: 'd', p },
    ]));
    let abiertas = [];
    let movimientos = 0;
    let hechas = 0;
    let bloqueo = false;
    let terminado = false;
    const inicio = Date.now();
    let reloj = 0;

    const frente = ({ tipo, p }) => (tipo === 't' || mismos
        ? `<div class="cara frente"><span class="emoji" aria-hidden="true">${esc(p.icono ?? '')}</span><span class="t">${esc(p.termino)}</span></div>`
        : `<div class="cara frente def"><span class="d">${esc(p.definicion)}</span></div>`);

    raiz.innerHTML = `
        ${ctx.cabecera(null, '<span data-mov>0 movimientos</span> · <span data-seg>0:00</span>')}
        <p class="pista-teclas">${mismos ? 'Encuentra los pares de dibujos iguales.' : 'Une cada palabra con su significado.'}</p>
        <div class="memorama">
            ${cartas.map((c, k) => `<button class="carta" data-k="${k}" aria-label="Carta ${k + 1}"><div class="cara dorso"></div>${frente(c)}</button>`).join('')}
        </div>`;

    const $mov = raiz.querySelector('[data-mov]');
    const $seg = raiz.querySelector('[data-seg]');
    reloj = setInterval(() => {
        const s = Math.floor((Date.now() - inicio) / 1000);
        $seg.textContent = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
    }, 500);

    raiz.querySelector('.memorama').addEventListener('click', async (e) => {
        const el = e.target.closest('.carta');
        if (!el || bloqueo || terminado || el.classList.contains('volteada')) return;
        sonido.voltea();
        el.classList.add('volteada');
        abiertas.push(el);
        if (abiertas.length < 2) return;

        movimientos++;
        $mov.textContent = `${movimientos} ${movimientos === 1 ? 'movimiento' : 'movimientos'}`;
        const [x, y] = abiertas;
        abiertas = [];

        if (cartas[x.dataset.k].par === cartas[y.dataset.k].par) {
            x.classList.add('hecha');
            y.classList.add('hecha');
            sonido.bien();
            hechas++;
            if (hechas === datos.items.length) finalizar();
            return;
        }

        bloqueo = true;
        await esperar(500);
        x.classList.add('sacude');
        y.classList.add('sacude');
        await esperar(650);
        x.classList.remove('volteada', 'sacude');
        y.classList.remove('volteada', 'sacude');
        bloqueo = false;
    });

    async function finalizar() {
        terminado = true;
        clearInterval(reloj);
        sonido.fin();
        // El servidor rechaza partidas imposiblemente rápidas; esperamos el mínimo si hace falta.
        const transcurrido = Date.now() - inicio;
        if (transcurrido < 9000) await esperar(9000 - transcurrido);
        await esperar(700);
        try {
            const resumen = await api.terminar(datos.partida, {
                movimientos,
                segundos: Math.round((Date.now() - inicio) / 1000),
            });
            ctx.alTerminar(resumen, []);
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    return () => { terminado = true; clearInterval(reloj); };
}
