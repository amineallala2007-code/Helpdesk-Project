<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TicketMessageController extends Controller
{
    public function index($ticketId)
    {
        if (!$ticketId) {
            return response()->json(['message' => 'Ticket ID manquant'], 400);
        }

        $messages = TicketMessage::where('ticket_id', $ticketId)
            ->with('author:id,name,role') 
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages, 200);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'body' => 'required|string',
        ]);

        try {
            $ticket = Ticket::findOrFail($id);

            if ($ticket->status === 'closed') {
                return response()->json(['message' => 'Ce ticket est fermé.'], 422);
            }

            $message = TicketMessage::create([
                'ticket_id' => $ticket->id,
                'author_id' => Auth::id(),
                'body'      => $request->body,
            ]);

            $message->load('author:id,name,role');

            return response()->json($message, 201);
        } catch (\Exception $e) {
            Log::error("Message error: " . $e->getMessage());
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }
}
