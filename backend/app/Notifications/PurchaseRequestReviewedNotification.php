<?php

namespace App\Notifications;

use App\Models\PurchaseRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PurchaseRequestReviewedNotification extends Notification
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
        $status = $this->purchaseRequest->status;

        return [
            'type' => 'purchase_request.reviewed',
            'purchase_request_id' => $this->purchaseRequest->id,
            'book_name' => $this->purchaseRequest->book->name,
            'status' => $status,
            'message' => "Your purchase of \"{$this->purchaseRequest->book->name}\" was {$status}.",
        ];
    }
}
