<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\AdminAnnouncementNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification as NotificationFacade;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'data' => $user->notifications()->latest()->limit(30)->get(),
            'unread_count' => $user->unreadNotifications()->count(),
        ]);
    }

    /**
     * Admin/assistant-triggered manual announcement to teachers, optionally
     * scoped to a single subject (Maths or Science).
     */
    public function broadcast(Request $request)
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:500'],
            'subject' => ['nullable', 'in:maths,science'],
        ]);

        $teachers = User::query()->role('teacher')
            ->when($data['subject'] ?? null, fn ($q, $subject) => $q->where('subject', $subject))
            ->get();

        NotificationFacade::send($teachers, new AdminAnnouncementNotification($data['message'], $request->user()));

        return response()->json(['sent_to' => $teachers->count()]);
    }

    public function markRead(Request $request, string $id)
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return response()->noContent();
    }

    public function markAllRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->noContent();
    }
}
