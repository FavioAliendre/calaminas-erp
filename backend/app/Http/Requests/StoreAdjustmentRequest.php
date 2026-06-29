<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('adjust-inventory');
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'type' => ['required', 'string', 'in:adjustment_in,adjustment_out'],
            'quantity' => ['required', 'numeric', 'gt:0'],
            'observation' => ['nullable', 'string', 'max:255'],
        ];
    }
}
