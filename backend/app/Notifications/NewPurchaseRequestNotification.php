<?php

namespace App\Notifications;

use App\Models\PurchaseRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewPurchaseRequestNotification extends Notification
{
    use Queueable;

    public function __construct(protected PurchaseRequest $purchaseRequest)
    {
    }

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'purchase_request.created',
            'purchase_request_id' => $this->purchaseRequest->id,
            'teacher_name' => $this->purchaseRequest->teacher->name,
            'book_name' => $this->purchaseRequest->book->name,
            'message' => "{$this->purchaseRequest->teacher->name} marked \"{$this->purchaseRequest->book->name}\" as bought.",
        ];
    }
}
