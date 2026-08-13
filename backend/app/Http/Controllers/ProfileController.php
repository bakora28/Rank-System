<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Rules\EgyptianPhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string', new EgyptianPhoneNumber],
        ]);

        $user->update($data);

        return new UserResource($user);
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', Password::min(8), 'confirmed'],
        ]);

        $request->user()->update(['password' => $request->string('password')]);

        return response()->noContent();
    }

    public function updateAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:4096'],
        ]);

        $user = $request->user();

        if ($user->avatar && str_contains($user->avatar, '/storage/avatars/')) {
            Storage::disk('public')->delete('avatars/'.basename($user->avatar));
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['avatar' => Storage::disk('public')->url($path)]);

        return new UserResource($user);
    }
}
