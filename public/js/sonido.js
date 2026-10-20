/*
 * Puerquito Finabien – efectos de sonido sintetizados con Web Audio.
 * No se descargan archivos: todo se genera al momento.
 */
(function () {
    'use strict';

    let ctx = null;
    let maestro = null;
    let silencio = false;

    try {
        silencio = localStorage.getItem('puerquito.silencio') === '1';
    } catch (e) { /* almacenamiento no disponible */ }

    function preparar() {
        if (ctx) {
            if (ctx.state === 'suspended') ctx.resume();
            return true;
        }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        ctx = new AC();
        maestro = ctx.createGain();
        maestro.gain.value = silencio ? 0 : 0.5;
        maestro.connect(ctx.destination);
        return true;
    }

    function tono(frec, inicio, dur, tipo, vol, frecFinal) {
        if (!ctx) return;
        const t0 = ctx.currentTime + inicio;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = tipo || 'sine';
        osc.frequency.setValueAtTime(frec, t0);
        if (frecFinal) osc.frequency.exponentialRampToValueAtTime(frecFinal, t0 + dur);
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(vol || 0.3, t0 + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        osc.connect(g).connect(maestro);
        osc.start(t0);
        osc.stop(t0 + dur + 0.02);
    }

    function ruido(inicio, dur, vol, desde, hasta) {
        if (!ctx) return;
        const t0 = ctx.currentTime + inicio;
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const f = ctx.createBiquadFilter();
        f.type = 'bandpass';
        f.Q.value = 1.2;
        f.frequency.setValueAtTime(desde, t0);
        f.frequency.exponentialRampToValueAtTime(hasta, t0 + dur);
        const g = ctx.createGain();
        g.gain.setValueAtTime(vol, t0);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
        src.connect(f).connect(g).connect(maestro);
        src.start(t0);
    }

    const efectos = {
        moneda(combo) {
            const sube = Math.min(combo || 0, 12) * 0.04;
            tono(988 * (1 + sube), 0, 0.08, 'square', 0.12);
            tono(1319 * (1 + sube), 0.06, 0.22, 'square', 0.12);
        },
        billete() {
            ruido(0, 0.25, 0.35, 600, 3500);
            tono(784, 0.04, 0.12, 'triangle', 0.2);
            tono(1175, 0.12, 0.25, 'triangle', 0.2);
        },
        trampa() {
            tono(220, 0, 0.35, 'sawtooth', 0.22, 70);
            tono(233, 0.02, 0.35, 'square', 0.12, 80);
        },
        poder() {
            [523, 659, 784, 1047, 1319].forEach((f, i) => tono(f, i * 0.06, 0.18, 'triangle', 0.2));
        },
        cuenta(final) {
            tono(final ? 1046 : 523, 0, final ? 0.4 : 0.15, 'square', 0.15);
        },
        tic() {
            tono(1600, 0, 0.04, 'square', 0.06);
        },
        fin() {
            [784, 659, 523, 659, 784, 1047].forEach((f, i) => tono(f, i * 0.12, 0.25, 'triangle', 0.22));
        },
    };

    window.Sonido = {
        preparar,
        reproducir(nombre, arg) {
            if (silencio || !preparar() || !efectos[nombre]) return;
            efectos[nombre](arg);
        },
        alternar() {
            silencio = !silencio;
            try { localStorage.setItem('puerquito.silencio', silencio ? '1' : '0'); } catch (e) { /* sin almacenamiento */ }
            if (maestro) maestro.gain.value = silencio ? 0 : 0.5;
            return !silencio;
        },
        activo() {
            return !silencio;
        },
    };
})();
