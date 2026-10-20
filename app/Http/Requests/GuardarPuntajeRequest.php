<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class GuardarPuntajeRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nombre' => trim(preg_replace('/\s+/u', ' ', strip_tags((string) $this->input('nombre')))),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nombre' => ['required', 'string', 'min:1', 'max:20'],
            'grupo' => ['required', 'string', Rule::in(array_keys(config('juego.grupos')))],
            'puntos' => ['required', 'integer', 'min:0'],
            'monedas' => ['required', 'integer', 'min:0', 'max:1000'],
            'billetes' => ['required', 'integer', 'min:0', 'max:1000'],
            'trampas' => ['required', 'integer', 'min:0', 'max:1000'],
            'ahorro' => ['required', 'integer', 'min:0', 'max:1000000'],
            'duracion' => ['required', 'integer', 'min:1', 'max:600'],
        ];
    }

    /**
     * Rechaza partidas que no caben en el tiempo del rango elegido.
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $grupo = config('juego.grupos.'.$this->input('grupo'));

                if (! $grupo || $validator->errors()->isNotEmpty()) {
                    return;
                }

                if ((int) $this->input('duracion') > $grupo['duracion'] + 2) {
                    $validator->errors()->add('duracion', 'La duración no corresponde al rango de edad.');
                }

                $maximo = $grupo['duracion'] * config('juego.puntos_maximos_por_segundo');

                if ((int) $this->input('puntos') > $maximo) {
                    $validator->errors()->add('puntos', 'El puntaje no es válido.');
                }
            },
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'Escribe tu nombre para entrar a la tabla.',
            'nombre.max' => 'El nombre puede tener hasta 20 letras.',
        ];
    }
}
