<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['book_id', 'path', 'original_name', 'mime_type', 'size'])]
class BookFile extends Model
{
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
