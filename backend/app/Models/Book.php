<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['category_id', 'name', 'created_by'])]
class Book extends Model
{
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class);
    }

    /** The signed-in teacher's own purchase request for this book, if any. */
    public function myRequest(): HasOne
    {
        return $this->hasOne(PurchaseRequest::class)->where('teacher_id', auth()->id());
    }

    public function files(): HasMany
    {
        return $this->hasMany(BookFile::class);
    }
}
