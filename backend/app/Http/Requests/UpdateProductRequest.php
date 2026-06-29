<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('edit-products');
    }

    public function rules(): array
    {
        $productId = $this->route('product');
        // If it is a model object, extract the ID
        if (is_object($productId)) {
            $productId = $productId->id;
        }

        return [
            'code' => ['sometimes', 'required', 'string', 'max:100', 'unique:products,code,' . $productId],
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color' => ['nullable', 'string', 'max:50'],
            'thickness' => ['sometimes', 'required', 'numeric', 'min:0'],
            'purchase_unit' => ['sometimes', 'string', 'max:10'],
            'sale_unit' => ['sometimes', 'string', 'max:10'],
            'meters_per_ton' => ['sometimes', 'required', 'numeric', 'gt:0'],
        ];
    }
}
