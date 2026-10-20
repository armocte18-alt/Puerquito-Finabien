/*
 * Puerquito Finabien – motor del juego.
 *
 * El lienzo usa un espacio lógico de 1080 px de alto (el ancho se adapta a la
 * proporción de la pantalla), así que se juega igual en un monitor, una TV
 * o un proyector. Toda la dificultad viene de config/juego.php.
 */
(function () {
    'use strict';

    const CFG = window.PUERQUITO;
    const G = CFG.grupo;
    const OBJ = CFG.objetos;
    const fmt = new Intl.NumberFormat('es-MX');
    const pesos = (n) => '$' + fmt.format(n);
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const $ = (id) => document.getElementById(id);
    const lienzo = $('lienzo');
    const ctx = lienzo.getContext('2d');

    const ui = {
        hud: $('hud'),
        puntos: $('hud-puntos'),
        ahorro: $('hud-ahorro'),
        tiempo: $('hud-tiempo'),
        barra: $('hud-barra'),
        combo: $('hud-combo'),
        comboCaja: $('hud-combo-caja'),
        vidas: $('hud-vidas'),
        vidasCaja: $('hud-vidas-caja'),
        poderes: $('hud-poderes'),
        leccion: $('leccion'),
        cuenta: $('cuenta'),
        intro: $('capa-intro'),
        pausa: $('capa-pausa'),
        fin: $('capa-fin'),
        sonido: $('btn-sonido'),
    };

    // ---------------------------------------------------------------
    // Escala y fondo
    // ---------------------------------------------------------------
    const vista = { W: 1920, H: 1080, escala: 1, dpr: 1, suelo: 990 };
    let fondo = null;

    function ajustar() {
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        vista.dpr = Math.min(window.devicePixelRatio || 1, 2);
        vista.escala = ch / 1080;
        vista.W = cw / vista.escala;
        vista.H = 1080;
        if (vista.W < 1280) {
            vista.escala = cw / 1280;
            vista.W = 1280;
            vista.H = ch / vista.escala;
        }
        vista.suelo = vista.H - 90;
        lienzo.width = Math.round(cw * vista.dpr);
        lienzo.height = Math.round(ch * vista.dpr);
        lienzo.style.width = cw + 'px';
        lienzo.style.height = ch + 'px';
        fondo = pintarFondo();
        if (alcancia) alcancia.x = Math.min(Math.max(alcancia.x, alcancia.ancho / 2), vista.W - alcancia.ancho / 2);
    }

    function pintarFondo() {
        const c = document.createElement('canvas');
        c.width = lienzo.width;
        c.height = lienzo.height;
        const f = c.getContext('2d');
        const k = vista.escala * vista.dpr;
        f.scale(k, k);
        const { W, H, suelo } = vista;

        const cielo = f.createLinearGradient(0, 0, 0, suelo);
        cielo.addColorStop(0, '#bfe9ff');
        cielo.addColorStop(0.6, '#e6f7ef');
        cielo.addColorStop(1, '#f6fbe9');
        f.fillStyle = cielo;
        f.fillRect(0, 0, W, H);

        // sol
        const sol = f.createRadialGradient(W * 0.85, 150, 10, W * 0.85, 150, 220);
        sol.addColorStop(0, 'rgba(255,236,150,.95)');
        sol.addColorStop(0.35, 'rgba(255,236,150,.5)');
        sol.addColorStop(1, 'rgba(255,236,150,0)');
        f.fillStyle = sol;
        f.fillRect(W * 0.85 - 220, 0, 440, 400);

        // colinas
        const colina = (y, amp, color, fase) => {
            f.fillStyle = color;
            f.beginPath();
            f.moveTo(0, suelo);
            for (let x = 0; x <= W + 40; x += 40) f.lineTo(x, y + Math.sin(x / 260 + fase) * amp + Math.sin(x / 90 + fase * 2) * amp * 0.2);
            f.lineTo(W, suelo);
            f.closePath();
            f.fill();
        };
        colina(suelo - 260, 50, '#cfeccc', 1);
        colina(suelo - 170, 40, '#a9dca5', 3);

        // ciudad lejana
        f.fillStyle = 'rgba(29,92,63,.18)';
        let x = 20;
        let semilla = 7;
        const azar = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280);
        while (x < W) {
            const w = 50 + azar() * 70;
            const h = 80 + azar() * 170;
            f.fillRect(x, suelo - 120 - h, w, h + 120);
            x += w + 14 + azar() * 40;
        }
        colina(suelo - 80, 22, '#7cc47d', 5);

        // suelo
        const tierra = f.createLinearGradient(0, suelo, 0, H);
        tierra.addColorStop(0, '#4f9a4f');
        tierra.addColorStop(0.15, '#3c7f3f');
        tierra.addColorStop(1, '#245c2a');
        f.fillStyle = tierra;
        f.fillRect(0, suelo, W, H - suelo);
        f.fillStyle = 'rgba(255,255,255,.08)';
        for (let i = 0; i < W; i += 70) f.fillRect(i, suelo + 22, 36, 6);
        return c;
    }

    // ---------------------------------------------------------------
    // Alcancía
    // ---------------------------------------------------------------
    const sprite = new Image();
    sprite.src = CFG.sprite;

    let alcancia = null;

    function nuevaAlcancia() {
        const ancho = 300 * Math.min(G.escala, 1.15);
        return {
            x: vista.W / 2,
            ancho,
            alto: ancho * (789 / 921),
            vx: 0,
            inclinacion: 0, // se ladea hacia donde se mueve
            aplastar: 0, // animación al atrapar
            sacudir: 0, // animación al tocar trampa
        };
    }

    // Zona de captura: la ranura en el lomo de la alcancía (en coordenadas lógicas).
    function zonaCaptura() {
        const a = alcancia;
        const ancho = a.ancho * 0.62 * G.margen_atrape;
        const arriba = vista.suelo - a.alto * 0.98;
        return { x1: a.x - ancho / 2, x2: a.x + ancho / 2, y1: arriba, y2: arriba + a.alto * 0.45 };
    }

    // ---------------------------------------------------------------
    // Estado de la partida
    // ---------------------------------------------------------------
    let estado = 'intro'; // intro | cuenta | jugando | pausa | fin
    let p = null; // partida

    function nuevaPartida() {
        alcancia = nuevaAlcancia();
        p = {
            t: 0,
            restante: G.duracion,
            puntos: 0,
            ahorro: 0,
            monedas: 0,
            billetes: 0,
            trampas: 0,
            vidas: G.vidas,
            combo: 0,
            mejorCombo: 0,
            proximo: 0.6,
            objetos: [],
            particulas: [],
            textos: [],
            poderes: { estrella: 0, iman: 0 },
            temblor: 0,
            destello: 0,
            leccionesVistas: {},
            ultimoTic: Math.ceil(G.duracion),
        };
        actualizarHud(true);
    }

    function multiplicador() {
        const c = CFG.combo;
        const base = 1 + Math.floor(p.combo / c.cada) * c.incremento;
        return Math.min(base, c.maximo) * (p.poderes.estrella > 0 ? 2 : 1);
    }

    // Elige una clave de un mapa {clave: peso}.
    function sortear(pesosMap) {
        const claves = Object.keys(pesosMap);
        let total = 0;
        for (const k of claves) total += pesosMap[k];
        let r = Math.random() * total;
        for (const k of claves) {
            r -= pesosMap[k];
            if (r <= 0) return k;
        }
        return claves[claves.length - 1];
    }

    function generar() {
        const progreso = p.t / G.duracion;
        const r = Math.random();
        let clave;
        if (r < G.probabilidad_poder) {
            const poderes = Object.assign({}, G.poderes);
            if (!G.vidas || p.vidas >= G.vidas + 2) delete poderes.corazon;
            clave = sortear(poderes);
        } else if (r < G.probabilidad_poder + G.probabilidad_trampa * (0.75 + progreso * 0.5)) {
            clave = sortear(G.trampas);
        } else {
            clave = sortear(G.dinero);
        }

        const def = OBJ[clave];
        const esBillete = def.tipo === 'billete' || clave === 'falso';
        const tam = (esBillete ? 150 : def.tipo === 'moneda' ? 92 : 112) * G.escala;
        const [vmin, vmax] = G.velocidad;
        const vel = (vmin + Math.random() * (vmax - vmin)) * (1 + G.aceleracion * progreso);
        const margen = tam * 0.6;

        p.objetos.push({
            clave,
            def,
            x: margen + Math.random() * (vista.W - margen * 2),
            y: -tam,
            tam,
            vy: vel * (esBillete ? 0.82 : 1),
            fase: Math.random() * Math.PI * 2,
            zig: Math.random() < G.zigzag ? 90 + Math.random() * 120 : 0,
            balanceo: esBillete ? 0.35 : 0,
            vida: 0,
        });
    }

    // ---------------------------------------------------------------
    // Entrada: ratón, táctil, teclado y gamepad
    // ---------------------------------------------------------------
    const entrada = { izq: false, der: false, punteroX: null, ultimo: 'puntero', pad: {} };

    function aLogico(clientX) {
        const rect = lienzo.getBoundingClientRect();
        return ((clientX - rect.left) / rect.width) * vista.W;
    }

    lienzo.addEventListener('pointermove', (e) => {
        entrada.punteroX = aLogico(e.clientX);
        entrada.ultimo = 'puntero';
    });
    lienzo.addEventListener('pointerdown', (e) => {
        entrada.punteroX = aLogico(e.clientX);
        entrada.ultimo = 'puntero';
        Sonido.preparar();
    });

    const TECLAS_IZQ = ['ArrowLeft', 'a', 'A'];
    const TECLAS_DER = ['ArrowRight', 'd', 'D'];

    document.addEventListener('keydown', (e) => {
        const enCampo = e.target.tagName === 'INPUT';
        if (TECLAS_IZQ.includes(e.key) && !enCampo) {
            entrada.izq = true;
            entrada.ultimo = 'teclado';
            if (estado === 'jugando') e.preventDefault();
        } else if (TECLAS_DER.includes(e.key) && !enCampo) {
            entrada.der = true;
            entrada.ultimo = 'teclado';
            if (estado === 'jugando') e.preventDefault();
        } else if ((e.key === 'p' || e.key === 'P' || e.key === 'Escape') && !enCampo) {
            if (estado === 'jugando') pausar();
            else if (estado === 'pausa') continuar();
        } else if ((e.key === 'm' || e.key === 'M') && !enCampo) {
            alternarSonido();
        } else if ((e.key === 'f' || e.key === 'F') && !enCampo) {
            pantallaCompleta();
        } else if ((e.key === 'Enter' || e.key === ' ') && !enCampo && estado === 'intro' && document.activeElement.tagName !== 'A') {
            e.preventDefault();
            comenzar();
        }
    });
    document.addEventListener('keyup', (e) => {
        if (TECLAS_IZQ.includes(e.key)) entrada.izq = false;
        if (TECLAS_DER.includes(e.key)) entrada.der = false;
    });

    function leerControl() {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const pad of pads) {
            if (!pad) continue;
            const b = (n) => !!(pad.buttons[n] && pad.buttons[n].pressed);
            const eje = Math.abs(pad.axes[0]) > 0.2 ? pad.axes[0] : 0;
            const estadoPad = {
                eje: b(14) ? -1 : b(15) ? 1 : eje,
                a: b(0),
                inicio: b(9),
            };
            const antes = entrada.pad;
            if (estadoPad.eje !== 0) entrada.ultimo = 'control';
            if (estadoPad.inicio && !antes.inicio) {
                if (estado === 'jugando') pausar();
                else if (estado === 'pausa') continuar();
            }
            if (estadoPad.a && !antes.a) {
                if (estado === 'intro') comenzar();
                else if (estado === 'pausa') continuar();
                else if (estado === 'fin' && document.activeElement) document.activeElement.click();
            }
            entrada.pad = estadoPad;
            return;
        }
        entrada.pad = {};
    }

    // ---------------------------------------------------------------
    // Ciclo principal
    // ---------------------------------------------------------------
    let anterior = performance.now();

    function ciclo(ahora) {
        const dt = Math.min((ahora - anterior) / 1000, 0.05);
        anterior = ahora;
        leerControl();
        if (estado === 'jugando') actualizar(dt);
        else if (p) actualizarDecoracion(dt);
        dibujar(ahora / 1000);
        requestAnimationFrame(ciclo);
    }

    function moverAlcancia(dt) {
        const a = alcancia;
        const vmax = G.velocidad_alcancia;
        const antes = a.x;
        if (entrada.ultimo === 'control' && entrada.pad.eje) {
            a.x += entrada.pad.eje * vmax * dt;
        } else if (entrada.ultimo === 'teclado' && (entrada.izq || entrada.der)) {
            const dir = (entrada.der ? 1 : 0) - (entrada.izq ? 1 : 0);
            a.vx += (dir * vmax - a.vx) * Math.min(1, dt * 14);
            a.x += a.vx * dt;
        } else if (entrada.ultimo === 'puntero' && entrada.punteroX !== null) {
            a.x += (entrada.punteroX - a.x) * Math.min(1, dt * 16);
            a.vx = 0;
        } else {
            a.vx *= 0.8;
            a.x += a.vx * dt;
        }
        a.x = Math.min(Math.max(a.x, a.ancho / 2), vista.W - a.ancho / 2);
        const vel = dt > 0 ? (a.x - antes) / dt : 0;
        const meta = Math.max(-1, Math.min(1, vel / vmax)) * 0.12;
        a.inclinacion += (meta - a.inclinacion) * Math.min(1, dt * 10);
        a.aplastar = Math.max(0, a.aplastar - dt * 4);
        a.sacudir = Math.max(0, a.sacudir - dt * 2.5);
    }

    function actualizar(dt) {
        p.t += dt;
        p.restante = Math.max(0, G.duracion - p.t);

        for (const k in p.poderes) p.poderes[k] = Math.max(0, p.poderes[k] - dt);

        moverAlcancia(dt);

        // Generación: más rápida conforme avanza el tiempo y en los últimos 10 s.
        p.proximo -= dt;
        if (p.proximo <= 0) {
            generar();
            const progreso = p.t / G.duracion;
            const frenesi = p.restante < 10 ? 0.7 : 1;
            p.proximo = G.intervalo * (1 - 0.35 * progreso) * frenesi * (0.75 + Math.random() * 0.5);
        }

        const zona = zonaCaptura();
        const imanActivo = p.poderes.iman > 0;

        for (let i = p.objetos.length - 1; i >= 0; i--) {
            const o = p.objetos[i];
            o.vida += dt;
            o.y += o.vy * dt;
            if (o.zig) o.x += Math.cos(o.vida * 3 + o.fase) * o.zig * dt;
            if (imanActivo && (o.def.tipo === 'moneda' || o.def.tipo === 'billete') && o.y > zona.y1 - 600) {
                o.x += (alcancia.x - o.x) * Math.min(1, dt * 5);
            }
            o.x = Math.min(Math.max(o.x, o.tam * 0.4), vista.W - o.tam * 0.4);

            const base = o.y + o.tam * 0.3;
            if (base >= zona.y1 && o.y - o.tam * 0.3 <= zona.y2 && o.x >= zona.x1 && o.x <= zona.x2) {
                atrapar(o);
                p.objetos.splice(i, 1);
            } else if (o.y - o.tam > vista.suelo + 40) {
                p.objetos.splice(i, 1);
            }
        }

        actualizarDecoracion(dt);

        // Tic-tac de los últimos segundos.
        const seg = Math.ceil(p.restante);
        if (seg !== p.ultimoTic) {
            p.ultimoTic = seg;
            if (seg <= 5 && seg > 0) Sonido.reproducir('tic');
        }

        actualizarHud();

        if (p.restante <= 0) terminar('tiempo');
        else if (G.vidas && p.vidas <= 0) terminar('vidas');
    }

    function actualizarDecoracion(dt) {
        for (let i = p.particulas.length - 1; i >= 0; i--) {
            const q = p.particulas[i];
            q.vida -= dt;
            q.x += q.vx * dt;
            q.y += q.vy * dt;
            q.vy += 1400 * dt * q.gravedad;
            if (q.vida <= 0) p.particulas.splice(i, 1);
        }
        for (let i = p.textos.length - 1; i >= 0; i--) {
            const tx = p.textos[i];
            tx.vida -= dt;
            tx.y -= 120 * dt;
            if (tx.vida <= 0) p.textos.splice(i, 1);
        }
        p.temblor = Math.max(0, p.temblor - dt * 2.2);
        p.destello = Math.max(0, p.destello - dt * 2.5);
    }

    function chispas(x, y, colores, n, fuerza) {
        if (reducirMovimiento) n = Math.ceil(n / 3);
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2;
            const v = (0.3 + Math.random()) * (fuerza || 500);
            p.particulas.push({
                x, y,
                vx: Math.cos(a) * v,
                vy: Math.sin(a) * v - 300,
                vida: 0.5 + Math.random() * 0.5,
                max: 1,
                tam: 6 + Math.random() * 10,
                color: colores[i % colores.length],
                gravedad: 1,
            });
        }
    }

    function flotante(texto, x, y, color, tam) {
        // Evita que los letreros recientes se encimen.
        for (const tx of p.textos) {
            if (tx.vida > 0.5 && Math.abs(tx.x - x) < 420 && Math.abs(tx.y - y) < (tam || 64)) y = tx.y - (tam || 64) * 1.1;
        }
        p.textos.push({ texto, x, y, color, tam: tam || 64, vida: 1.1, max: 1.1 });
    }

    function atrapar(o) {
        const def = o.def;
        const a = alcancia;
        const yRanura = vista.suelo - a.alto * 0.9;

        if (def.tipo === 'moneda' || def.tipo === 'billete') {
            p.combo++;
            p.mejorCombo = Math.max(p.mejorCombo, p.combo);
            const ganados = Math.round(def.puntos * multiplicador());
            p.puntos += ganados;
            p.ahorro += def.valor;
            if (def.tipo === 'moneda') p.monedas++;
            else p.billetes++;
            a.aplastar = 1;
            chispas(o.x, yRanura, def.tipo === 'moneda' ? ['#ffd84d', '#fff3b0', '#e0a92a'] : ['#7fe0a0', '#ffffff', '#ffd84d'], def.tipo === 'moneda' ? 14 : 22);
            flotante('+' + fmt.format(ganados), o.x, yRanura - 40, '#1d5c3f', def.tipo === 'billete' ? 72 : 60);
            Sonido.reproducir(def.tipo === 'moneda' ? 'moneda' : 'billete', p.combo);
            const nivel = p.combo / CFG.combo.cada;
            if (Number.isInteger(nivel) && 1 + nivel * CFG.combo.incremento <= CFG.combo.maximo) {
                flotante('¡Combo ×' + multiplicador().toString().replace('.', ',') + '!', a.x, yRanura - 140, '#d18b00', 70);
            }
        } else if (def.tipo === 'trampa') {
            p.trampas++;
            p.combo = 0;
            p.puntos = Math.max(0, p.puntos + def.puntos);
            if (G.vidas) p.vidas--;
            a.sacudir = 1;
            p.temblor = reducirMovimiento ? 0 : 1;
            p.destello = 1;
            chispas(o.x, yRanura, ['#e04a3b', '#5a2e1b', '#999'], 16, 400);
            flotante(def.etiqueta, a.x, yRanura - 140, '#c62828', 70);
            flotante(fmt.format(def.puntos), o.x, yRanura - 40, '#c62828', 56);
            Sonido.reproducir('trampa');
            mostrarLeccion(o.clave, def);
        } else if (def.tipo === 'poder') {
            if (o.clave === 'corazon') p.vidas++;
            else p.poderes[o.clave] = def.duracion;
            chispas(o.x, yRanura, ['#ffd84d', '#ff8aa0', '#7fe0a0', '#8ecbff'], 26);
            flotante(def.etiqueta, a.x, yRanura - 140, '#7a3fb5', 70);
            Sonido.reproducir('poder');
        }
    }

    // Cada trampa enseña su lección la primera vez que se atrapa.
    let temporizadorLeccion = null;
    function mostrarLeccion(clave, def) {
        if (p.leccionesVistas[clave]) return;
        p.leccionesVistas[clave] = true;
        ui.leccion.innerHTML = '';
        const titulo = document.createElement('strong');
        titulo.textContent = def.etiqueta;
        ui.leccion.append(titulo, ' ', def.leccion);
        ui.leccion.hidden = false;
        clearTimeout(temporizadorLeccion);
        temporizadorLeccion = setTimeout(() => (ui.leccion.hidden = true), 4500);
    }

    // ---------------------------------------------------------------
    // Dibujo
    // ---------------------------------------------------------------
    function dibujar(tiempo) {
        const k = vista.escala * vista.dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        if (fondo) ctx.drawImage(fondo, 0, 0);
        ctx.setTransform(k, 0, 0, k, 0, 0);
        if (!p) {
            dibujarAlcancia(tiempo);
            return;
        }

        if (p.temblor > 0) ctx.translate((Math.random() - 0.5) * 24 * p.temblor, (Math.random() - 0.5) * 16 * p.temblor);

        // nubes en movimiento
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (let i = 0; i < 4; i++) {
            const x = ((tiempo * (14 + i * 6) + i * 620) % (vista.W + 500)) - 250;
            const y = 110 + i * 70 + (i % 2) * 40;
            nube(x, y, 1 + (i % 3) * 0.25);
        }

        // sombra de objetos
        for (const o of p.objetos) {
            const cerca = Math.max(0, Math.min(1, o.y / vista.suelo));
            ctx.fillStyle = `rgba(0,0,0,${0.12 * cerca})`;
            ctx.beginPath();
            ctx.ellipse(o.x, vista.suelo + 12, o.tam * 0.35 * cerca, 8 * cerca, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        dibujarAlcancia(tiempo);

        for (const o of p.objetos) {
            ctx.save();
            ctx.translate(o.x, o.y);
            if (o.balanceo) ctx.rotate(Math.sin(o.vida * 4 + o.fase) * o.balanceo);
            if (o.def.tipo === 'trampa' && G.resaltar_trampas && o.clave !== 'falso') {
                // Halo rojo para que los más pequeños reconozcan las trampas.
                const pulso = 0.55 + Math.sin(tiempo * 8) * 0.2;
                ctx.strokeStyle = `rgba(224,74,59,${pulso})`;
                ctx.lineWidth = 6;
                ctx.setLineDash([14, 10]);
                ctx.beginPath();
                ctx.arc(0, 0, o.tam * 0.58, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            Dibujo.objeto(ctx, o.clave, o.tam, o.vida + o.fase);
            ctx.restore();
        }

        for (const q of p.particulas) {
            ctx.globalAlpha = Math.max(0, q.vida / q.max);
            ctx.fillStyle = q.color;
            ctx.beginPath();
            ctx.arc(q.x, q.y, q.tam * (0.5 + q.vida), 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        for (const tx of p.textos) {
            const a = Math.min(1, tx.vida / 0.4);
            ctx.globalAlpha = a;
            ctx.font = `800 ${tx.tam}px "Baloo 2", "Trebuchet MS", system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.lineWidth = 10;
            ctx.strokeStyle = '#fff';
            ctx.lineJoin = 'round';
            const x = Math.min(Math.max(tx.x, 220), vista.W - 220);
            ctx.strokeText(tx.texto, x, tx.y);
            ctx.fillStyle = tx.color;
            ctx.fillText(tx.texto, x, tx.y);
        }
        ctx.globalAlpha = 1;

        // destello rojo al tocar una trampa
        if (p.destello > 0) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            const g = ctx.createRadialGradient(lienzo.width / 2, lienzo.height / 2, lienzo.height * 0.3, lienzo.width / 2, lienzo.height / 2, lienzo.height);
            g.addColorStop(0, 'rgba(224,74,59,0)');
            g.addColorStop(1, `rgba(224,74,59,${0.45 * p.destello})`);
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, lienzo.width, lienzo.height);
        }
    }

    function nube(x, y, s) {
        ctx.beginPath();
        ctx.arc(x, y, 38 * s, 0, Math.PI * 2);
        ctx.arc(x + 44 * s, y - 18 * s, 48 * s, 0, Math.PI * 2);
        ctx.arc(x + 96 * s, y, 36 * s, 0, Math.PI * 2);
        ctx.rect(x, y, 96 * s, 36 * s);
        ctx.fill();
    }

    function dibujarAlcancia(tiempo) {
        const a = alcancia;
        const sx = 1 + a.aplastar * 0.08;
        const sy = 1 - a.aplastar * 0.08;
        const bob = estado === 'jugando' && !reducirMovimiento ? Math.sin(tiempo * 6) * 3 : 0;
        const giro = a.sacudir > 0 ? Math.sin(a.sacudir * 30) * 0.08 * a.sacudir : 0;

        // sombra
        ctx.fillStyle = 'rgba(0,0,0,.22)';
        ctx.beginPath();
        ctx.ellipse(a.x, vista.suelo + 6, a.ancho * 0.42, 18, 0, 0, Math.PI * 2);
        ctx.fill();

        // aura de poderes
        if (p && (p.poderes.iman > 0 || p.poderes.estrella > 0)) {
            const color = p.poderes.estrella > 0 ? '255,216,77' : '255,90,80';
            const g = ctx.createRadialGradient(a.x, vista.suelo - a.alto / 2, 20, a.x, vista.suelo - a.alto / 2, a.ancho * 0.8);
            g.addColorStop(0, `rgba(${color},.35)`);
            g.addColorStop(1, `rgba(${color},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(a.x - a.ancho, vista.suelo - a.alto * 1.4, a.ancho * 2, a.alto * 1.5);
        }

        ctx.save();
        ctx.translate(a.x, vista.suelo + bob);
        ctx.rotate(giro + a.inclinacion);
        ctx.scale(sx, sy);
        if (sprite.complete && sprite.naturalWidth) {
            ctx.drawImage(sprite, -a.ancho / 2, -a.alto, a.ancho, a.alto);
        } else {
            ctx.fillStyle = '#9bd49b';
            ctx.beginPath();
            ctx.ellipse(0, -a.alto / 2, a.ancho / 2, a.alto / 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();

    }

    // ---------------------------------------------------------------
    // HUD
    // ---------------------------------------------------------------
    const cache = {};
    function poner(el, clave, valor) {
        if (cache[clave] === valor) return;
        cache[clave] = valor;
        el.textContent = valor;
    }

    function actualizarHud(forzar) {
        if (forzar) for (const k in cache) delete cache[k];
        poner(ui.puntos, 'puntos', fmt.format(p.puntos));
        poner(ui.ahorro, 'ahorro', pesos(p.ahorro));
        const seg = Math.ceil(p.restante);
        poner(ui.tiempo, 'tiempo', String(seg));
        ui.tiempo.classList.toggle('hud__tiempo--alerta', seg <= 10);
        ui.barra.style.transform = `scaleX(${p.restante / G.duracion})`;
        const m = multiplicador();
        poner(ui.combo, 'combo', '×' + m.toString().replace('.', ','));
        ui.comboCaja.classList.toggle('hud__combo--activo', m > 1);

        if (G.vidas) {
            poner(ui.vidas, 'vidas', '❤'.repeat(Math.max(0, p.vidas)) + '♡'.repeat(Math.max(0, G.vidas - p.vidas)));
        } else {
            ui.vidasCaja.hidden = true;
        }

        const activos = Object.entries(p.poderes).filter(([, v]) => v > 0).map(([k, v]) => `${k === 'estrella' ? '⭐ ×2' : '🧲 Imán'} ${Math.ceil(v)}s`).join('   ');
        poner(ui.poderes, 'poderes', activos);
    }

    // ---------------------------------------------------------------
    // Flujo de pantallas
    // ---------------------------------------------------------------
    function mostrar(capa) {
        [ui.intro, ui.pausa, ui.fin].forEach((c) => (c.hidden = c !== capa));
        if (capa) {
            const foco = capa.querySelector('[autofocus], .boton');
            if (foco) setTimeout(() => foco.focus(), 30);
        }
    }

    let temporizadorCuenta = null;
    function comenzar() {
        if (estado === 'cuenta') return;
        Sonido.preparar();
        nuevaPartida();
        mostrar(null);
        ui.hud.hidden = false;
        ui.leccion.hidden = true;
        document.body.classList.add('jugando');
        estado = 'cuenta';
        let n = 3;
        const paso = () => {
            if (n > 0) {
                ui.cuenta.textContent = n;
                ui.cuenta.hidden = false;
                ui.cuenta.classList.remove('cuenta--anima');
                void ui.cuenta.offsetWidth;
                ui.cuenta.classList.add('cuenta--anima');
                Sonido.reproducir('cuenta', false);
                n--;
                temporizadorCuenta = setTimeout(paso, 750);
            } else {
                ui.cuenta.textContent = '¡A ahorrar!';
                Sonido.reproducir('cuenta', true);
                estado = 'jugando';
                anterior = performance.now();
                temporizadorCuenta = setTimeout(() => (ui.cuenta.hidden = true), 700);
            }
        };
        paso();
    }

    function pausar() {
        if (estado !== 'jugando') return;
        estado = 'pausa';
        document.body.classList.remove('jugando');
        mostrar(ui.pausa);
    }

    function continuar() {
        if (estado !== 'pausa') return;
        mostrar(null);
        document.body.classList.add('jugando');
        anterior = performance.now();
        estado = 'jugando';
    }

    function terminar(motivo) {
        estado = 'fin';
        clearTimeout(temporizadorCuenta);
        document.body.classList.remove('jugando');
        entrada.izq = entrada.der = false;
        Sonido.reproducir('fin');

        $('fin-titulo').textContent = motivo === 'vidas' ? '¡Te quedaste sin vidas!' : '¡Se acabó el tiempo!';
        $('fin-puntos').textContent = fmt.format(p.puntos);
        $('fin-ahorro').textContent = pesos(p.ahorro);
        $('fin-monedas').textContent = p.monedas;
        $('fin-billetes').textContent = p.billetes;
        $('fin-trampas').textContent = p.trampas;
        $('fin-combo').textContent = p.mejorCombo;
        $('fin-consejo').textContent = G.consejos[Math.floor(Math.random() * G.consejos.length)];

        const form = $('form-guardar');
        form.querySelector('.fin__fila').hidden = false;
        form.querySelector('button').disabled = false;
        $('fin-mensaje').textContent = '';
        const campo = $('fin-nombre');
        try { campo.value = localStorage.getItem('puerquito.nombre') || ''; } catch (e) { /* sin almacenamiento */ }

        cargarTabla();
        mostrar(ui.fin);
        setTimeout(() => (campo.value ? $('btn-guardar') : campo).focus(), 40);
    }

    function pintarTabla(puntajes, resaltarId) {
        const ol = $('tabla');
        ol.innerHTML = '';
        if (!puntajes.length) {
            const li = document.createElement('li');
            li.className = 'tabla__vacia';
            li.textContent = '¡Sé el primero en la tabla!';
            ol.append(li);
            return;
        }
        puntajes.forEach((pt, i) => {
            const li = document.createElement('li');
            if (pt.id === resaltarId) li.className = 'tabla__mia';
            const medalla = document.createElement('span');
            medalla.className = 'tabla__pos';
            medalla.textContent = ['🥇', '🥈', '🥉'][i] || i + 1;
            const nombre = document.createElement('span');
            nombre.className = 'tabla__nombre';
            nombre.textContent = pt.nombre;
            const puntos = document.createElement('span');
            puntos.className = 'tabla__puntos';
            puntos.textContent = fmt.format(pt.puntos);
            li.append(medalla, nombre, puntos);
            ol.append(li);
        });
    }

    function cargarTabla() {
        fetch(CFG.rutas.tabla, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((d) => pintarTabla(d.puntajes))
            .catch(() => pintarTabla([]));
    }

    $('form-guardar').addEventListener('submit', (e) => {
        e.preventDefault();
        const campo = $('fin-nombre');
        const nombre = campo.value.trim();
        const msg = $('fin-mensaje');
        if (!nombre) {
            msg.textContent = 'Escribe tu nombre para guardar tu puntaje.';
            campo.focus();
            return;
        }
        try { localStorage.setItem('puerquito.nombre', nombre); } catch (err) { /* sin almacenamiento */ }
        const boton = $('btn-guardar');
        boton.disabled = true;
        msg.textContent = 'Guardando…';

        fetch(CFG.rutas.guardar, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
            },
            body: JSON.stringify({
                nombre,
                grupo: CFG.clave,
                puntos: p.puntos,
                monedas: p.monedas,
                billetes: p.billetes,
                trampas: p.trampas,
                ahorro: p.ahorro,
                duracion: Math.max(1, Math.round(p.t)),
            }),
        })
            .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
            .then(({ ok, d }) => {
                if (!ok) throw new Error(d.message || 'No se pudo guardar.');
                msg.textContent = d.posicion <= 3 ? `¡Increíble! Quedaste en el lugar ${d.posicion}.` : `¡Guardado! Quedaste en el lugar ${d.posicion}.`;
                $('form-guardar').querySelector('.fin__fila').hidden = true;
                pintarTabla(d.puntajes, d.id);
                $('btn-otra').focus();
            })
            .catch((err) => {
                boton.disabled = false;
                msg.textContent = err.message && err.message !== 'Failed to fetch' ? err.message : 'Sin conexión: no se pudo guardar el puntaje.';
            });
    });

    function alternarSonido() {
        const activo = Sonido.alternar();
        ui.sonido.textContent = activo ? '🔊' : '🔇';
        ui.sonido.setAttribute('aria-label', activo ? 'Silenciar sonido' : 'Activar sonido');
    }

    function pantallaCompleta() {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
    }

    $('btn-comenzar').addEventListener('click', comenzar);
    $('btn-continuar').addEventListener('click', continuar);
    $('btn-reiniciar').addEventListener('click', comenzar);
    $('btn-otra').addEventListener('click', comenzar);
    $('btn-pausa').addEventListener('click', () => (estado === 'jugando' ? pausar() : continuar()));
    $('btn-sonido').addEventListener('click', alternarSonido);
    $('btn-pantalla').addEventListener('click', pantallaCompleta);

    // Pausa automática si se cambia de ventana.
    document.addEventListener('visibilitychange', () => document.hidden && pausar());
    window.addEventListener('blur', pausar);
    window.addEventListener('resize', ajustar);

    ui.sonido.textContent = Sonido.activo() ? '🔊' : '🔇';
    ajustar();
    alcancia = nuevaAlcancia();
    requestAnimationFrame(ciclo);
})();
