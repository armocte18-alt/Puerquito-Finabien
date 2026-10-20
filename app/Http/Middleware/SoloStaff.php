<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SoloStaff
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->session()->get('staff')) {
            return redirect()->route('staff.entrar');
        }

        return $next($request);
    }
}
