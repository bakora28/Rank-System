<?php

namespace App\Http\Controllers;

use App\Http\Resources\BookResource;
use App\Models\Book;
use App\Models\BookFile;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BookController extends Controller
{
    public function index(Request $request, Category $category)
    {
        $books = $category->books()
            ->with(array_filter([
                $request->user()->hasRole('teacher') ? 'myRequest' : null,
                'files',
            ]))
            ->orderBy('name')
            ->get();

        return BookResource::collection($books);
    }

    public function store(Request $request, Category $category)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'images' => ['sometimes', 'array'],
            'images.*' => ['file', 'mimes:png,jpg,jpeg,pdf', 'max:5120'],
        ]);

        $book = $category->books()->create([
            'name' => $data['name'],
            'created_by' => $request->user()->id,
        ]);

        $this->storeFiles($book, $request->file('images', []));

        return new BookResource($book->load('files'));
    }

    public function update(Request $request, Book $book)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category_id' => ['sometimes', 'exists:categories,id'],
        ]);

        $book->update($data);

        return new BookResource($book->load(['category', 'files']));
    }

    public function storeFiles(Book $book, array $files): array
    {
        return array_map(function ($file) use ($book) {
            $path = $file->store('books', 'public');

            return $book->files()->create([
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getClientMimeType(),
                'size' => $file->getSize(),
            ]);
        }, $files);
    }

    public function uploadFiles(Request $request, Book $book)
    {
        $data = $request->validate([
            'images' => ['required', 'array', 'min:1'],
            'images.*' => ['file', 'mimes:png,jpg,jpeg,pdf', 'max:5120'],
        ]);

        $this->storeFiles($book, $data['images']);

        return new BookResource($book->load('files'));
    }

    public function destroyFile(Book $book, BookFile $file)
    {
        abort_unless($file->book_id === $book->id, 404);

        Storage::disk('public')->delete($file->path);
        $file->delete();

        return response()->noContent();
    }

    public function destroy(Book $book)
    {
        $book->files->each(fn (BookFile $file) => Storage::disk('public')->delete($file->path));
        $book->delete();

        return response()->noContent();
    }
}
