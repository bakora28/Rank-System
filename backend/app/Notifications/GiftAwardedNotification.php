<?php

namespace App\Notifications;

use App\Models\GiftAward;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class GiftAwardedNotification extends Notification
{
    use Queueable;

    public function __construct(protected GiftAward $giftAward)
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
            'type' => 'gift.awarded',
            'gift_award_id' => $this->giftAward->id,
            'gift_name' => $this->giftAward->gift->name,
            'winner_name' => $this->giftAward->user->name,
            'message' => "{$this->giftAward->user->name} won the {$this->giftAward->gift->name}!",
        ];
    }
}
