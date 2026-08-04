<?php

namespace App\Http\Controllers;

use App\Http\Resources\AdminUserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

/**
 * Lets an admin manage OTHER admin accounts. Deliberately separate from
 * AssistantController — admins get every permission automatically (no
 * matrix to configure), and an admin may never delete their own account.
 */
class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->role('admin');

        $query->when($request->filled('q'), fn ($q) => $q->where(function ($inner) use ($request) {
            $term = '%'.$request->string('q').'%';
            $inner->where('name', 'like', $term)->orWhere('email', 'like', $term);
        }));

        $admins = $query->orderBy('name')->paginate($request->integer('per_page', 20));

        return AdminUserResource::collection($admins);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
        ]);

        $admin = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'is_active' => true,
        ]);
        $admin->assignRole('admin');

        return new AdminUserResource($admin);
    }

    public function update(Request $request, User $admin)
    {
        $this->ensureAdmin($admin);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$admin->id],
            'is_active' => ['boolean'],
        ]);

        if ($admin->id === $request->user()->id && $request->has('is_active') && ! $request->boolean('is_active')) {
            throw ValidationException::withMessages(['is_active' => 'You cannot deactivate your own account.']);
        }

        $admin->update($data);

        return new AdminUserResource($admin);
    }

    public function destroy(Request $request, User $admin)
    {
        $this->ensureAdmin($admin);

        if ($admin->id === $request->user()->id) {
            throw ValidationException::withMessages(['id' => 'You cannot remove your own account.']);
        }

        $admin->delete();

        return response()->noContent();
    }

    protected function ensureAdmin(User $user): void
    {
        abort_unless($user->hasRole('admin'), 404);
    }
}
