<?php

namespace App\Console\Commands;

use App\Models\Gift;
use App\Models\GiftAward;
use App\Notifications\GiftAwardedNotification;
use App\Services\LeaderboardService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:award-periodic-gifts')]
#[Description('Awards period-based gifts (Smartboard every 6 months, iPad yearly) to the top approved-purchase teacher once their window closes. Idempotent — safe to run daily.')]
class AwardPeriodicGifts extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(LeaderboardService $leaderboard): void
    {
        $gifts = Gift::query()->where('is_active', true)->where('criteria_type', 'period_top1')->get();

        foreach ($gifts as $gift) {
            [$start, $end] = match ($gift->period) {
                '6_months' => $leaderboard->lastCompletedHalfYearBounds(),
                'yearly' => $leaderboard->lastCompletedYearBounds(),
                default => [null, null],
            };

            if (! $start || ! $end) {
                continue;
            }

            $topTeacherId = $leaderboard->topTeacherId($start, $end);

            if (! $topTeacherId) {
                $this->info("No approved purchases in {$gift->name}'s window ({$start->toDateString()} - {$end->toDateString()}), skipping.");

                continue;
            }

            $award = GiftAward::query()->firstOrCreate(
                [
                    'gift_id' => $gift->id,
                    'period_start' => $start->toDateString(),
                    'period_end' => $end->toDateString(),
                ],
                [
                    'user_id' => $topTeacherId,
                    'awarded_by' => null,
                    'awarded_at' => now(),
                ]
            );

            if ($award->wasRecentlyCreated) {
                $award->load(['gift', 'user']);
                $award->user->notify(new GiftAwardedNotification($award));
                $this->info("Awarded {$gift->name} to {$award->user->name} for {$start->toDateString()} - {$end->toDateString()}.");
            }
        }
    }
}
