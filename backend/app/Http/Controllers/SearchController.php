<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    /** Global admin search across teachers, books, and categories. */
    public function index(Request $request)
    {
        $data = $request->validate(['q' => ['required', 'string', 'min:1']]);
        $term = '%'.$data['q'].'%';

        $teachers = User::query()->role('teacher')
            ->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term))
            ->limit(5)
            ->get(['id', 'name', 'email', 'avatar']);

        $books = Book::query()->with('category')
            ->where('name', 'like', $term)
            ->limit(5)
            ->get();

        $categories = Category::query()
            ->where('name', 'like', $term)
            ->limit(5)
            ->get();

        return response()->json([
            'teachers' => $teachers,
            'books' => $books,
            'categories' => $categories,
        ]);
    }
}
