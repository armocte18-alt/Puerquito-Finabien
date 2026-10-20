import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { esc, esperar, flotar } from '../util.js';

/** Decide rápido: manda cada tarjeta a la cubeta correcta antes de que se acabe el tiempo. */
export function clasifica(ctx) {
    const { datos, raiz } = ctx;
    const { a, b } = datos.etiquetas;
    const limite = datos.segundos * 1000;
    const cola = [...datos.items];
    const repaso = [];
    let puntos = 0;
    let ocupado = false;
    let terminado = false;
    let raf = 0;

    raiz.innerHTML = `
        ${ctx.cabecera(puntos)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="clasifica">
            <button class="cubeta a" data-cat="a">← ${esc(a)}<small>Toca aquí o usa la flecha izquierda</small></button>
            <div class="tarjeta-central" aria-live="polite"></div>
            <button class="cubeta b" data-cat="b">${esc(b)} →<small>Toca aquí o usa la flecha derecha</small></button>
        </div>
        <p class="pista-teclas"><span data-restan></span></p>`;

    const tarjeta = raiz.querySelector('.tarjeta-central');
    const restan = raiz.querySelector('[data-restan]');

    function mostrar() {
        const t = cola[0];
        tarjeta.className = 'tarjeta-central llega';
        tarjeta.innerHTML = `<span class="emoji" aria-hidden="true">${esc(t.icono ?? '')}</span><span class="texto">${esc(t.texto)}</span>`;
        restan.textContent = `${cola.length} ${cola.length === 1 ? 'tarjeta restante' : 'tarjetas restantes'}`;
    }

    async function elegir(cat) {
        if (ocupado || terminado || !cola.length) return;
        ocupado = true;
        const t = cola[0];
        const cubeta = raiz.querySelector(`.cubeta.${cat}`);
        cubeta.classList.add('pulso');
        setTimeout(() => cubeta.classList.remove('pulso'), 180);

        let r;
        try {
            r = await api.responder(datos.partida, { item: t.id, respuesta: cat });
        } catch (e) {
            // El servidor ya cerró el tiempo: terminamos con lo acumulado.
            if (e.estado === 422) return finalizar();
            ctx.aviso(e.message);
            ocupado = false;
            return;
        }
        if (terminado) return;

        puntos = r.puntos;
        ctx.marcador(puntos);
        tarjeta.insertAdjacentHTML('beforeend', `<span class="sello ${r.acierto ? 'ok' : 'no'}">${r.acierto ? '¡Bien!' : 'Ups'}</span>`);
        if (r.acierto) {
            sonido.bien();
            flotar(`+${r.puntos_item}`, tarjeta);
        } else {
            sonido.mal();
            repaso.push({ titulo: t.texto, texto: `Era: ${r.correcta === 'a' ? a : b}${r.explicacion ? `. ${r.explicacion}` : ''}` });
        }

        await esperar(r.acierto ? 250 : 650);
        tarjeta.classList.add(cat === 'a' ? 'va-a' : 'va-b');
        await esperar(240);
        cola.shift();
        ocupado = false;
        if (cola.length) mostrar();
        else finalizar();
    }

    async function finalizar() {
        if (terminado) return;
        terminado = true;
        cancelAnimationFrame(raf);
        removeEventListener('keydown', teclas);
        try {
            const resumen = await api.terminar(datos.partida);
            ctx.alTerminar(resumen, repaso);
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    function teclas(e) {
        if (e.key === 'ArrowLeft') elegir('a');
        if (e.key === 'ArrowRight') elegir('b');
    }

    raiz.querySelector('.clasifica').addEventListener('click', (e) => {
        const c = e.target.closest('[data-cat]');
        if (c) elegir(c.dataset.cat);
    });
    addEventListener('keydown', teclas);

    const barra = raiz.querySelector('.tiempo');
    const relleno = barra.firstElementChild;
    const inicio = performance.now();
    const tic = (ahora) => {
        if (terminado) return;
        const resta = Math.max(0, 1 - (ahora - inicio) / limite);
        relleno.style.transform = `scaleX(${resta})`;
        barra.classList.toggle('urgente', resta < 0.2);
        if (resta <= 0) finalizar();
        else raf = requestAnimationFrame(tic);
    };
    raf = requestAnimationFrame(tic);
    mostrar();

    return () => { terminado = true; cancelAnimationFrame(raf); removeEventListener('keydown', teclas); };
}
