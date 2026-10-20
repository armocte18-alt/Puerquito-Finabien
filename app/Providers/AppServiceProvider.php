<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // En una feria varios kioscos comparten la IP de la red del stand: límites holgados.
        RateLimiter::for('kiosco', fn (Request $r) => Limit::perMinute(600)->by($r->ip()));
        RateLimiter::for('registro', fn (Request $r) => Limit::perMinute(60)->by($r->ip()));
        // Frena que alguien adivine códigos de otros jugadores.
        RateLimiter::for('codigo', fn (Request $r) => Limit::perMinute(30)->by($r->ip()));
        RateLimiter::for('pin-staff', fn (Request $r) => Limit::perMinute(5)->by($r->ip()));
    }
}
