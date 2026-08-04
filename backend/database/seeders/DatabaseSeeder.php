<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolesAndPermissionsSeeder::class,
            CategoriesAndBooksSeeder::class,
            GiftsSeeder::class,
        ]);

        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@ranksystem.test'],
            ['name' => 'System Admin', 'password' => 'password', 'is_active' => true]
        );
        $admin->assignRole('admin');

        $teacher = User::query()->firstOrCreate(
            ['email' => 'teacher@ranksystem.test'],
            ['name' => 'Demo Teacher', 'password' => 'password', 'is_active' => true]
        );
        $teacher->assignRole('teacher');
    }
}
