import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { cuentaRegresiva, esc, flotar, pesos } from '../util.js';

const ORDEN = ['colchon', 'antojo', 'ahorro'];
const PLANTAS = ['🌱', '🌿', '🪴', '🌳'];

/**
 * Cosecha tu ahorro: decide rápido a dónde va cada ingreso. El ahorro formal capitaliza
 * cada "año" (unos segundos de juego); el colchón no crece y puede perderse.
 * El servidor recalcula los montos con la misma fórmula al terminar.
 */
export function cosecha(ctx) {
    const { datos, raiz } = ctx;
    const duracion = datos.segundos * 1000;
    const anios = datos.segundos / datos.segundos_por_anio;
    const pendientes = [...datos.items].sort((a, b) => a.t - b.t);
    const totalIngresos = datos.items.reduce((s, i) => s + (i.valor ?? 0), 0) || 1;
    const decisiones = {};
    const depositos = []; // { valor, t } para el crecimiento en vivo
    let colchon = 0;
    let antojo = 0;
    let actual = null;
    let vence = 0;
    let terminado = false;
    let raf = 0;
    let inicio = 0;

    raiz.innerHTML = `
        ${ctx.cabecera(null, 'Año <b data-anio>1</b> de ' + anios)}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="cosecha">
            <div class="ingreso-zona" data-zona aria-live="polite">
                <p class="pista-teclas">Cada vez que te llegue dinero, elige a dónde va.</p>
            </div>
            <div class="macetas">
                ${ORDEN.map((d, k) => {
                    const info = datos.destinos[d];
                    return `
                    <button class="maceta m-${d}" data-d="${d}">
                        <span class="emoji" aria-hidden="true" ${d === 'ahorro' ? 'data-planta' : ''}>${esc(info.icono)}</span>
                        <b>${esc(info.nombre)}</b>
                        <small>${esc(info.ayuda)}</small>
                        <span class="monto" data-m="${d}">$0</span>
                        <kbd aria-hidden="true">${k + 1}</kbd>
                    </button>`;
                }).join('')}
            </div>
        </div>`;

    const zona = raiz.querySelector('[data-zona]');
    const $anio = raiz.querySelector('[data-anio]');
    const $planta = raiz.querySelector('[data-planta]');
    const monto = (d) => raiz.querySelector(`[data-m="${d}"]`);
    const boton = (d) => raiz.querySelector(`.maceta[data-d="${d}"]`);
    const barra = raiz.querySelector('.tiempo');
    const relleno = barra.firstElementChild;

    const crecido = (t) => depositos.reduce((s, dep) => s + dep.valor * (1 + datos.tasa_anual) ** ((t - dep.t) / 1000 / datos.segundos_por_anio), 0);

    function mostrarIngreso(item, t) {
        actual = item;
        vence = t + datos.vida_ms;
        zona.innerHTML = `
            <div class="ingreso" style="--vida:${datos.vida_ms}ms">
                <span class="moneda" aria-hidden="true"></span>
                <b>+${pesos(item.valor)}</b>
                <span>${esc(item.texto)}</span>
                <i class="vida" aria-hidden="true"></i>
            </div>`;
    }

    function perderColchon() {
        const perdido = colchon * datos.perdida_colchon;
        colchon -= perdido;
        monto('colchon').textContent = pesos(colchon);
        if (perdido > 0) {
            sonido.mal();
            boton('colchon').classList.add('sacude');
            setTimeout(() => boton('colchon').classList.remove('sacude'), 500);
        }
        ctx.aviso(`${datos.aviso_perdida}${perdido > 0 ? ` (−${pesos(perdido)})` : ''}`);
    }

    function decidir(d) {
        if (!actual || terminado) return;
        const item = actual;
        actual = null;
        decisiones[item.id] = d;
        const b = boton(d);
        b.classList.add('pulso');
        setTimeout(() => b.classList.remove('pulso'), 180);

        if (d === 'ahorro') {
            depositos.push({ valor: item.valor, t: item.t });
            sonido.bien();
        } else if (d === 'colchon') {
            colchon += item.valor;
            monto('colchon').textContent = pesos(colchon);
            sonido.toque();
        } else {
            antojo += item.valor;
            monto('antojo').textContent = pesos(antojo);
            sonido.voltea();
        }
        flotar(`+${pesos(item.valor)}`, b);
        zona.querySelector('.ingreso')?.classList.add(`va-${d}`);
    }

    function tic(ahora) {
        if (terminado) return;
        const t = ahora - inicio;

        if (actual && t >= vence) {
            actual = null;
            zona.innerHTML = '<p class="se-fue">🐜 Se fue en gastos hormiga</p>';
        }
        while (pendientes.length && pendientes[0].t <= t) {
            const item = pendientes.shift();
            if (item.tipo === 'perdida') perderColchon();
            else mostrarIngreso(item, t);
        }

        const ahorro = crecido(Math.min(t, duracion));
        monto('ahorro').textContent = pesos(ahorro);
        $planta.textContent = PLANTAS[Math.min(PLANTAS.length - 1, Math.floor((ahorro / totalIngresos) * PLANTAS.length))];
        $anio.textContent = Math.min(anios, Math.floor(t / 1000 / datos.segundos_por_anio) + 1);

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
            const resumen = await api.terminar(datos.partida, { decisiones });
            const d = resumen.detalle;
            const fila = (clase, nombre, valor, nota = '') => `
                <div class="fila-comp ${clase}">
                    <span>${nombre}</span>
                    <div class="barra-progreso"><span style="width:${d.maximo ? Math.min(100, (valor / d.maximo) * 100) : 0}%"></span></div>
                    <b>${pesos(valor)}</b>${nota ? `<small>${nota}</small>` : ''}
                </div>`;
            ctx.alTerminar(resumen, [], {
                titulo: d.ahorro >= d.maximo * 0.8 ? '¡Cosecha abundante!' : d.ahorro > 0 ? '¡Tu ahorro creció!' : 'Tu dinero no creció',
                html: `
                    <div class="comparativa">
                        ${fila('c-ahorro', '🌱 Ahorro formal', d.ahorro)}
                        ${fila('c-colchon', '🛏️ Bajo el colchón', d.colchon, d.perdido ? `se perdieron ${pesos(d.perdido)}` : '')}
                        ${fila('c-antojo', '🍭 Antojos', d.antojo, d.antojo ? 'ya se gastó' : '')}
                    </div>
                    <p>Si todo hubiera ido al ahorro formal, tendrías <strong>${pesos(d.maximo)}</strong> después de ${anios} años.</p>`,
                cierre: datos.cierre,
            });
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    function teclas(e) {
        const d = { 1: 'colchon', 2: 'antojo', 3: 'ahorro', ArrowLeft: 'colchon', ArrowDown: 'antojo', ArrowRight: 'ahorro' }[e.key];
        if (d) { e.preventDefault(); decidir(d); }
    }

    raiz.querySelector('.macetas').addEventListener('click', (e) => {
        const b = e.target.closest('[data-d]');
        if (b) decidir(b.dataset.d);
    });
    addEventListener('keydown', teclas);

    cuentaRegresiva(raiz.querySelector('.cosecha'), () => !terminado).then((sigue) => {
        if (!sigue) return;
        inicio = performance.now();
        raf = requestAnimationFrame(tic);
    });

    return () => { terminado = true; cancelAnimationFrame(raf); removeEventListener('keydown', teclas); };
}
