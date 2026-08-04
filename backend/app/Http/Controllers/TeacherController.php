<?php

namespace App\Http\Controllers;

use App\Http\Resources\TeacherResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query()->role('teacher')
            ->withCount(['purchaseRequests as approved_count' => fn ($q) => $q->where('status', 'approved')])
            ->withCount(['purchaseRequests as pending_count' => fn ($q) => $q->where('status', 'pending')]);

        $query->when($request->filled('q'), fn ($q) => $q->where(function ($inner) use ($request) {
            $term = '%'.$request->string('q').'%';
            $inner->where('name', 'like', $term)->orWhere('email', 'like', $term);
        }));

        $query->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')));

        $teachers = $query->orderBy('name')->paginate($request->integer('per_page', 20));

        return TeacherResource::collection($teachers);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', Password::min(8)],
        ]);

        $teacher = User::query()->create([...$data, 'is_active' => true]);
        $teacher->assignRole('teacher');

        return response()->json($teacher, 201);
    }

    public function update(Request $request, User $teacher)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email,'.$teacher->id],
            'is_active' => ['boolean'],
        ]);

        $teacher->update($data);

        return response()->json($teacher);
    }

    public function destroy(User $teacher)
    {
        $teacher->delete();

        return response()->noContent();
    }
}
