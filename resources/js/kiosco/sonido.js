// Efectos cortos generados con Web Audio: no requieren archivos ni internet.
let ctx = null;
let activo = true;
try { activo = localStorage.getItem('reto-sonido') !== 'no'; } catch { /* sin almacenamiento */ }

function tono(frecuencias, duracion = 0.12, tipo = 'triangle', volumen = 0.18) {
    if (!activo) return;
    try {
        ctx ??= new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') ctx.resume();
        let t = ctx.currentTime;
        for (const f of frecuencias) {
            const osc = ctx.createOscillator();
            const gan = ctx.createGain();
            osc.type = tipo;
            osc.frequency.value = f;
            gan.gain.setValueAtTime(volumen, t);
            gan.gain.exponentialRampToValueAtTime(0.001, t + duracion);
            osc.connect(gan).connect(ctx.destination);
            osc.start(t);
            osc.stop(t + duracion);
            t += duracion * 0.8;
        }
    } catch { /* audio no disponible */ }
}

export const sonido = {
    get activo() { return activo; },
    alternar() {
        activo = !activo;
        try { localStorage.setItem('reto-sonido', activo ? 'si' : 'no'); } catch { /* */ }
        return activo;
    },
    toque: () => tono([660], 0.05, 'sine', 0.08),
    bien: () => tono([660, 880], 0.12),
    mal: () => tono([300, 220], 0.16, 'sawtooth', 0.08),
    voltea: () => tono([520], 0.06, 'sine', 0.07),
    premio: () => tono([523, 659, 784, 1047], 0.14),
    fin: () => tono([784, 659, 880, 1047], 0.16),
};
