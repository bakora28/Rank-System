<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WhatsappAccount;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class WhatsappMessageController extends Controller
{
    public function __construct(protected WhatsAppService $whatsApp)
    {
    }

    /**
     * Bulk-sends a WhatsApp message to a chosen audience of teachers:
     * all of them, everyone in one subject, or a hand-picked list.
     */
    public function send(Request $request)
    {
        $data = $request->validate([
            'account_id' => ['required', 'exists:whatsapp_accounts,id'],
            'message' => ['required', 'string', 'max:2000'],
            'audience' => ['required', 'in:all,subject,manual'],
            'subject' => ['required_if:audience,subject', 'nullable', 'in:maths,science'],
            'teacher_ids' => ['required_if:audience,manual', 'array'],
            'teacher_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $account = WhatsappAccount::query()->findOrFail($data['account_id']);

        if (! $account->is_active) {
            throw ValidationException::withMessages(['account_id' => 'This WhatsApp number is not active.']);
        }

        $teachersQuery = User::query()->role('teacher');

        match ($data['audience']) {
            'subject' => $teachersQuery->where('subject', $data['subject']),
            'manual' => $teachersQuery->whereIn('id', $data['teacher_ids']),
            default => null,
        };

        $teachers = $teachersQuery->get(['id', 'name', 'phone']);

        $sent = 0;
        $failed = 0;
        $skippedNoPhone = 0;
        $failedNames = [];

        foreach ($teachers as $teacher) {
            if (! $teacher->phone) {
                $skippedNoPhone++;

                continue;
            }

            $chatId = $this->whatsApp->toChatId($teacher->phone);
            $ok = $this->whatsApp->sendMessage($account->instance_id, $account->access_token, $chatId, $data['message']);

            if ($ok) {
                $sent++;
            } else {
                $failed++;
                $failedNames[] = $teacher->name;
            }
        }

        return response()->json([
            'sent' => $sent,
            'failed' => $failed,
            'skipped_no_phone' => $skippedNoPhone,
            'failed_names' => $failedNames,
        ]);
    }
}
