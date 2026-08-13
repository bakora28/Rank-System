<?php

namespace App\Http\Controllers;

use App\Http\Resources\AssistantResource;
use App\Models\User;
use App\Rules\EgyptianPhoneNumber;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class AssistantController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->role('assistant');

        $query->when($request->filled('q'), fn ($q) => $q->where(function ($inner) use ($request) {
            $term = '%'.$request->string('q').'%';
            $inner->where('name', 'like', $term)->orWhere('email', 'like', $term);
        }));

        $assistants = $query->orderBy('name')->paginate($request->integer('per_page', 20));

        return AssistantResource::collection($assistants);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', new EgyptianPhoneNumber],
            'password' => ['required', Password::min(8)],
            'permissions' => ['array'],
            'permissions.*' => ['string', 'in:'.implode(',', Permissions::all())],
        ]);

        $assistant = User::query()->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'password' => $data['password'],
            'is_active' => true,
        ]);
        $assistant->assignRole('assistant');
        $assistant->givePermissionTo($data['permissions'] ?? []);

        return new AssistantResource($assistant);
    }

    public function update(Request $request, User $assistant)
    {
        $this->ensureAssistant($assistant);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$assistant->id],
            'phone' => ['sometimes', 'nullable', 'string', new EgyptianPhoneNumber],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $assistant->update($data);

        return new AssistantResource($assistant);
    }

    /** Full checkbox-matrix replace of an assistant's module.action permissions. */
    public function updatePermissions(Request $request, User $assistant)
    {
        $this->ensureAssistant($assistant);

        $data = $request->validate([
            'permissions' => ['array'],
            'permissions.*' => ['string', 'in:'.implode(',', Permissions::all())],
        ]);

        $assistant->syncPermissions($data['permissions'] ?? []);

        return new AssistantResource($assistant);
    }

    public function destroy(User $assistant)
    {
        $this->ensureAssistant($assistant);

        $assistant->delete();

        return response()->noContent();
    }

    protected function ensureAssistant(User $user): void
    {
        abort_unless($user->hasRole('assistant'), 404);
    }
}
