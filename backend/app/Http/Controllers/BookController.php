<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request, Category $category)
    {
        $books = $category->books()
            ->with($request->user()->hasRole('teacher') ? ['myRequest'] : [])
            ->orderBy('name')
            ->get();

        return BookResource::collection($books);
    }

    public function store(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $book = $category->books()->create([
            'name' => $data['name'],
            'created_by' => $request->user()->id,
        ]);

        return new BookResource($book);
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'exists:categories,id'],
        ]);

        $book->update($data);

        return new BookResource($book->load('category'));
    }

    public function destroy(Book $book)
    {
        $book->delete();

        return response()->noContent();
    }
}
