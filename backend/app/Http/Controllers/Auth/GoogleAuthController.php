<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    /**
     * Handles the Google callback. New Google sign-ins are provisioned as
     * teacher accounts automatically; admin/assistant accounts must already
     * exist (created by an admin) and simply get linked by matching email.
     */
    public function callback(Request $request)
    {
        $frontend = config('services.frontend_url');

        $googleUser = Socialite::driver('google')->user();

        $user = User::query()->where('google_id', $googleUser->getId())
            ->orWhere('email', $googleUser->getEmail())
            ->first();

        if (! $user) {
            $user = User::query()->create([
                'name' => $googleUser->getName() ?: $googleUser->getNickname(),
                'email' => $googleUser->getEmail(),
                'google_id' => $googleUser->getId(),
                'avatar' => $googleUser->getAvatar(),
                'password' => Str::random(32),
                'is_active' => true,
            ]);
            $user->assignRole('teacher');
        } elseif (! $user->google_id) {
            $user->update([
                'google_id' => $googleUser->getId(),
                'avatar' => $user->avatar ?: $googleUser->getAvatar(),
            ]);
        }

        if (! $user->is_active) {
            return redirect()->away("{$frontend}/login?error=account_deactivated");
        }

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->away("{$frontend}/auth/callback");
    }
}
