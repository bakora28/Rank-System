<?php

namespace Database\Seeders;

use App\Models\Gift;
use Illuminate\Database\Seeder;

class GiftsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $gifts = [
            [
                'name' => 'iPhone',
                'slug' => 'iphone',
                'description' => 'Awarded manually by admin — timing and criteria to be decided.',
                'criteria_type' => 'manual',
                'period' => 'none',
                'sort_order' => 1,
            ],
            [
                'name' => 'Smart Watch',
                'slug' => 'smart-watch',
                'description' => 'Awarded manually by admin — timing and criteria to be decided.',
                'criteria_type' => 'manual',
                'period' => 'none',
                'sort_order' => 2,
            ],
            [
                'name' => 'Smartboard',
                'slug' => 'smartboard',
                'description' => 'Awarded automatically to the #1 teacher by approved book purchases at the end of the year.',
                'criteria_type' => 'period_top1',
                'period' => 'yearly',
                'sort_order' => 3,
            ],
            [
                'name' => 'iPad',
                'slug' => 'ipad',
                'description' => 'Awarded automatically to the #1 teacher by approved book purchases each term (every 6 months).',
                'criteria_type' => 'period_top1',
                'period' => '6_months',
                'sort_order' => 4,
            ],
        ];

        foreach ($gifts as $gift) {
            Gift::query()->updateOrCreate(['slug' => $gift['slug']], $gift);
        }
    }
}
