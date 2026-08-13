<?php

use App\Http\Controllers\AdminUserController;
use App\Http\Controllers\AssistantController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\GiftController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PurchaseRequestController;
use App\Http\Controllers\RankController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::put('/profile', [ProfileController::class, 'update']);
    Route::put('/profile/password', [ProfileController::class, 'updatePassword']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);

    Route::get('/ranks', [RankController::class, 'index']);
    Route::get('/ranks/activity', [RankController::class, 'activity']);

    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::middleware('permission:categories.view')->group(function () {
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{category}', [CategoryController::class, 'show']);
    });
    Route::middleware('permission:books.view')->get('/categories/{category}/books', [BookController::class, 'index']);
    Route::middleware('permission:categories.add')->post('/categories', [CategoryController::class, 'store']);
    Route::middleware('permission:categories.edit')->put('/categories/{category}', [CategoryController::class, 'update']);
    Route::middleware('permission:categories.delete')->delete('/categories/{category}', [CategoryController::class, 'destroy']);

    Route::middleware('permission:books.add')->post('/categories/{category}/books', [BookController::class, 'store']);
    Route::middleware('permission:books.edit')->put('/books/{book}', [BookController::class, 'update']);
    Route::middleware('permission:books.edit')->post('/books/{book}/files', [BookController::class, 'uploadFiles']);
    Route::middleware('permission:books.edit')->delete('/books/{book}/files/{file}', [BookController::class, 'destroyFile']);
    Route::middleware('permission:books.delete')->delete('/books/{book}', [BookController::class, 'destroy']);

    Route::middleware('permission:requests.view')->get('/purchase-requests', [PurchaseRequestController::class, 'index']);
    Route::middleware('permission:requests.add')->post('/purchase-requests', [PurchaseRequestController::class, 'store']);
    Route::middleware('permission:requests.edit')->patch('/purchase-requests/{purchaseRequest}', [PurchaseRequestController::class, 'update']);

    Route::middleware('permission:gifts.view')->group(function () {
        Route::get('/gifts', [GiftController::class, 'index']);
        Route::get('/gifts/winners', [GiftController::class, 'winners']);
    });
    Route::middleware('permission:gifts.add')->post('/gifts', [GiftController::class, 'store']);
    Route::middleware('permission:gifts.edit')->group(function () {
        Route::put('/gifts/{gift}', [GiftController::class, 'update']);
        Route::post('/gifts/{gift}/award', [GiftController::class, 'award']);
    });
    Route::middleware('permission:gifts.delete')->delete('/gifts/{gift}', [GiftController::class, 'destroy']);

    Route::middleware('permission:teachers.view')->get('/teachers', [TeacherController::class, 'index']);
    Route::middleware('permission:teachers.view')->get('/teachers/export', [TeacherController::class, 'export']);
    Route::middleware('permission:teachers.add')->post('/teachers', [TeacherController::class, 'store']);
    Route::middleware('permission:teachers.edit')->put('/teachers/{teacher}', [TeacherController::class, 'update']);
    Route::middleware('permission:teachers.delete')->delete('/teachers/{teacher}', [TeacherController::class, 'destroy']);

    // Assistant + admin management is admin-only and never delegable.
    Route::middleware('role:admin')->group(function () {
        Route::get('/assistants', [AssistantController::class, 'index']);
        Route::post('/assistants', [AssistantController::class, 'store']);
        Route::put('/assistants/{assistant}', [AssistantController::class, 'update']);
        Route::put('/assistants/{assistant}/permissions', [AssistantController::class, 'updatePermissions']);
        Route::delete('/assistants/{assistant}', [AssistantController::class, 'destroy']);

        Route::get('/admins', [AdminUserController::class, 'index']);
        Route::post('/admins', [AdminUserController::class, 'store']);
        Route::put('/admins/{admin}', [AdminUserController::class, 'update']);
        Route::delete('/admins/{admin}', [AdminUserController::class, 'destroy']);
    });

    Route::middleware('role:admin|assistant')->get('/search', [SearchController::class, 'index']);
});
