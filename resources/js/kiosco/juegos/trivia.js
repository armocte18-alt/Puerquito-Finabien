import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { esc, flotar } from '../util.js';

/** Trivia Bienestar: preguntas con tiempo; acierto + bono por rapidez (calificado en el servidor). */
export function trivia(ctx) {
    const { datos, raiz } = ctx;
    const items = datos.items;
    const limite = datos.segundos * 1000;
    const estados = [];
    const repaso = [];
    let i = 0;
    let puntos = 0;
    let inicio = 0;
    let raf = 0;
    let terminado = false;
    let contestando = false;

    function pintar() {
        const q = items[i];
        raiz.innerHTML = `
            ${ctx.cabecera(puntos)}
            <div class="trivia">
                <div class="barra">
                    <div class="progreso-dots" aria-hidden="true">${items.map((_, k) => `<span class="${estados[k] ?? (k === i ? 'actual' : '')}"></span>`).join('')}</div>
                    <span class="empuja etiqueta">Pregunta ${i + 1} de ${items.length}</span>
                </div>
                <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
                <p class="pregunta">${esc(q.enunciado)}</p>
                <div class="opciones ${q.opciones.length === 3 ? 'tres' : ''}">
                    ${q.opciones.map((o, k) => `<button class="opcion" data-op="${k}"><span class="letra">${'ABCD'[k]}</span><span>${esc(o)}</span></button>`).join('')}
                </div>
                <div class="retro-slot" aria-live="polite"></div>
            </div>`;

        raiz.querySelector('.opciones').addEventListener('click', (e) => {
            const b = e.target.closest('[data-op]');
            if (b) contestar(Number(b.dataset.op), b);
        });

        contestando = false;
        inicio = performance.now();
        const barra = raiz.querySelector('.tiempo');
        const relleno = barra.firstElementChild;
        const tic = (ahora) => {
            if (terminado || contestando) return;
            const resta = Math.max(0, 1 - (ahora - inicio) / limite);
            relleno.style.transform = `scaleX(${resta})`;
            barra.classList.toggle('urgente', resta < 0.25);
            if (resta <= 0) contestar(null, null);
            else raf = requestAnimationFrame(tic);
        };
        raf = requestAnimationFrame(tic);
    }

    async function contestar(opcion, boton) {
        if (contestando || terminado) return;
        contestando = true;
        cancelAnimationFrame(raf);
        const ms = Math.round(performance.now() - inicio);
        const q = items[i];
        const caja = raiz.querySelector('.opciones');
        caja.classList.add('bloqueadas');
        boton?.classList.add('apagada');

        let r;
        try {
            r = await api.responder(datos.partida, { item: q.id, respuesta: opcion, ms });
        } catch (e) {
            ctx.aviso(e.message);
            r = { acierto: false, correcta: null, puntos_item: 0, puntos, explicacion: null };
        }
        if (terminado) return;

        const botones = [...caja.querySelectorAll('.opcion')];
        botones.forEach((b, k) => {
            b.classList.remove('apagada');
            if (k === r.correcta) b.classList.add('correcta');
            else if (k === opcion) b.classList.add('incorrecta');
            else b.classList.add('apagada');
        });

        puntos = r.puntos;
        ctx.marcador(puntos);
        estados[i] = r.acierto ? 'ok' : 'no';
        if (r.acierto) {
            sonido.bien();
            flotar(`+${r.puntos_item}`, botones[r.correcta]);
        } else {
            sonido.mal();
            repaso.push({ titulo: q.enunciado, texto: r.correcta != null ? `Respuesta: ${q.opciones[r.correcta]}` : '' });
        }

        const ultima = i === items.length - 1;
        const titulo = r.acierto ? '¡Correcto!' : opcion === null ? '¡Se acabó el tiempo!' : 'Casi…';
        raiz.querySelector('.retro-slot').innerHTML = `
            <div class="panel retro ${r.acierto ? '' : 'mal'}">
                <div class="titulo">${titulo}</div>
                ${r.explicacion ? `<p>${esc(r.explicacion)}</p>` : '<p></p>'}
                <button class="btn btn-xl" data-sig>${ultima ? 'Ver mi resultado' : 'Siguiente'}</button>
            </div>`;
        const sig = raiz.querySelector('[data-sig]');
        sig.focus();
        sig.addEventListener('click', siguiente, { once: true });
    }

    async function siguiente() {
        if (i < items.length - 1) {
            i++;
            pintar();
            return;
        }
        terminado = true;
        try {
            const resumen = await api.terminar(datos.partida);
            ctx.alTerminar(resumen, repaso);
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    pintar();
    return () => { terminado = true; cancelAnimationFrame(raf); };
}
