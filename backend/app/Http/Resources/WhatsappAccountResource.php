<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WhatsappAccountResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'api_url' => $this->api_url,
            'instance_id' => $this->instance_id,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
        ];
    }
}
