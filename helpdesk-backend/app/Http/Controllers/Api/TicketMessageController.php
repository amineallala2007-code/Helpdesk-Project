<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TicketMessageController extends Controller
{
    private function role($user): string
    {
        return strtolower((string) ($user?->role ?? ''));
    }

    public function index(Request $request, $ticketId)
    {
        $ticket = Ticket::findOrFail($ticketId);
        $this->authorizeTicketAccess($request, $ticket);

        $messages = TicketMessage::where('ticket_id', $ticketId)
            ->with(['author:id,name,email,role,photo', 'attachments'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($messages, 200);
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'body' => 'nullable|string',
            'attachment' => 'nullable|image|max:4096',
        ]);

        if (!$request->filled('body') && !$request->hasFile('attachment')) {
            return response()->json(['message' => 'Ajoutez un message ou une image.'], 422);
        }

        try {
            $ticket = Ticket::findOrFail($id);
            $this->authorizeTicketAccess($request, $ticket);

            if ($ticket->status === 'closed') {
                return response()->json(['message' => 'Ce ticket est ferme.'], 422);
            }

            $message = TicketMessage::create([
                'ticket_id' => $ticket->id,
                'author_id' => Auth::id(),
                'body' => $request->body ?? '',
            ]);

            if ($request->hasFile('attachment')) {
                $file = $request->file('attachment');
                $path = $file->store('ticket-attachments', 'public');

                Attachment::create([
                    'ticket_id' => $ticket->id,
                    'message_id' => $message->id,
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'mime' => $file->getMimeType(),
                    'size' => $file->getSize(),
                ]);
            }

            $message->load(['author:id,name,email,role,photo', 'attachments']);

            return response()->json($message, 201);
        } catch (\Exception $e) {
            Log::error('Message error: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur', 'error' => $e->getMessage()], 500);
        }
    }

    private function authorizeTicketAccess(Request $request, Ticket $ticket): void
    {
        $user = $request->user();
        $role = $this->role($user);
        $isAdmin = $role === 'admin';
        $isAssignedAgent = $role === 'agent' && (int) $ticket->assignee_id === (int) $user?->id;
        $isOwner = (int) $ticket->requester_id === (int) $user?->id;

        abort_unless($isAdmin || $isAssignedAgent || $isOwner, 403, 'Acces interdit');
    }
}
