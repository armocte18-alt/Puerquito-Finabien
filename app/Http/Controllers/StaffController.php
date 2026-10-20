<?php

namespace App\Http\Controllers;

use App\Models\Canje;
use App\Models\Evento;
use App\Models\Jugador;
use App\Models\Partida;
use App\Models\Pregunta;
use App\Models\Premio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\View\View;
use Symfony\Component\HttpFoundation\StreamedResponse;

class StaffController extends Controller
{
    public function formEntrar(): View
    {
        return view('staff.entrar');
    }

    public function entrar(Request $request): RedirectResponse
    {
        $request->validate(['pin' => ['required', 'string']]);

        if (! hash_equals(config('reto.staff_pin'), (string) $request->input('pin'))) {
            return back()->withErrors(['pin' => 'PIN incorrecto.']);
        }

        $request->session()->regenerate();
        $request->session()->put('staff', true);

        return redirect()->route('staff.inicio');
    }

    public function salir(Request $request): RedirectResponse
    {
        $request->session()->forget('staff');
        $request->session()->regenerate();

        return redirect()->route('staff.entrar');
    }

    public function inicio(Request $request): View
    {
        $evento = Evento::activo();
        $busqueda = trim((string) $request->query('q', ''));

        $jugadores = Jugador::query()->when($evento, fn ($q) => $q->where('evento_id', $evento->id));
        $porGrupo = (clone $jugadores)->selectRaw('grupo, count(*) as jugadores, sum(puntos_totales) as puntos')
            ->groupBy('grupo')->get()->keyBy('grupo');

        $partidas = Partida::where('estado', 'terminada')
            ->when($evento, fn ($q) => $q->whereHas('jugador', fn ($j) => $j->where('evento_id', $evento->id)))
            ->selectRaw('juego, count(*) as total')->groupBy('juego')->pluck('total', 'juego');

        $pendientes = Canje::with(['jugador', 'premio'])->whereNull('entregado_at')
            ->when($busqueda !== '', function ($q) use ($busqueda) {
                $codigo = Jugador::normalizarCodigo($busqueda);
                $q->where(fn ($w) => $w->where('folio', 'like', '%'.strtoupper($busqueda).'%')
                    ->orWhereHas('jugador', fn ($j) => $j->where('codigo', $codigo)->orWhere('nombre', 'like', "%$busqueda%")));
            })
            ->oldest()->limit(100)->get();

        $entregados = Canje::with(['jugador', 'premio'])->whereNotNull('entregado_at')->latest('entregado_at')->limit(10)->get();

        return view('staff.inicio', [
            'evento' => $evento,
            'porGrupo' => $porGrupo,
            'partidas' => $partidas,
            'pendientes' => $pendientes,
            'entregados' => $entregados,
            'busqueda' => $busqueda,
            'premios' => Premio::orderBy('orden')->get(),
        ]);
    }

    public function entregar(Canje $canje): RedirectResponse
    {
        if ($canje->entregado_at === null) {
            $canje->update(['entregado_at' => now()]);
        }

        return back()->with('ok', "Folio {$canje->folio} marcado como entregado.");
    }

    // ---- Premios ----

    public function premios(): View
    {
        return view('staff.premios', ['premios' => Premio::withCount('canjes')->orderBy('orden')->orderBy('costo')->get()]);
    }

