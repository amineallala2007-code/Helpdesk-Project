<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketMessageController;
use App\Http\Controllers\Admin\UserController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    Route::get('/categories', [TicketController::class, 'getCategories']);
    Route::get('/priorities', [TicketController::class, 'getPriorities']);

    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::patch('/tickets/{id}', [TicketController::class, 'update']);

    Route::put('/tickets/{id}/assign', [TicketController::class, 'assignToMe']);
    Route::put('/tickets/{id}/status', [TicketController::class, 'updateStatus']);

    Route::get('/tickets/{id}/messages', [TicketMessageController::class, 'index']);
    Route::post('/tickets/{id}/messages', [TicketMessageController::class, 'store']);


    Route::get('/admin/users', [UserController::class, 'index']);
    Route::put('/admin/users/{id}', [UserController::class, 'updateUserRole']);

    Route::put('/admin/tickets/{id}/assign', [TicketController::class, 'assignAgent']);


    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);
});