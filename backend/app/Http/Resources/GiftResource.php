<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class GiftResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'image_url' => $this->image_path ? \Illuminate\Support\Facades\Storage::url($this->image_path) : null,
            'criteria_type' => $this->criteria_type,
            'period' => $this->period,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'latest_award' => $this->whenLoaded('awards', fn () => $this->awards->first() ? new GiftAwardResource($this->awards->first()) : null),
            'progress' => $this->when(isset($this->progress), fn () => $this->progress),
        ];
    }
}
