<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'image_path', 'description', 'criteria_type', 'period', 'is_active', 'sort_order'])]
class Gift extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function awards(): HasMany
    {
        return $this->hasMany(GiftAward::class);
    }
}
