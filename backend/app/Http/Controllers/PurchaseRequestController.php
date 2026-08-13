<?php

namespace App\Http\Controllers;

use App\Http\Resources\PurchaseRequestResource;
use App\Models\PurchaseRequest;
use App\Models\User;
use App\Notifications\NewPurchaseRequestNotification;
use App\Notifications\PurchaseRequestReviewedNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification as NotificationFacade;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class PurchaseRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseRequest::query()->with(['teacher', 'book.category', 'reviewer']);

        if ($request->user()->hasRole('teacher')) {
            $query->where('teacher_id', $request->user()->id);
        } else {
            $query->when($request->filled('teacher_id'), fn ($q) => $q->where('teacher_id', $request->integer('teacher_id')));
        }

        $query->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')));
        $query->when($request->filled('book_id'), fn ($q) => $q->where('book_id', $request->integer('book_id')));
        $query->when($request->filled('category_id'), function ($q) use ($request) {
            $q->whereHas('book', fn ($b) => $b->where('category_id', $request->integer('category_id')));
        });
        $query->when($request->filled('date_from'), fn ($q) => $q->whereDate('created_at', '>=', $request->string('date_from')));
        $query->when($request->filled('date_to'), fn ($q) => $q->whereDate('created_at', '<=', $request->string('date_to')));
        $query->when($request->filled('q'), function ($q) use ($request) {
            $term = '%'.$request->string('q').'%';
            $q->where(function ($inner) use ($term) {
                $inner->whereHas('teacher', fn ($t) => $t->where('name', 'like', $term))
                    ->orWhereHas('book', fn ($b) => $b->where('name', 'like', $term));
            });
        });

        $requests = $query->latest()->paginate($request->integer('per_page', 20));

        return PurchaseRequestResource::collection($requests);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'book_id' => ['required', 'exists:books,id'],
            'receipt' => ['required', 'file', 'mimes:png,jpg,jpeg,pdf', 'max:5120'],
            'teacher_note' => ['nullable', 'string', 'max:500'],
        ]);

        $exists = PurchaseRequest::query()
            ->where('teacher_id', $request->user()->id)
            ->where('book_id', $data['book_id'])
            ->whereIn('status', ['pending', 'approved'])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'book_id' => 'You already have a pending or approved request for this book.',
            ]);
        }

        $receiptPath = $request->file('receipt')->store('receipts', 'public');

        $purchaseRequest = PurchaseRequest::query()->create([
            'teacher_id' => $request->user()->id,
            'book_id' => $data['book_id'],
            'status' => 'pending',
            'receipt_path' => $receiptPath,
            'teacher_note' => $data['teacher_note'] ?? null,
        ]);
        $purchaseRequest->load(['teacher', 'book.category']);

        NotificationFacade::send(
            User::withPermission('requests.edit'),
            new NewPurchaseRequestNotification($purchaseRequest)
        );

        return new PurchaseRequestResource($purchaseRequest);
    }

    public function update(Request $request, PurchaseRequest $purchaseRequest)
    {
        $data = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $purchaseRequest->update([
            'status' => $data['status'],
            'note' => $data['note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);
        $purchaseRequest->load(['teacher', 'book.category', 'reviewer']);

        $purchaseRequest->teacher->notify(new PurchaseRequestReviewedNotification($purchaseRequest));

        return new PurchaseRequestResource($purchaseRequest);
    }
}
