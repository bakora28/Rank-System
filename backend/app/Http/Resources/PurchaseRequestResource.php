<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class PurchaseRequestResource extends JsonResource
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
            'status' => $this->status,
            'note' => $this->note,
            'teacher_note' => $this->teacher_note,
            'receipt_url' => $this->receipt_path ? Storage::disk('public')->url($this->receipt_path) : null,
            'teacher' => [
                'id' => $this->teacher->id,
                'name' => $this->teacher->name,
                'avatar' => $this->teacher->avatar,
            ],
            'book' => [
                'id' => $this->book->id,
                'name' => $this->book->name,
                'category' => $this->book->category->name,
            ],
            'reviewer' => $this->when($this->reviewer, fn () => [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ]),
            'reviewed_at' => $this->reviewed_at,
            'created_at' => $this->created_at,
        ];
    }
}
