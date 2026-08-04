<?php

namespace App\Http\Controllers;

use App\Http\Resources\GiftAwardResource;
use App\Http\Resources\GiftResource;
use App\Models\Gift;
use App\Models\GiftAward;
use App\Models\User;
use App\Notifications\GiftAwardedNotification;
use App\Services\LeaderboardService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GiftController extends Controller
{
    public function __construct(protected LeaderboardService $leaderboard)
    {
    }

    public function index(Request $request)
    {
        $gifts = Gift::query()
            ->with(['awards' => fn ($q) => $q->latest('awarded_at')->with('user')])
            ->orderBy('sort_order')
            ->get();

        $gifts->each(function (Gift $gift) use ($request) {
            if ($gift->criteria_type !== 'period_top1') {
                return;
            }

            [$start, $end] = $this->leaderboard->bounds($gift->period);
            $points = $this->leaderboard->points($start, $end);
            $leaderId = $points->keys()->first();

            $gift->progress = [
                'period_start' => $start,
                'period_end' => $end,
                'leader' => $leaderId ? [
                    'id' => $leaderId,
                    'name' => User::find($leaderId)?->name,
                    'points' => $points->first(),
                ] : null,
                'my_points' => $request->user()->hasRole('teacher') ? $points->get($request->user()->id, 0) : null,
            ];
        });

        return GiftResource::collection($gifts);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:gifts,name'],
            'description' => ['nullable', 'string'],
            'criteria_type' => ['required', 'in:manual,period_top1'],
            'period' => ['required', 'in:none,6_months,yearly'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        $gift = Gift::query()->create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'criteria_type' => $data['criteria_type'],
            'period' => $data['period'],
            'is_active' => $data['is_active'] ?? true,
            'image_path' => $request->hasFile('image') ? $request->file('image')->store('gifts', 'public') : null,
            'sort_order' => (Gift::query()->max('sort_order') ?? 0) + 1,
        ]);

        return new GiftResource($gift);
    }

    public function update(Request $request, Gift $gift)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:gifts,name,'.$gift->id],
            'description' => ['nullable', 'string'],
            'criteria_type' => ['required', 'in:manual,period_top1'],
            'period' => ['required', 'in:none,6_months,yearly'],
            'is_active' => ['boolean'],
            'image' => ['nullable', 'image', 'max:4096'],
        ]);

        if ($request->hasFile('image')) {
            if ($gift->image_path) {
                Storage::disk('public')->delete($gift->image_path);
            }
            $data['image_path'] = $request->file('image')->store('gifts', 'public');
        }

        $gift->update([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']),
            'description' => $data['description'] ?? null,
            'criteria_type' => $data['criteria_type'],
            'period' => $data['period'],
            'is_active' => $data['is_active'] ?? $gift->is_active,
            'image_path' => $data['image_path'] ?? $gift->image_path,
        ]);

        return new GiftResource($gift);
    }

    public function destroy(Gift $gift)
    {
        if ($gift->image_path) {
            Storage::disk('public')->delete($gift->image_path);
        }
        $gift->delete();

        return response()->noContent();
    }

    /** Manual award — used for manual-criteria gifts (iPhone / Smart Watch) or admin overrides. */
    public function award(Request $request, Gift $gift)
    {
        $data = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
        ]);

        $award = GiftAward::query()->create([
            'gift_id' => $gift->id,
            'user_id' => $data['user_id'],
            'awarded_by' => $request->user()->id,
            'awarded_at' => now(),
        ]);
        $award->load(['gift', 'user']);

        $award->user->notify(new GiftAwardedNotification($award));

        return new GiftAwardResource($award);
    }

    public function winners(Request $request)
    {
        $awards = GiftAward::query()
            ->with(['gift', 'user'])
            ->latest('awarded_at')
            ->paginate($request->integer('per_page', 12));

        return GiftAwardResource::collection($awards);
    }
}
