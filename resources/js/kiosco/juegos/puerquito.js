import { api } from '../api.js';
import { sonido } from '../sonido.js';
import { cuentaRegresiva, fmt, pesos } from '../util.js';
import { Dibujo } from './puerquito-dibujo.js';

const SUELO = 0.93;          // el piso está al 93% del alto del escenario
const ANCHO_ALCANCIA = 0.2;  // fracción del ancho del escenario
const PROPORCION = 789 / 921; // alto / ancho del sprite de la alcancía

/**
 * Puerquito Ahorrador: la alcancía se mueve abajo y atrapa monedas y billetes que caen;
 * las trampas (antojos, gasto hormiga, deudas, fraudes, billetes falsos) restan.
 * La secuencia la genera el servidor; aquí solo se reporta qué piezas atrapó la alcancía.
 */
export function puerquito(ctx) {
    const { datos, raiz } = ctx;
    const duracion = datos.segundos * 1000;
    const pendientes = [...datos.items].sort((a, b) => a.t - b.t);
    const activos = [];
    const atrapados = [];
    const textos = [];
    const chispas = [];
    const lecciones = new Set();
    const poderes = { estrella: 0, iman: 0 }; // ms en que termina cada poder
    const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const entrada = { izq: false, der: false, punteroX: null, ultimo: 'puntero' };
    let ahorro = 0;
    let seguidas = 0;
    let terminado = false;
    let raf = 0;
    let inicio = 0;
    let previo = 0;
    let temblor = 0;

    raiz.innerHTML = `
        ${ctx.cabecera(null, '<span data-ahorro></span>')}
        <div class="tiempo" role="progressbar" aria-label="Tiempo restante"><span></span></div>
        <div class="puerquito" aria-label="Mueve la alcancía con el dedo, el mouse o las flechas para atrapar el dinero">
            <canvas></canvas>
        </div>
        <p class="evento-linea" data-evento aria-live="polite">Atrapa monedas y billetes. Esquiva las trampas que le quitan a tu alcancía.</p>`;

    const escena = raiz.querySelector('.puerquito');
    const lienzo = escena.querySelector('canvas');
    const g = lienzo.getContext('2d');
    const $ahorro = raiz.querySelector('[data-ahorro]');
    const $evento = raiz.querySelector('[data-evento]');
    const barra = raiz.querySelector('.tiempo');
    const relleno = barra.firstElementChild;

    const sprite = new Image();
    sprite.src = datos.sprite;

    const vista = { W: 1, H: 1, dpr: 1 };
    const alcancia = { x: 0.5, inclina: 0, aplasta: 0, sacude: 0 };

    function ajustar() {
        const r = escena.getBoundingClientRect();
        vista.W = Math.max(1, r.width);
        vista.H = Math.max(1, r.height);
        vista.dpr = Math.min(devicePixelRatio || 1, 2);
        lienzo.width = Math.round(vista.W * vista.dpr);
        lienzo.height = Math.round(vista.H * vista.dpr);
        if (!raf && !terminado) dibujar(0); // antes de la cuenta regresiva ya se ve la alcancía
    }
    const observador = new ResizeObserver(ajustar);

    const racha = () => {
        const r = datos.racha;
        return Math.min(r.maximo, 1 + Math.floor(seguidas / r.cada) * r.incremento);
    };
    const anchoAlcancia = () => Math.min(vista.W * ANCHO_ALCANCIA, (vista.H * 0.42) / PROPORCION);
    // Billetes (y el billete falso) más grandes que las monedas; trampas y poderes en medio.
    const tamano = (tipo) => vista.H * datos.escala * (tipo.startsWith('b') || tipo === 'falso' ? 0.2 : tipo.startsWith('m') ? 0.12 : 0.14);

    function pintarMarcador() {
        const r = racha();
        $ahorro.textContent = `${pesos(ahorro)} ahorrados${r > 1 ? ` · Racha ×${String(r).replace('.', ',')}` : ''}`;
    }

    function evento(texto, mal = false) {
        $evento.textContent = texto;
        $evento.classList.toggle('mal', mal);
    }

    function flotante(texto, x, y, color) {
        // Evita que los letreros recientes se encimen.
        for (const t of textos) if (t.vida > 0.5 && Math.abs(t.x - x) < vista.W * 0.2 && Math.abs(t.y - y) < vista.H * 0.06) y = t.y - vista.H * 0.07;
        textos.push({ texto, x, y, color, vida: 1.1 });
    }

    function lluvia(x, y, colores, n) {
        for (let i = 0; i < (reducir ? Math.ceil(n / 3) : n); i++) {
            const a = Math.random() * Math.PI * 2;
            const v = (0.3 + Math.random()) * vista.H * 0.5;
            chispas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - vista.H * 0.3, vida: 0.5 + Math.random() * 0.5, color: colores[i % colores.length] });
        }
    }

    function atrapar(a, ahora) {
        atrapados.push(a.item.id);
        const tipo = a.item.tipo;
        const x = a.x;
        const y = vista.H * SUELO - anchoAlcancia() * PROPORCION * 0.9;

        if (datos.dinero[tipo]) {
            const d = datos.dinero[tipo];
            seguidas++;
            ahorro += d.valor;
            alcancia.aplasta = 1;
            sonido.bien();
            lluvia(x, y, tipo.startsWith('m') ? ['#ffd84d', '#fff3b0', '#e0a92a'] : ['#7fe0a0', '#ffffff', '#ffd84d'], tipo.startsWith('m') ? 12 : 20);
            flotante(`+${d.texto}`, x, y - vista.H * 0.04, '#f5b83d');
            if (seguidas % datos.racha.cada === 0 && 1 + (seguidas / datos.racha.cada) * datos.racha.incremento <= datos.racha.maximo) {
                flotante(`¡Racha ×${String(racha()).replace('.', ',')}!`, alcancia.x * vista.W, y - vista.H * 0.14, '#56d6c9');
            }
        } else if (datos.trampas[tipo]) {
            const tr = datos.trampas[tipo];
            seguidas = 0;
            alcancia.sacude = 1;
            temblor = reducir ? 0 : 1;
            sonido.mal();
            lluvia(x, y, ['#ff6b5b', '#5a2e1b', '#999999'], 14);
            flotante(tr.texto, alcancia.x * vista.W, y - vista.H * 0.12, '#ff6b5b');
            // Cada trampa enseña su lección la primera vez.
            evento(lecciones.has(tipo) ? `${tr.texto} Cuidado: le quitó a tu alcancía.` : `${tr.texto} ${tr.leccion}`, true);
            lecciones.add(tipo);
        } else {
            poderes[tipo] = ahora + (tipo === 'estrella' ? datos.estrella_seg : datos.iman_seg) * 1000;
            sonido.premio();
            lluvia(x, y, ['#ffd84d', '#ff8aa0', '#7fe0a0', '#8ecbff'], 22);
            flotante(datos.poderes[tipo].texto, alcancia.x * vista.W, y - vista.H * 0.12, '#c7b6ff');
            evento(tipo === 'estrella' ? `⭐ Durante ${datos.estrella_seg} segundos tus monedas valen el doble.` : `🧲 Durante ${datos.iman_seg} segundos el dinero viene hacia tu alcancía.`);
        }
        pintarMarcador();
    }

    function mover(dt) {
        const antes = alcancia.x;
        const mitad = anchoAlcancia() / 2 / vista.W;
        const velocidad = 1.1; // anchos de escenario por segundo
        if (entrada.ultimo === 'teclado' && (entrada.izq || entrada.der)) {
            alcancia.x += ((entrada.der ? 1 : 0) - (entrada.izq ? 1 : 0)) * velocidad * dt;
        } else if (entrada.ultimo === 'control' && entrada.eje) {
            alcancia.x += entrada.eje * velocidad * dt;
        } else if (entrada.ultimo === 'puntero' && entrada.punteroX !== null) {
            alcancia.x += (entrada.punteroX - alcancia.x) * Math.min(1, dt * 16);
        }
        alcancia.x = Math.min(1 - mitad, Math.max(mitad, alcancia.x));
        const meta = Math.max(-1, Math.min(1, (alcancia.x - antes) / Math.max(dt, 0.001) / velocidad)) * 0.12;
        alcancia.inclina += (meta - alcancia.inclina) * Math.min(1, dt * 10);
        alcancia.aplasta = Math.max(0, alcancia.aplasta - dt * 4);
        alcancia.sacude = Math.max(0, alcancia.sacude - dt * 2.5);
    }

    function leerControl() {
        const pad = [...(navigator.getGamepads?.() ?? [])].find(Boolean);
        if (!pad) return;
        const b = (n) => pad.buttons[n]?.pressed;
        entrada.eje = b(14) ? -1 : b(15) ? 1 : Math.abs(pad.axes[0]) > 0.2 ? pad.axes[0] : 0;
        if (entrada.eje) entrada.ultimo = 'control';
    }

    function tic(ahora) {
        if (terminado) return;
        const t = ahora - inicio;
        const dt = Math.min(0.05, (ahora - previo) / 1000);
        previo = ahora;
        leerControl();
        mover(dt);
        while (pendientes.length && pendientes[0].t <= t) {
            const item = pendientes.shift();
            activos.push({ item, x: (item.x / 100) * vista.W, dx: 0, y: 0, fase: item.id * 1.7 });
        }

        // Ranura de la alcancía: la parte de arriba del lomo.
        const ancho = anchoAlcancia();
        const alto = ancho * PROPORCION;
        const ranura = ancho * 0.62 * datos.margen_atrape;
        const cx = alcancia.x * vista.W;
        const arriba = vista.H * SUELO - alto * 0.98;
        const imanActivo = poderes.iman > t;

        for (let k = activos.length - 1; k >= 0; k--) {
            const a = activos[k];
            const tam = tamano(a.item.tipo);
            const avance = (t - a.item.t) / a.item.caida;
            a.y = -tam / 2 + avance * (vista.H * SUELO + tam / 2);
            if (imanActivo && datos.dinero[a.item.tipo] && a.y > arriba - vista.H * 0.6) a.dx += (cx - (a.x + a.dx)) * Math.min(1, dt * 5);
            const zig = a.item.zig ? Math.sin((t - a.item.t) / 1000 * 3 + a.fase) * (a.item.zig / 100) * vista.W : 0;
            a.xActual = Math.min(vista.W - tam * 0.4, Math.max(tam * 0.4, a.x + a.dx + zig));

            if (a.y + tam * 0.3 >= arriba && a.y - tam * 0.3 <= arriba + alto * 0.45 && Math.abs(a.xActual - cx) <= ranura / 2) {
                a.x = a.xActual;
                atrapar(a, t);
                activos.splice(k, 1);
            } else if (avance >= 1.1) {
                activos.splice(k, 1);
            }
        }

        for (let k = chispas.length - 1; k >= 0; k--) {
            const c = chispas[k];
            c.vida -= dt;
            c.x += c.vx * dt;
            c.y += c.vy * dt;
            c.vy += vista.H * 1.4 * dt;
            if (c.vida <= 0) chispas.splice(k, 1);
        }
        for (let k = textos.length - 1; k >= 0; k--) {
            textos[k].vida -= dt;
            textos[k].y -= vista.H * 0.11 * dt;
            if (textos[k].vida <= 0) textos.splice(k, 1);
        }
        temblor = Math.max(0, temblor - dt * 2.2);

        dibujar(t);

        const resta = Math.max(0, 1 - t / duracion);
        relleno.style.transform = `scaleX(${resta})`;
        barra.classList.toggle('urgente', resta < 0.2);
        if (resta <= 0) finalizar();
        else raf = requestAnimationFrame(tic);
    }

    function dibujar(t) {
        const { W, H, dpr } = vista;
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        g.clearRect(0, 0, W, H);
        if (temblor > 0) g.translate((Math.random() - 0.5) * 16 * temblor, (Math.random() - 0.5) * 10 * temblor);

        // Suelo y sombras de lo que cae.
        g.fillStyle = 'rgb(0 0 0 / .18)';
        g.fillRect(0, H * SUELO, W, H * (1 - SUELO));
        for (const a of activos) {
            const cerca = Math.max(0, Math.min(1, a.y / (H * SUELO)));
            g.fillStyle = `rgb(0 0 0 / ${0.2 * cerca})`;
            g.beginPath();
            g.ellipse(a.xActual ?? a.x, H * SUELO + 6, tamano(a.item.tipo) * 0.35 * cerca, 6 * cerca, 0, 0, Math.PI * 2);
            g.fill();
        }

        dibujarAlcancia(t);

        for (const a of activos) {
            const tipo = a.item.tipo;
            const tam = tamano(tipo);
            g.save();
            g.translate(a.xActual ?? a.x, a.y);
            if (tipo.startsWith('b') || tipo === 'falso') g.rotate(Math.sin((t - a.item.t) / 250 + a.fase) * 0.3);
            if (datos.trampas[tipo] && datos.resaltar_trampas && tipo !== 'falso') {
                // Halo rojo para que los más pequeños reconozcan las trampas.
                g.strokeStyle = `rgb(255 107 91 / ${0.55 + Math.sin(t / 125) * 0.2})`;
                g.lineWidth = 5;
                g.setLineDash([12, 9]);
                g.beginPath();
                g.arc(0, 0, tam * 0.58, 0, Math.PI * 2);
                g.stroke();
                g.setLineDash([]);
            }
            Dibujo.objeto(g, tipo, tam, (t - a.item.t) / 1000 + a.fase);
            g.restore();
        }

        for (const c of chispas) {
            g.globalAlpha = Math.max(0, c.vida);
            g.fillStyle = c.color;
            g.beginPath();
            g.arc(c.x, c.y, H * 0.008 * (0.5 + c.vida), 0, Math.PI * 2);
            g.fill();
        }
        g.globalAlpha = 1;

        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.lineJoin = 'round';
        g.font = `${Math.round(H * 0.065)}px "Lilita One", "Arial Rounded MT Bold", sans-serif`;
        for (const tx of textos) {
            const x = Math.min(Math.max(tx.x, W * 0.15), W * 0.85);
            g.globalAlpha = Math.min(1, tx.vida / 0.4);
            g.lineWidth = H * 0.012;
            g.strokeStyle = 'rgb(0 0 0 / .55)';
            g.strokeText(tx.texto, x, tx.y);
            g.fillStyle = tx.color;
            g.fillText(tx.texto, x, tx.y);
        }
        g.globalAlpha = 1;
    }

    function dibujarAlcancia(t) {
        const { H, W } = vista;
        const ancho = anchoAlcancia();
        const alto = ancho * PROPORCION;
        const x = alcancia.x * W;
        const suelo = H * SUELO;

        g.fillStyle = 'rgb(0 0 0 / .3)';
        g.beginPath();
        g.ellipse(x, suelo + 4, ancho * 0.42, H * 0.018, 0, 0, Math.PI * 2);
        g.fill();

        // Aura mientras dura un poder.
        if (poderes.estrella > t || poderes.iman > t) {
            const color = poderes.estrella > t ? '255 216 77' : '255 112 150';
            const aura = g.createRadialGradient(x, suelo - alto / 2, 10, x, suelo - alto / 2, ancho * 0.8);
            aura.addColorStop(0, `rgb(${color} / .4)`);
            aura.addColorStop(1, `rgb(${color} / 0)`);
            g.fillStyle = aura;
            g.fillRect(x - ancho, suelo - alto * 1.4, ancho * 2, alto * 1.5);
        }

        const rebote = reducir ? 0 : Math.sin(t / 160) * H * 0.003;
        const giro = alcancia.sacude > 0 ? Math.sin(alcancia.sacude * 30) * 0.08 * alcancia.sacude : 0;
        g.save();
        g.translate(x, suelo + rebote);
        g.rotate(giro + alcancia.inclina);
        g.scale(1 + alcancia.aplasta * 0.08, 1 - alcancia.aplasta * 0.08);
        if (sprite.complete && sprite.naturalWidth) {
            g.drawImage(sprite, -ancho / 2, -alto, ancho, alto);
        } else {
            g.fillStyle = '#9bd49b';
            g.beginPath();
            g.ellipse(0, -alto / 2, ancho / 2, alto / 2, 0, 0, Math.PI * 2);
            g.fill();
        }
        g.restore();
    }

    async function finalizar() {
        if (terminado) return;
        terminado = true;
        cancelAnimationFrame(raf);
        quitarEventos();
        try {
            const resumen = await api.terminar(datos.partida, { atrapados });
            const d = resumen.detalle;
            ctx.alTerminar(resumen, [], {
                titulo: d.trampas === 0 && d.ahorro > 0 ? '¡Alcancía sin trampas!' : d.ahorro >= d.disponible * 0.6 ? '¡Gran ahorro!' : '¡Buen intento!',
                html: `
                    <div class="cifras">
                        <div class="bien"><small>Tu alcancía juntó</small><b>${pesos(d.ahorro)}</b></div>
                        <div><small>Monedas y billetes</small><b>${fmt(d.monedas + d.billetes)}</b></div>
                        <div class="${d.trampas ? 'mal' : 'bien'}"><small>Trampas atrapadas</small><b>${fmt(d.trampas)}</b></div>
                    </div>
                    <p>Mejor racha: ${fmt(d.mejor_racha)} seguidas · Cayeron ${pesos(d.disponible)} en total</p>`,
                cierre: datos.cierre,
            });
        } catch (e) {
            ctx.aviso(e.message);
            ctx.salir();
        }
    }

    // Controles: dedo o mouse sobre el escenario, flechas o A/D, y gamepad.
    const aX = (e) => {
        const r = escena.getBoundingClientRect();
        entrada.punteroX = (e.clientX - r.left) / r.width;
        entrada.ultimo = 'puntero';
    };
    const abajo = (e) => { e.preventDefault(); escena.setPointerCapture?.(e.pointerId); aX(e); };
    const tecla = (e, valor) => {
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) entrada.izq = valor;
        else if (['ArrowRight', 'd', 'D'].includes(e.key)) entrada.der = valor;
        else return;
        e.preventDefault();
        entrada.ultimo = 'teclado';
    };
    const bajaTecla = (e) => tecla(e, true);
    const subeTecla = (e) => tecla(e, false);
    escena.addEventListener('pointerdown', abajo);
    escena.addEventListener('pointermove', aX);
    addEventListener('keydown', bajaTecla);
    addEventListener('keyup', subeTecla);

    function quitarEventos() {
        removeEventListener('keydown', bajaTecla);
        removeEventListener('keyup', subeTecla);
        observador.disconnect();
    }

    pintarMarcador();
    observador.observe(escena);
    ajustar();
    cuentaRegresiva(escena, () => !terminado).then((sigue) => {
        if (!sigue) return;
        inicio = previo = performance.now();
        raf = requestAnimationFrame(tic);
    });

    return () => { terminado = true; cancelAnimationFrame(raf); quitarEventos(); };
}
