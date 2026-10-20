/*
 * Puerquito Finabien – dibujo vectorial de los objetos del juego.
 *
 * Todo se dibuja con Canvas 2D (sin imágenes) para que se vea nítido en
 * cualquier resolución: monitor, TV 4K o proyector. Cada función dibuja el
 * objeto centrado en (0, 0) dentro de un cuadro de lado `t`.
 */
(function () {
    'use strict';

    const BILLETES = {
        b20: { fondo: '#5aa9d6', oscuro: '#1f5f86', claro: '#cfe9f7' },
        b50: { fondo: '#d0588f', oscuro: '#7d1f4d', claro: '#f6d3e3' },
        b100: { fondo: '#d4574a', oscuro: '#7f2219', claro: '#f7d5cf' },
        b200: { fondo: '#5aa865', oscuro: '#215f2c', claro: '#d3eed6' },
        b500: { fondo: '#4b7fc4', oscuro: '#1c3f78', claro: '#d2e0f5' },
        falso: { fondo: '#a3a8a1', oscuro: '#5d625b', claro: '#e3e5e1' },
    };

    function redondeado(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function texto(ctx, cadena, x, y, tam, color, peso) {
        ctx.font = `${peso || 800} ${tam}px "Baloo 2", "Trebuchet MS", system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color;
        ctx.fillText(cadena, x, y);
    }

    // Monedas bimetálicas: $1, $2 y $5 tienen centro dorado y anillo plateado; $10 al revés.
    function moneda(ctx, t, etiqueta, giro) {
        const r = t * 0.46;
        const diez = etiqueta === '$10';
        const anillo = diez ? ['#ffe27a', '#d19a1c', '#9c6a06'] : ['#f4f6f7', '#b8bec3', '#7d858b'];
        const centro = diez ? ['#f7f9fa', '#c3c9cd', '#8a9297'] : ['#ffe58a', '#e0a92a', '#a87410'];

        ctx.save();
        ctx.scale(Math.max(0.18, Math.abs(Math.cos(giro || 0))), 1);

        // canto
        ctx.fillStyle = anillo[2];
        ctx.beginPath();
        ctx.arc(0, t * 0.03, r, 0, Math.PI * 2);
        ctx.fill();

        let g = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r);
        g.addColorStop(0, anillo[0]);
        g.addColorStop(1, anillo[1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        g = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.05, 0, 0, r * 0.66);
        g.addColorStop(0, centro[0]);
        g.addColorStop(1, centro[1]);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.66, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = centro[2];
        ctx.lineWidth = t * 0.025;
        ctx.stroke();

        texto(ctx, etiqueta, 0, t * 0.02, t * (etiqueta.length > 2 ? 0.3 : 0.36), centro[2]);

        // brillo
        ctx.globalAlpha = 0.55;
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.ellipse(-r * 0.45, -r * 0.5, r * 0.18, r * 0.08, -0.7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function billete(ctx, t, clave, etiqueta) {
        const c = BILLETES[clave];
        const w = t * 0.98;
        const h = t * 0.52;

        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,.25)';
        ctx.shadowBlur = t * 0.06;
        ctx.shadowOffsetY = t * 0.03;
        const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        g.addColorStop(0, c.claro);
        g.addColorStop(0.45, c.fondo);
        g.addColorStop(1, c.oscuro);
        ctx.fillStyle = g;
        redondeado(ctx, -w / 2, -h / 2, w, h, t * 0.05);
        ctx.fill();
        ctx.restore();

        ctx.strokeStyle = 'rgba(255,255,255,.75)';
        ctx.lineWidth = t * 0.018;
        redondeado(ctx, -w / 2 + t * 0.045, -h / 2 + t * 0.045, w - t * 0.09, h - t * 0.09, t * 0.03);
        ctx.stroke();

        // retrato / marca de agua
        ctx.fillStyle = 'rgba(255,255,255,.55)';
        ctx.beginPath();
        ctx.ellipse(-w * 0.24, 0, h * 0.27, h * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c.oscuro;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(-w * 0.24, -h * 0.08, h * 0.11, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-w * 0.24, h * 0.17, h * 0.17, h * 0.1, 0, Math.PI, 0);
        ctx.fill();
        ctx.globalAlpha = 1;

        texto(ctx, etiqueta, w * 0.17, h * 0.03, t * 0.27, '#fff');
        ctx.lineWidth = t * 0.012;
        ctx.strokeStyle = c.oscuro;
        ctx.strokeText(etiqueta, w * 0.17, h * 0.03);

        if (clave === 'falso') {
            ctx.save();
            ctx.rotate(-0.28);
            ctx.globalAlpha = 0.85;
            ctx.strokeStyle = '#c62828';
            ctx.lineWidth = t * 0.025;
            redondeado(ctx, -w * 0.36, -h * 0.17, w * 0.72, h * 0.34, t * 0.03);
            ctx.stroke();
            texto(ctx, 'FALSO', 0, t * 0.01, t * 0.17, '#c62828');
            ctx.restore();
        }
    }

    function paleta(ctx, t, tiempo) {
        // Antojo: paleta de caramelo
        ctx.strokeStyle = '#f3e7d3';
        ctx.lineWidth = t * 0.07;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, t * 0.05);
        ctx.lineTo(0, t * 0.47);
        ctx.stroke();

        const r = t * 0.3;
        ctx.save();
        ctx.translate(0, -t * 0.12);
        ctx.fillStyle = '#ff5fa2';
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.rotate((tiempo || 0) * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = t * 0.05;
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 6; a += 0.15) {
            const rr = (a / (Math.PI * 6)) * r * 0.92;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.stroke();
        ctx.restore();
    }

    function hormiga(ctx, t, tiempo) {
        const paso = Math.sin((tiempo || 0) * 14) * 0.25;
        ctx.strokeStyle = '#2b1a12';
        ctx.lineWidth = t * 0.035;
        ctx.lineCap = 'round';
        for (let i = -1; i <= 1; i++) {
            const x = i * t * 0.12;
            const d = (i % 2 === 0 ? paso : -paso) * t * 0.2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x - t * 0.08 + d, t * 0.26);
            ctx.moveTo(x, 0);
            ctx.lineTo(x + t * 0.08 - d, -t * 0.26);
            ctx.stroke();
        }
        // antenas
        ctx.beginPath();
        ctx.moveTo(t * 0.3, -t * 0.06);
        ctx.quadraticCurveTo(t * 0.42, -t * 0.3, t * 0.48, -t * 0.26);
        ctx.moveTo(t * 0.3, -t * 0.06);
        ctx.quadraticCurveTo(t * 0.36, -t * 0.34, t * 0.4, -t * 0.36);
        ctx.stroke();

        const cuerpo = [[-t * 0.24, t * 0.16, '#5a2e1b'], [0, t * 0.1, '#6b3a22'], [t * 0.26, t * 0.12, '#5a2e1b']];
        for (const [x, r, c] of cuerpo) {
            ctx.fillStyle = c;
            ctx.beginPath();
            ctx.ellipse(x, 0, r, r * 0.85, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(t * 0.31, -t * 0.03, t * 0.04, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(t * 0.32, -t * 0.03, t * 0.02, 0, Math.PI * 2);
        ctx.fill();

        // se lleva una monedita
        ctx.save();
        ctx.translate(-t * 0.02, -t * 0.22);
        ctx.fillStyle = '#e0a92a';
        ctx.strokeStyle = '#a87410';
        ctx.lineWidth = t * 0.02;
        ctx.beginPath();
        ctx.arc(0, 0, t * 0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        texto(ctx, '$', 0, t * 0.01, t * 0.14, '#7a5208');
        ctx.restore();
    }

    function tarjeta(ctx, t) {
        const w = t * 0.86;
        const h = t * 0.56;
        ctx.save();
        ctx.rotate(-0.12);
        const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        g.addColorStop(0, '#3a3f4b');
        g.addColorStop(1, '#14161b');
        ctx.fillStyle = g;
        redondeado(ctx, -w / 2, -h / 2, w, h, t * 0.06);
        ctx.fill();
        ctx.fillStyle = '#d9b44a';
        redondeado(ctx, -w * 0.38, -h * 0.2, w * 0.18, h * 0.24, t * 0.02);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        for (let i = 0; i < 4; i++) {
            redondeado(ctx, -w * 0.38 + i * w * 0.2, h * 0.16, w * 0.15, h * 0.08, t * 0.01);
            ctx.fill();
        }
        texto(ctx, 'DEUDA', w * 0.14, -h * 0.12, t * 0.14, '#ff6b6b');
        ctx.restore();

        // candado y cadena
        ctx.strokeStyle = '#8b939b';
        ctx.lineWidth = t * 0.04;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.ellipse(t * 0.3 + i * t * 0.02, t * 0.2 + i * t * 0.08, t * 0.05, t * 0.035, 0.9, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.fillStyle = '#e04a3b';
        redondeado(ctx, t * 0.24, t * 0.36, t * 0.18, t * 0.14, t * 0.03);
        ctx.fill();
        ctx.strokeStyle = '#e04a3b';
        ctx.lineWidth = t * 0.03;
        ctx.beginPath();
        ctx.arc(t * 0.33, t * 0.36, t * 0.06, Math.PI, 0);
        ctx.stroke();
    }

    function anzuelo(ctx, t, tiempo) {
        // Fraude: un anzuelo con un "mensaje" como cebo
        ctx.strokeStyle = 'rgba(255,255,255,.7)';
        ctx.lineWidth = t * 0.015;
        ctx.beginPath();
        ctx.moveTo(0, -t * 0.5);
        ctx.lineTo(0, -t * 0.2);
        ctx.stroke();

        ctx.strokeStyle = '#9aa3ab';
        ctx.lineWidth = t * 0.05;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -t * 0.22);
        ctx.lineTo(0, t * 0.18);
        ctx.arc(-t * 0.12, t * 0.18, t * 0.12, 0, Math.PI, false);
        ctx.lineTo(-t * 0.24, t * 0.08);
        ctx.stroke();
        ctx.fillStyle = '#9aa3ab';
        ctx.beginPath();
        ctx.moveTo(-t * 0.24, t * 0.02);
        ctx.lineTo(-t * 0.3, t * 0.12);
        ctx.lineTo(-t * 0.18, t * 0.1);
        ctx.fill();

        // cebo: sobre de correo
        const bal = Math.sin((tiempo || 0) * 5) * 0.12;
        ctx.save();
        ctx.translate(t * 0.2, -t * 0.02);
        ctx.rotate(bal);
        const w = t * 0.4;
        const h = t * 0.28;
        ctx.fillStyle = '#fff6d6';
        redondeado(ctx, -w / 2, -h / 2, w, h, t * 0.03);
        ctx.fill();
        ctx.strokeStyle = '#e04a3b';
        ctx.lineWidth = t * 0.025;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(0, h * 0.1);
        ctx.lineTo(w / 2, -h / 2);
        ctx.stroke();
        ctx.fillStyle = '#e04a3b';
        ctx.beginPath();
        ctx.arc(w / 2, -h / 2, t * 0.08, 0, Math.PI * 2);
        ctx.fill();
        texto(ctx, '!', w / 2, -h / 2 + t * 0.005, t * 0.13, '#fff');
        ctx.restore();
    }

    function estrella(ctx, t, tiempo) {
        const r = t * 0.46;
        ctx.save();
        ctx.rotate(Math.sin((tiempo || 0) * 3) * 0.25);
        ctx.shadowColor = '#ffd84d';
        ctx.shadowBlur = t * 0.25;
        const g = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
        g.addColorStop(0, '#fff6b3');
        g.addColorStop(1, '#f5b400');
        ctx.fillStyle = g;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
            const rr = i % 2 === 0 ? r : r * 0.45;
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        texto(ctx, '×2', 0, t * 0.04, t * 0.24, '#8a5a00');
        ctx.restore();
    }

    function iman(ctx, t) {
        ctx.save();
        ctx.rotate(Math.PI);
        ctx.lineWidth = t * 0.2;
        ctx.strokeStyle = '#e0443a';
        ctx.beginPath();
        ctx.arc(0, -t * 0.02, t * 0.24, 0, Math.PI);
        ctx.stroke();
        ctx.lineCap = 'butt';
        ctx.beginPath();
        ctx.moveTo(-t * 0.24, -t * 0.02);
        ctx.lineTo(-t * 0.24, -t * 0.2);
        ctx.moveTo(t * 0.24, -t * 0.02);
        ctx.lineTo(t * 0.24, -t * 0.2);
        ctx.stroke();
        ctx.strokeStyle = '#d7dde2';
        ctx.beginPath();
        ctx.moveTo(-t * 0.24, -t * 0.2);
        ctx.lineTo(-t * 0.24, -t * 0.34);
        ctx.moveTo(t * 0.24, -t * 0.2);
        ctx.lineTo(t * 0.24, -t * 0.34);
        ctx.stroke();
        ctx.restore();
        ctx.strokeStyle = '#ffe066';
        ctx.lineWidth = t * 0.025;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(0, -t * 0.42, t * (0.06 + i * 0.05), Math.PI * 0.15, Math.PI * 0.85);
            ctx.stroke();
        }
    }

    function corazon(ctx, t, tiempo) {
        const s = 1 + Math.sin((tiempo || 0) * 8) * 0.06;
        ctx.save();
        ctx.scale(s, s);
        ctx.shadowColor = '#ff5a7a';
        ctx.shadowBlur = t * 0.2;
        const g = ctx.createLinearGradient(0, -t * 0.4, 0, t * 0.4);
        g.addColorStop(0, '#ff8aa0');
        g.addColorStop(1, '#e0244a');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, t * 0.4);
        ctx.bezierCurveTo(-t * 0.6, -t * 0.02, -t * 0.32, -t * 0.5, 0, -t * 0.18);
        ctx.bezierCurveTo(t * 0.32, -t * 0.5, t * 0.6, -t * 0.02, 0, t * 0.4);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,.6)';
        ctx.beginPath();
        ctx.ellipse(-t * 0.18, -t * 0.15, t * 0.07, t * 0.04, -0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    /**
     * Dibuja un objeto del catálogo centrado en el origen.
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} clave  clave del catálogo (m1, b100, hormiga…)
     * @param {number} t      tamaño en píxeles
     * @param {number} tiempo segundos, para animaciones internas
     */
    function objeto(ctx, clave, t, tiempo) {
        const etiqueta = { m1: '$1', m2: '$2', m5: '$5', m10: '$10', b20: '$20', b50: '$50', b100: '$100', b200: '$200', b500: '$500', falso: '$500' }[clave];
        ctx.save();
        if (clave.startsWith('m')) moneda(ctx, t, etiqueta, (tiempo || 0) * 3);
        else if (BILLETES[clave]) billete(ctx, t, clave, etiqueta);
        else if (clave === 'antojo') paleta(ctx, t, tiempo);
        else if (clave === 'hormiga') hormiga(ctx, t, tiempo);
        else if (clave === 'tarjeta') tarjeta(ctx, t);
        else if (clave === 'anzuelo') anzuelo(ctx, t, tiempo);
        else if (clave === 'estrella') estrella(ctx, t, tiempo);
        else if (clave === 'iman') iman(ctx, t);
        else if (clave === 'corazon') corazon(ctx, t, tiempo);
        ctx.restore();
    }

    /** Pinta los íconos estáticos <canvas data-objeto="…"> de la página. */
    function iconos(raiz) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        (raiz || document).querySelectorAll('canvas[data-objeto]').forEach((c) => {
            const lado = c.width;
            c.style.width = lado / 1.5 + 'px';
            c.style.height = lado / 1.5 + 'px';
            c.width = c.height = lado * dpr;
            const ctx = c.getContext('2d');
            ctx.scale(dpr, dpr);
            ctx.translate(lado / 2, lado / 2);
            objeto(ctx, c.dataset.objeto, lado * 0.82, 0);
        });
    }

    window.Dibujo = { objeto, iconos, redondeado, texto };

    // Repinta cuando carga la tipografía para que las etiquetas usen Baloo 2.
    const pintar = () => iconos();
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pintar);
    else pintar();
    if (document.fonts) document.fonts.ready.then(() => {
        document.querySelectorAll('canvas[data-objeto]').forEach((c) => {
            c.width = parseFloat(c.style.width) * 1.5;
            c.height = c.width;
        });
        pintar();
    });
})();
