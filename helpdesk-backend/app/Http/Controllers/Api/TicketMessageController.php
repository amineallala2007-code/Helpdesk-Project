<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Support\Facades\Auth;

class TicketMessageController extends Controller
{
    public function index($ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);

        // حماية: الطلب يشوف غير الميساجات د التذاكر ديالو
        if (Auth::user()->role === 'requester' && $ticket->requester_id !== Auth::id()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $messages = $ticket->messages()->with('author')->orderBy('created_at', 'asc')->get();
        return response()->json($messages);
    }

    // POST /api/tickets/{ticket_id}/messages (إضافة تعليق جديد)
    public function store(Request $request, $ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);

        if (Auth::user()->role === 'requester' && $ticket->requester_id !== Auth::id()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $request->validate([
            'body' => 'required|string',
        ]);

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'author_id' => Auth::id(),
            'body' => $request->body,
        ]);

        // نرجعو الميساج مع معلومات الكاتب ديالو (الاسم والـ role)
        return response()->json($message->load('author'), 201);
    }
}
