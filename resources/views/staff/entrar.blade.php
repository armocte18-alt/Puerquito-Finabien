@extends('staff.layout')
@section('titulo', 'Entrar')

@section('contenido')
    <form method="POST" action="{{ route('staff.entrar') }}" class="mx-auto mt-10 max-w-sm space-y-4 rounded-xl bg-white p-6 shadow-sm">
        @csrf
        <img src="{{ asset('img/logo-circular.png') }}" alt="Financiera para el Bienestar" class="mx-auto size-24">
        <h1 class="text-center text-xl font-bold">Panel del stand</h1>
        <p class="text-sm text-billete-700">Escribe el PIN del personal para entregar premios y editar el contenido.</p>
        <label for="pin" class="block text-sm font-bold">PIN</label>
        <input id="pin" name="pin" type="password" inputmode="numeric" autocomplete="off" autofocus required
               class="w-full rounded-lg border border-billete-700/30 px-3 py-3 text-2xl tracking-[0.4em] focus:border-billete-700 focus:outline-none focus:ring-2 focus:ring-oro-400">
        <button class="w-full rounded-lg bg-billete-900 px-4 py-3 font-bold text-white hover:bg-billete-700">Entrar</button>
    </form>
@endsection
