<?php

namespace App\Http\Controllers;

use App\Models\PurchaseRequest;
use App\Models\User;
use App\Services\LeaderboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class RankController extends Controller
{
    public function __construct(protected LeaderboardService $leaderboard)
    {
    }

    /**
     * GET /api/ranks?period=day|month|year|all&scope=top10|full&q=
     *
     * scope=top10 (default): top 10 rows; if the current user is a teacher
     * outside the top 10, their own row is appended, mirroring the reference
     * design's "your position" row below the main table.
     *
     * scope=full: the entire ordered list, paginated, admin/assistant only,
     * with optional `q` search by teacher name.
     */
    public function index(Request $request)
    {
        $period = $request->string('period', 'month')->value();
        $scope = $request->string('scope', 'top10')->value();

        [$start, $end] = $this->leaderboard->bounds($period);
        [$prevStart, $prevEnd] = $this->leaderboard->previousBounds($period);

        $points = $this->leaderboard->points($start, $end);
        $previousPoints = $this->leaderboard->points($prevStart, $prevEnd);

        $teachersQuery = User::query()->role('teacher');

        if ($scope === 'full' && $request->filled('q')) {
            $teachersQuery->where('name', 'like', '%'.$request->string('q').'%');
        }

        $teachers = $teachersQuery->get(['id', 'name', 'email', 'avatar']);

        $rows = $teachers->map(function (User $teacher) use ($points, $previousPoints) {
            $current = $points->get($teacher->id, 0);
            $previous = $previousPoints->get($teacher->id, 0);

            return [
                'teacher' => [
                    'id' => $teacher->id,
                    'name' => $teacher->name,
                    'avatar' => $teacher->avatar,
                ],
                'points' => $current,
                'delta' => $current - $previous,
            ];
        })
            ->sortByDesc('points')
            ->values();

        $rows = $rows->map(function ($row, $index) {
            $row['position'] = $index + 1;

            return $row;
        });

        if ($scope === 'full') {
            $perPage = $request->integer('per_page', 20);
            $page = $request->integer('page', 1);

            return response()->json([
                'data' => $rows->forPage($page, $perPage)->values(),
                'meta' => [
                    'total' => $rows->count(),
                    'per_page' => $perPage,
                    'current_page' => $page,
                    'last_page' => max(1, (int) ceil($rows->count() / $perPage)),
                ],
            ]);
        }

        $top10 = $rows->take(10)->values();

        $me = null;
        if ($request->user()->hasRole('teacher')) {
            $me = $rows->firstWhere('teacher.id', $request->user()->id);
        }

        return response()->json([
            'data' => $top10,
            'me' => ($me && $me['position'] > 10) ? $me : null,
        ]);
    }

    /**
     * GET /api/ranks/activity?days=7
     *
     * Daily count of approved purchases over the trailing window — teachers
     * see only their own activity, admin/assistant see the whole school's.
     */
    public function activity(Request $request)
    {
        $days = min(30, max(1, $request->integer('days', 7)));
        $start = now()->subDays($days - 1)->startOfDay();

        $query = PurchaseRequest::query()
            ->selectRaw('DATE(reviewed_at) as date, COUNT(*) as count')
            ->where('status', 'approved')
            ->where('reviewed_at', '>=', $start)
            ->groupBy('date');

        if ($request->user()->hasRole('teacher')) {
            $query->where('teacher_id', $request->user()->id);
        }

        $counts = $query->pluck('count', 'date');

        $series = collect(range(0, $days - 1))->map(function (int $offset) use ($start, $counts) {
            $date = $start->copy()->addDays($offset);

            return [
                'date' => $date->toDateString(),
                'label' => $date->format('D'),
                'count' => $counts->get($date->toDateString(), 0),
            ];
        });

        return response()->json(['data' => $series]);
    }
}