    public function guardarPremio(Request $request, ?Premio $premio = null): RedirectResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:80'],
            'descripcion' => ['nullable', 'string', 'max:160'],
            'icono' => ['nullable', 'string', 'max:16'],
            'costo' => ['required', 'integer', 'min:1'],
            'stock' => ['nullable', 'integer', 'min:0'],
            'orden' => ['nullable', 'integer', 'min:0'],
        ]);
        $datos['activo'] = $request->boolean('activo');
        $datos['orden'] ??= 0;

        $premio ? $premio->update($datos) : Premio::create($datos);

        return back()->with('ok', 'Premio guardado.');
    }

    // ---- Preguntas ----

    public function preguntas(Request $request): View
    {
        $grupo = $request->query('grupo', 'ninos');
        abort_unless(array_key_exists($grupo, config('reto.grupos')), 404);

        return view('staff.preguntas', [
            'grupo' => $grupo,
            'preguntas' => Pregunta::where('grupo', $grupo)->orderByDesc('activa')->orderBy('id')->get(),
        ]);
    }

    public function formPregunta(Request $request, ?Pregunta $pregunta = null): View
    {
        $pregunta ??= new Pregunta([
            'grupo' => $request->query('grupo', 'ninos'), 'tema' => 'educacion', 'opciones' => ['', '', '', ''], 'correcta' => 0, 'activa' => true,
        ]);

        return view('staff.pregunta', ['pregunta' => $pregunta]);
    }

    public function guardarPregunta(Request $request, ?Pregunta $pregunta = null): RedirectResponse
    {
        $datos = $request->validate([
            'grupo' => ['required', Rule::in(array_keys(config('reto.grupos')))],
            'tema' => ['required', Rule::in(['educacion', 'finabien'])],
            'enunciado' => ['required', 'string', 'max:300'],
            'opciones' => ['required', 'array'],
            'opciones.*' => ['nullable', 'string', 'max:140'],
            'correcta' => ['required', 'integer', 'min:0'],
            'explicacion' => ['nullable', 'string', 'max:400'],
        ]);

        // Quita opciones vacías conservando cuál era la correcta.
        $correctaTexto = $datos['opciones'][$datos['correcta']] ?? null;
        $opciones = array_values(array_filter($datos['opciones'], fn ($o) => trim((string) $o) !== ''));
        $correcta = array_search($correctaTexto, $opciones, true);

        if (count($opciones) < 2 || $correcta === false) {
            return back()->withInput()->withErrors(['opciones' => 'Escribe al menos dos opciones y marca la correcta.']);
        }

        $datos['opciones'] = $opciones;
        $datos['correcta'] = $correcta;
        $datos['activa'] = $request->boolean('activa');

        $pregunta ? $pregunta->update($datos) : $pregunta = Pregunta::create($datos);

        return redirect()->route('staff.preguntas', ['grupo' => $pregunta->grupo])->with('ok', 'Pregunta guardada.');
    }

    public function alternarPregunta(Pregunta $pregunta): RedirectResponse
    {
        $pregunta->update(['activa' => ! $pregunta->activa]);

        return back()->with('ok', $pregunta->activa ? 'Pregunta activada.' : 'Pregunta desactivada.');
    }

    // ---- Eventos ----

    public function eventos(): View
    {
        return view('staff.eventos', ['eventos' => Evento::withCount('jugadores')->latest('id')->get()]);
    }

    public function guardarEvento(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'nombre' => ['required', 'string', 'max:150'],
            'sede' => ['nullable', 'string', 'max:150'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ]);

        $evento = Evento::create($datos);
        $this->activarEvento($evento);

        return back()->with('ok', "Evento «{$evento->nombre}» creado y activado.");
    }

    public function activarEvento(Evento $evento): RedirectResponse
    {
        Evento::where('id', '!=', $evento->id)->update(['activo' => false]);
        $evento->update(['activo' => true]);

        return back()->with('ok', "Ahora el ranking y los registros son de «{$evento->nombre}».");
    }

    // ---- Exportación ----

    public function exportar(string $tipo): StreamedResponse
    {
        abort_unless(in_array($tipo, ['jugadores', 'canjes'], true), 404);

        return response()->streamDownload(function () use ($tipo) {
            $out = fopen('php://output', 'w');
            fwrite($out, "\xEF\xBB\xBF"); // BOM para que Excel respete los acentos.

            if ($tipo === 'jugadores') {
                fputcsv($out, ['codigo', 'nombre', 'edad', 'grupo', 'evento', 'puntos_totales', 'saldo', 'registro']);
                Jugador::with('evento:id,nombre')->orderBy('id')->chunk(500, function ($lote) use ($out) {
                    foreach ($lote as $j) {
                        fputcsv($out, [$j->codigo, $j->nombre, $j->edad, $j->grupo, $j->evento?->nombre, $j->puntos_totales, $j->puntos, $j->created_at]);
                    }
                });
            } else {
                fputcsv($out, ['folio', 'premio', 'costo', 'codigo_jugador', 'nombre', 'grupo', 'canjeado', 'entregado']);
                Canje::with(['jugador', 'premio'])->orderBy('id')->chunk(500, function ($lote) use ($out) {
                    foreach ($lote as $c) {
                        fputcsv($out, [$c->folio, $c->premio->nombre, $c->costo, $c->jugador->codigo, $c->jugador->nombre, $c->jugador->grupo, $c->created_at, $c->entregado_at]);
                    }
                });
            }

            fclose($out);
        }, "reto-bienestar-$tipo-".now()->format('Ymd-His').'.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }
}
