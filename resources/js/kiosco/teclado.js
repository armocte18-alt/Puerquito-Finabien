import { esc } from './util.js';
import { sonido } from './sonido.js';

const LETRAS = ['QWERTYUIOP', 'ASDFGHJKLÑ', 'ZXCVBNM'];
const CODIGO = ['23456789', 'ABCDEFGHJK', 'MNPQRSTUVW', 'XYZ'];

/**
 * Teclado en pantalla para TV con mouse o tablet. El campo usa inputmode="none"
 * para que la tablet no abra su propio teclado encima; un teclado físico sigue funcionando.
 */
export function teclado({ modo = 'letras' } = {}) {
    const filas = modo === 'codigo' ? CODIGO : LETRAS;
    const teclas = filas.map((fila) => `<div class="fila">${[...fila].map((l) =>
        `<button type="button" class="tecla" data-tecla="${esc(l)}">${esc(l)}</button>`).join('')}</div>`).join('');

    const extra = modo === 'codigo'
        ? `<div class="fila"><button type="button" class="tecla borrar" data-tecla="borrar">⌫ Borrar</button></div>`
        : `<div class="fila"><button type="button" class="tecla ancha" data-tecla=" ">Espacio</button><button type="button" class="tecla borrar" data-tecla="borrar">⌫ Borrar</button></div>`;

    return `<div class="teclado" role="group" aria-label="Teclado">${teclas}${extra}</div>`;
}

export function conectarTeclado(raiz, campo, { max = 20, alCambiar } = {}) {
    raiz.querySelector('.teclado')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-tecla]');
        if (!b) return;
        sonido.toque();
        const t = b.dataset.tecla;
        let v = campo.value;
        if (t === 'borrar') v = v.slice(0, -1);
        else if (v.length < max) {
            // Primera letra de cada palabra en mayúscula, el resto en minúscula.
            const inicioPalabra = v.length === 0 || v.endsWith(' ');
            v += campo.dataset.modo === 'codigo' || inicioPalabra ? t : t.toLowerCase();
        }
        campo.value = v.replace(/\s{2,}/g, ' ').replace(/^\s/, '');
        alCambiar?.(campo.value);
    });
    campo.addEventListener('input', () => alCambiar?.(campo.value));
}
