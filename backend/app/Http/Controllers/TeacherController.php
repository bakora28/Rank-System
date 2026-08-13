<?php

namespace App\Http\Controllers;

use App\Http\Resources\TeacherResource;
use App\Models\User;
use App\Rules\EgyptianPhoneNumber;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

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
        $query->when($request->filled('subject'), fn ($q) => $q->where('subject', $request->string('subject')));

        $teachers = $query->orderBy('name')->paginate($request->integer('per_page', 20));

        return TeacherResource::collection($teachers);
    }

    public function export()
    {
        $teachers = User::query()->role('teacher')->orderBy('name')->get(['name', 'email', 'phone']);

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Teachers');

        $sheet->fromArray(['Name', 'Email', 'Phone'], null, 'A1');
        $sheet->getStyle('A1:C1')->getFont()->setBold(true);

        $row = 2;
        foreach ($teachers as $teacher) {
            $sheet->fromArray([$teacher->name, $teacher->email, $teacher->phone ?? ''], null, "A{$row}");
            $row++;
        }

        foreach (['A', 'B', 'C'] as $column) {
            $sheet->getColumnDimension($column)->setAutoSize(true);
        }

        $filename = 'teachers-'.now()->format('Y-m-d').'.xlsx';

        return response()->streamDownload(function () use ($spreadsheet) {
            (new Xlsx($spreadsheet))->save('php://output');
        }, $filename, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'phone' => ['nullable', 'string', new EgyptianPhoneNumber],
            'subject' => ['required', 'in:maths,science'],
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
            'phone' => ['sometimes', 'nullable', 'string', new EgyptianPhoneNumber],
            'subject' => ['sometimes', 'nullable', 'in:maths,science'],
            'is_active' => ['sometimes', 'boolean'],
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
