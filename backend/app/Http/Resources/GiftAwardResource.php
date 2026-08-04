<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GiftAwardResource extends JsonResource
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
            'gift' => $this->when($this->relationLoaded('gift'), fn () => [
                'id' => $this->gift->id,
                'name' => $this->gift->name,
                'slug' => $this->gift->slug,
            ]),
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'avatar' => $this->user->avatar,
            ],
            'period_start' => $this->period_start,
            'period_end' => $this->period_end,
            'awarded_at' => $this->awarded_at,
        ];
    }
}
