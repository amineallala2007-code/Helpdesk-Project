<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\TicketMessageController;

// 🚪 رابط تسجيل الدخول (مفتوح للعموم)
Route::post('/auth/login', [AuthController::class, 'login']);

// 🔒 الروابط المحمية (خاص يكون المستخدم مسجل الدخول بـ Token)
Route::middleware('auth:sanctum')->group(function () {
    
    // 👤 روابط الحساب والمستخدم
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // 🎫 روابط التذاكر الأساسية (Index و Store محترمين الـ Roles دابا)
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::post('/tickets', [TicketController::class, 'store']); 
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::patch('/tickets/{id}', [TicketController::class, 'update']);

    // 🎧 روابط التحكم الخاصة بالـ Agent (على حساب دفتر التحملات)
    Route::put('/tickets/{id}/assign', [TicketController::class, 'assign']); // الـ Agent كيشد التيكيت لراسو
    Route::put('/tickets/{id}/update-status', [TicketController::class, 'updateStatus']); // الـ Agent كيغير الـ Category و الـ Priority و الـ Status

    // 💬 روابط الرسائل والمحادثة وسط التذكرة (Ticket Messages)
    Route::get('/tickets/{ticket}/messages', [TicketMessageController::class, 'index']);
    Route::post('/tickets/{ticket}/messages', [TicketMessageController::class, 'store']);
});