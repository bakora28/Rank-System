<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'google_id', 'avatar', 'is_active'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, HasRoles, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function purchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class, 'teacher_id');
    }

    public function reviewedPurchaseRequests(): HasMany
    {
        return $this->hasMany(PurchaseRequest::class, 'reviewed_by');
    }

    public function giftAwards(): HasMany
    {
        return $this->hasMany(GiftAward::class);
    }

    /** Admins, plus any assistant explicitly granted the given permission. */
    public static function withPermission(string $permission)
    {
        return static::query()
            ->role('admin')
            ->orWhereHas('permissions', fn ($q) => $q->where('name', $permission))
            ->get()
            ->unique('id');
    }
}
