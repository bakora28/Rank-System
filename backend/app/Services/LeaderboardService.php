<?php

namespace App\Services;

use App\Models\PurchaseRequest;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class LeaderboardService
{
    /**
     * @return array{0: ?Carbon, 1: ?Carbon} start/end bounds, both null for "all time"
     */
    public function bounds(string $period, ?Carbon $reference = null): array
    {
        $ref = ($reference ?? now())->copy();

        return match ($period) {
            'day' => [$ref->copy()->startOfDay(), $ref->copy()->endOfDay()],
            'month' => [$ref->copy()->startOfMonth(), $ref->copy()->endOfMonth()],
            'year', 'yearly' => [$ref->copy()->startOfYear(), $ref->copy()->endOfYear()],
            '6_months' => $this->halfYearBounds($ref),
            default => [null, null],
        };
    }

    /**
     * @return array{0: Carbon, 1: Carbon}
     */
    public function halfYearBounds(Carbon $reference): array
    {
        $isFirstHalf = $reference->month <= 6;

        $start = $reference->copy()->startOfYear()->month($isFirstHalf ? 1 : 7)->startOfMonth();
        $end = $start->copy()->addMonths(5)->endOfMonth();

        return [$start, $end];
    }

    /**
     * @return array{0: ?Carbon, 1: ?Carbon}
     */
    public function previousBounds(string $period, ?Carbon $reference = null): array
    {
        $ref = ($reference ?? now())->copy();

        return match ($period) {
            'day' => $this->bounds('day', $ref->subDay()),
            'month' => $this->bounds('month', $ref->subMonthNoOverflow()),
            'year', 'yearly' => $this->bounds('year', $ref->subYear()),
            default => [null, null],
        };
    }

    /** teacher_id => approved purchase count, ordered descending. */
    public function points(?Carbon $start, ?Carbon $end): Collection
    {
        return PurchaseRequest::query()
            ->selectRaw('teacher_id, COUNT(*) as points')
            ->where('status', 'approved')
            ->when($start, fn ($q) => $q->where('reviewed_at', '>=', $start))
            ->when($end, fn ($q) => $q->where('reviewed_at', '<=', $end))
            ->groupBy('teacher_id')
            ->orderByDesc('points')
            ->pluck('points', 'teacher_id');
    }

    /** Top-1 teacher_id for a period, or null if nobody qualifies. */
    public function topTeacherId(?Carbon $start, ?Carbon $end): ?int
    {
        return $this->points($start, $end)->keys()->first();
    }

    /** The most recently *completed* half-year window relative to $reference. */
    public function lastCompletedHalfYearBounds(?Carbon $reference = null): array
    {
        [$currentStart] = $this->halfYearBounds(($reference ?? now())->copy());

        return $this->halfYearBounds($currentStart->copy()->subDay());
    }

    /** The most recently *completed* calendar year relative to $reference. */
    public function lastCompletedYearBounds(?Carbon $reference = null): array
    {
        return $this->bounds('year', ($reference ?? now())->copy()->subYear());
    }
}
