const BASE = document.getElementById('app')?.dataset.api ?? '/api';

export class ErrorApi extends Error {
    constructor(mensaje, estado) {
        super(mensaje);
        this.estado = estado;
    }
}

async function pedir(metodo, ruta, cuerpo) {
    let res;
    try {
        res = await fetch(`${BASE}/${ruta}`, {
            method: metodo,
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: cuerpo ? JSON.stringify(cuerpo) : undefined,
        });
    } catch {
        throw new ErrorApi('No hay conexión con el servidor. Revisa la red del stand.', 0);
    }

    const datos = await res.json().catch(() => ({}));
    if (res.ok) return datos;

    if (res.status === 422 && datos.errors) {
        throw new ErrorApi(Object.values(datos.errors)[0][0], 422);
    }
    if (res.status === 429) {
        throw new ErrorApi('Demasiados intentos seguidos. Espera un minuto y vuelve a intentarlo.', 429);
    }
    if (res.status === 404) {
        throw new ErrorApi('No encontramos lo que buscabas. Intenta de nuevo.', 404);
    }
    throw new ErrorApi('Algo falló en el servidor. Intenta de nuevo o avisa al personal del stand.', res.status);
}

export const api = {
    configuracion: () => pedir('GET', 'configuracion'),
    ranking: () => pedir('GET', 'ranking'),
    registrar: (datos) => pedir('POST', 'jugadores', datos),
    jugador: (codigo) => pedir('GET', `jugadores/${encodeURIComponent(codigo)}`),
    iniciar: (codigo, juego) => pedir('POST', `jugadores/${encodeURIComponent(codigo)}/partidas`, { juego }),
    responder: (partida, datos) => pedir('POST', `partidas/${partida}/respuestas`, datos),
    terminar: (partida, datos = {}) => pedir('POST', `partidas/${partida}/terminar`, datos),
    canjear: (codigo, premio) => pedir('POST', `jugadores/${encodeURIComponent(codigo)}/canjes`, { premio }),
};
