@php($campo = 'w-full rounded-lg border border-billete-700/30 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oro-400')
<div>
    <label for="{{ $id }}-icono" class="text-xs font-bold text-billete-700">Ícono</label>
    <input id="{{ $id }}-icono" name="icono" value="{{ $p->icono }}" maxlength="16" class="{{ $campo }} text-center text-xl">
</div>
<div>
    <label for="{{ $id }}-nombre" class="text-xs font-bold text-billete-700">Nombre</label>
    <input id="{{ $id }}-nombre" name="nombre" value="{{ $p->nombre }}" required maxlength="80" class="{{ $campo }}">
</div>
<div>
    <label for="{{ $id }}-descripcion" class="text-xs font-bold text-billete-700">Descripción</label>
    <input id="{{ $id }}-descripcion" name="descripcion" value="{{ $p->descripcion }}" maxlength="160" class="{{ $campo }}">
</div>
<div>
    <label for="{{ $id }}-costo" class="text-xs font-bold text-billete-700">Costo (pts)</label>
    <input id="{{ $id }}-costo" name="costo" type="number" min="1" value="{{ $p->costo }}" required class="{{ $campo }} tabular-nums">
</div>
<div>
    <label for="{{ $id }}-stock" class="text-xs font-bold text-billete-700">Existencias</label>
    <input id="{{ $id }}-stock" name="stock" type="number" min="0" value="{{ $p->stock }}" placeholder="Sin límite" class="{{ $campo }} tabular-nums">
</div>
<div>
    <label for="{{ $id }}-orden" class="text-xs font-bold text-billete-700">Orden</label>
    <input id="{{ $id }}-orden" name="orden" type="number" min="0" value="{{ $p->orden }}" class="{{ $campo }} tabular-nums">
</div>
<label for="{{ $id }}-activo" class="flex items-center gap-2 pb-2 text-sm sm:col-span-full lg:col-span-1">
    <input id="{{ $id }}-activo" name="activo" type="checkbox" value="1" @checked($p->activo) class="size-5 accent-billete-700"> Visible en el kiosco
</label>
