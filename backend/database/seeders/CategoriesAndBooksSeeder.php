<?php

namespace Database\Seeders;

use App\Models\Book;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoriesAndBooksSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'General Science' => ['science', '#2f8fe0', ['Campbell Biology', 'Cosmos', 'A Brief History of Time']],
            'Maths' => ['maths', '#8e44ad', ['Calculus Made Easy', 'Introduction to Algebra', 'Elements of Geometry']],
            'Chemistry' => ['science', '#27ae60', ['General Chemistry', 'Organic Chemistry', 'Chemistry: The Central Science']],
            'Physics' => ['science', '#e67e22', ['University Physics', 'Six Easy Pieces', 'Physics for Scientists and Engineers']],
            'Biology' => ['science', '#16a085', ['Molecular Biology of the Cell', 'Life: The Science of Biology', 'Genetics: Analysis and Principles']],
        ];

        foreach ($categories as $name => [$subject, $color, $books]) {
            $category = Category::query()->firstOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'subject' => $subject, 'color' => $color]
            );

            foreach ($books as $bookName) {
                Book::query()->firstOrCreate([
                    'category_id' => $category->id,
                    'name' => $bookName,
                ]);
            }
        }
    }
}
