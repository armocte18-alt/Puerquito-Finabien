import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { esc, flotar } from '../util.js';

/**
 * Simulador del emprendedor: dilemas de un negocio con dos opciones. Cada decisión mueve
 * las barras de bienestar financiero y salud del negocio; el servidor revela el efecto.
 */
export function emprendedor(ctx) {
    const { datos, raiz } = ctx;
    const { negocio } = datos;
    const items = datos.items;
    const estados = [];
    const repaso = [];
    const barras = { bienestar: datos.inicio_barras, negocio: datos.inicio_barras };
    let i = 0;
    let puntos = 0;
    let terminado = false;
    let contestando = false;

    const medidor = (clave, icono, nombre) => `
        <div class="medidor m-${clave}">
            <span class="nombre"><span class="emoji" aria-hidden="true">${icono}</span> ${esc(nombre)}</span>
            <div class="barra-progreso" role="meter" aria-label="${esc(nombre)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${barras[clave]}">
                <span style="width:${barras[clave]}%"></span>
            </div>
            <b data-valor="${clave}">${barras[clave]}</b>
            <span class="delta" data-delta="${clave}"></span>
        </div>`;

    function pintar() {
        const q = items[i];
        raiz.innerHTML = `
            ${ctx.cabecera(puntos, `${esc(negocio.icono)} ${esc(negocio.nombre)}`)}
            <div class="emprende">
                <div class="medidores">
                    ${medidor('bienestar', '💰', negocio.barras[0])}
                    ${medidor('negocio', negocio.icono, negocio.barras[1])}
                </div>
                <div class="barra">
                    <div class="progreso-dots" aria-hidden="true">${items.map((_, k) => `<span class="${estados[k] ?? (k === i ? 'actual' : '')}"></span>`).join('')}</div>
                    <span class="empuja etiqueta">Mes ${i + 1} de ${items.length}</span>
                </div>
                <div class="dilema">
                    <span class="emoji" aria-hidden="true">${esc(q.icono)}</span>
                    <p class="pregunta">${esc(q.situacion)}</p>
                </div>
                <div class="opciones">
                    ${q.opciones.map((o, k) => `<button class="opcion" data-op="${k}"><span class="letra">${'AB'[k]}</span><span>${esc(o)}</span></button>`).join('')}
                </div>
                <div class="retro-slot" aria-live="polite"></div>
            </div>`;

        raiz.querySelector('.opciones').addEventListener('click', (e) => {
            const b = e.target.closest('[data-op]');
            if (b) decidir(Number(b.dataset.op));
        });
        contestando = false;
    }

    function moverBarra(clave, valor, delta) {
        barras[clave] = valor;
        const caja = raiz.querySelector(`.m-${clave}`);
        caja.querySelector('.barra-progreso > span').style.width = `${valor}%`;
        caja.querySelector('.barra-progreso').setAttribute('aria-valuenow', valor);
        caja.querySelector(`[data-valor="${clave}"]`).textContent = valor;
        const chip = caja.querySelector(`[data-delta="${clave}"]`);
        chip.textContent = delta > 0 ? `+${delta}` : delta < 0 ? `−${Math.abs(delta)}` : '=';
        chip.className = `delta ${delta > 0 ? 'sube' : delta < 0 ? 'baja' : ''}`;
    }

    async function decidir(opcion) {
        if (contestando || terminado) return;
        contestando = true;
        const q = items[i];
        const caja = raiz.querySelector('.opciones');
        caja.classList.add('bloqueadas');

        let r;
        try {
            r = await api.responder(datos.partida, { item: q.id, respuesta: opcion });
        } catch (e) {
            ctx.aviso(e.message);
            caja.classList.remove('bloqueadas');
            contestando = false;
            return;
        }
        if (terminado) return;

        const botones = [...caja.querySelectorAll('.opcion')];
        botones.forEach((b, k) => b.classList.add(k === opcion ? (r.acierto ? 'correcta' : 'incorrecta') : k === r.correcta ? 'correcta' : 'apagada'));
        moverBarra('bienestar', r.barras.bienestar, r.delta.bienestar);
        moverBarra('negocio', r.barras.negocio, r.delta.negocio);

        puntos = r.puntos;
        ctx.marcador(puntos);
        estados[i] = r.acierto ? 'ok' : 'no';
        if (r.acierto) {
            sonido.bien();
            if (r.puntos_item) flotar(`+${r.puntos_item}`, botones[opcion]);
        } else {
            sonido.mal();
            repaso.push({ titulo: q.situacion, texto: `Mejor opción: ${q.opciones[r.correcta]}. ${r.explicacion}` });
        }

        const ultima = i === items.length - 1;
        raiz.querySelector('.retro-slot').innerHTML = `
            <div class="panel retro ${r.acierto ? '' : 'mal'}">
                <div class="titulo">${r.acierto ? '¡Buena decisión!' : 'Hay una opción mejor'}</div>
                <p>${esc(r.explicacion)}</p>
                <button class="btn btn-xl" data-sig>${ultima ? 'Ver cómo terminó tu negocio' : 'Siguiente mes'}</button>
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
        const promedio = (barras.bienestar + barras.negocio) / 2;
        const estado = promedio >= 75 ? '¡Tu negocio prospera!' : promedio >= 50 ? 'Tu negocio va estable' : 'Tu negocio está en riesgo';
        try {
            const resumen = await api.terminar(datos.partida);
            ctx.alTerminar(resumen, repaso, {
                titulo: estado,
                html: `
                    <div class="cifras">
                        <div><small>💰 ${esc(negocio.barras[0])}</small><b>${barras.bienestar}</b></div>
                        <div><small>${esc(negocio.icono)} ${esc(negocio.barras[1])}</small><b>${barras.negocio}</b></div>
                    </div>
                    <p>${resumen.aciertos} de ${resumen.total_items} mejores decisiones</p>`,
                cierre: datos.cierre,
            });
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    pintar();
    return () => { terminado = true; };
}
