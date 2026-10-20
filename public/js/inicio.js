/*
 * Puerquito Finabien – pantalla de inicio.
 */
(function () {
    'use strict';

    const campo = document.getElementById('nombre');
    const grupos = Array.from(document.querySelectorAll('.grupo'));

    try {
        campo.value = localStorage.getItem('puerquito.nombre') || '';
    } catch (e) { /* sin almacenamiento */ }

    function guardarNombre() {
        try { localStorage.setItem('puerquito.nombre', campo.value.trim()); } catch (e) { /* sin almacenamiento */ }
    }

    campo.addEventListener('input', guardarNombre);
    campo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === 'ArrowDown') {
            e.preventDefault();
            grupos[0].focus();
        }
    });
    grupos.forEach((g) => g.addEventListener('click', guardarNombre));

    // Navegación con teclado o control remoto: flechas entre tarjetas y 1-2-3 directo.
    document.addEventListener('keydown', (e) => {
        if (e.target === campo) return;
        const i = grupos.indexOf(document.activeElement);
        if (['1', '2', '3'].includes(e.key) && grupos[+e.key - 1]) {
            guardarNombre();
            window.location = grupos[+e.key - 1].href;
        } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const sig = i < 0 ? 0 : (i + (e.key === 'ArrowRight' ? 1 : -1) + grupos.length) % grupos.length;
            grupos[sig].focus();
        } else if (e.key === 'ArrowUp' && i >= 0) {
            e.preventDefault();
            campo.focus();
        }
    });

    // Gamepad: palanca/cruceta para elegir, A para entrar.
    let previo = {};
    function sondearControl() {
        const pads = navigator.getGamepads ? navigator.getGamepads() : [];
        for (const p of pads) {
            if (!p) continue;
            const b = (n) => p.buttons[n] && p.buttons[n].pressed;
            const izq = b(14) || p.axes[0] < -0.6;
            const der = b(15) || p.axes[0] > 0.6;
            const a = b(0) || b(9);
            const i = grupos.indexOf(document.activeElement);
            if (der && !previo.der) grupos[(i + 1 + grupos.length) % grupos.length].focus();
            if (izq && !previo.izq) grupos[(Math.max(i, 0) - 1 + grupos.length) % grupos.length].focus();
            if (a && !previo.a && i >= 0) {
                guardarNombre();
                window.location = grupos[i].href;
            }
            previo = { izq, der, a };
            break;
        }
        requestAnimationFrame(sondearControl);
    }
    window.addEventListener('gamepadconnected', () => requestAnimationFrame(sondearControl), { once: true });

    // Récord de cada rango.
    const fmt = new Intl.NumberFormat('es-MX');
    Object.entries(window.PUERQUITO_RECORDS || {}).forEach(([grupo, url]) => {
        fetch(url, { headers: { Accept: 'application/json' } })
            .then((r) => (r.ok ? r.json() : null))
            .then((datos) => {
                const mejor = datos && datos.puntajes[0];
                if (!mejor) return;
                const el = document.querySelector(`[data-record="${grupo}"]`);
                el.textContent = `Récord: ${fmt.format(mejor.puntos)} · ${mejor.nombre}`;
            })
            .catch(() => {});
    });
})();
