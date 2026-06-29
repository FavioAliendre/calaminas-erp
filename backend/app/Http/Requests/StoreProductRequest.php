<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create-products');
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:100', 'unique:products,code'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:50'],
            'thickness' => ['required', 'numeric', 'min:0'],
            'purchase_unit' => ['sometimes', 'string', 'max:10'],
            'sale_unit' => ['sometimes', 'string', 'max:10'],
            'meters_per_ton' => ['required', 'numeric', 'gt:0'],
        ];
    }
}
