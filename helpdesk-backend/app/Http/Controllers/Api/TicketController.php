<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Category;
use App\Models\Priority;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    private function role($user): string
    {
        return strtolower((string) ($user?->role ?? ''));
    }

    public function index()
    {
        try {
            $user = Auth::user();
            $role = $this->role($user);

            $query = Ticket::with(['requester', 'category', 'priority', 'assignee', 'attachments'])
                ->orderBy('created_at', 'desc');

            if (!in_array($role, ['admin', 'agent'])) {
                $query->where('requester_id', $user->id);
            }

            return response()->json($query->get(), 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur lors du chargement des tickets',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        if ($this->role(Auth::user()) === 'agent') {
            return response()->json([
                'message' => 'Action non autorisee. Les agents ne peuvent pas creer de tickets.'
            ], 403);
        }

        try {
            $request->validate([
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'category_id' => 'required|exists:categories,id',
                'priority_id' => 'required|exists:priorities,id',
                'attachment' => 'nullable|image|max:4096',
            ]);

            $ticket = Ticket::create([
                'title' => $request->title,
                'description' => $request->description,
                'status' => 'open',
                'requester_id' => Auth::id(),
                'priority_id' => $request->priority_id,
                'category_id' => $request->category_id,
            ]);

            if ($request->hasFile('attachment')) {
                $this->storeAttachment($request->file('attachment'), $ticket->id);
            }

            return response()->json([
                'message' => 'Ticket cree avec succes !',
                'ticket' => $ticket->load(['category', 'priority', 'attachments'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la creation du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $ticket = Ticket::with(['requester', 'category', 'priority', 'assignee', 'attachments'])->findOrFail($id);
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Non autorise'], 403);
            }

            $isOwner = (int) $user->id === (int) $ticket->requester_id;
            $isStaff = in_array($this->role($user), ['admin', 'agent']);

            if (!$isStaff && !$isOwner) {
                return response()->json(['message' => 'Acces interdit'], 403);
            }

            return response()->json($ticket, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);
        $user = Auth::user();

        if ((int) $ticket->requester_id !== (int) $user->id && $this->role($user) !== 'admin') {
            return response()->json(['message' => 'Non autorise'], 403);
        }

        $ticket->delete();
        return response()->json(['message' => 'Ticket supprime'], 200);
    }

    public function updateStatus(Request $request, int $id)
    {
        $user = $request->user();
        $role = $this->role($user);

        if (!$user || !in_array($role, ['admin', 'agent'])) {
            return response()->json(['message' => 'Action non autorisee'], 403);
        }

        $request->validate([
            'status' => 'nullable|in:open,in_progress,resolved,closed',
            'category_id' => 'nullable|exists:categories,id',
            'priority_id' => 'nullable|exists:priorities,id',
        ]);

        try {
            $ticket = Ticket::findOrFail($id);

            if ($role === 'agent' && $ticket->assignee_id !== null && (int) $ticket->assignee_id !== (int) $user->id) {
                return response()->json(['message' => 'Ce ticket est gere par un autre agent'], 403);
            }

            if ($request->has('category_id')) {
                $ticket->category_id = $request->category_id;
            }
            if ($request->has('priority_id')) {
                $ticket->priority_id = $request->priority_id;
            }

            if ($request->has('status')) {
                $ticket->status = $request->status;

                if ($request->status === 'resolved') {
                    $ticket->resolved_at = now();
                } elseif ($request->status === 'closed') {
                    $ticket->closed_at = now();
                }
            }

            $ticket->save();

            return response()->json([
                'message' => 'Ticket mis a jour avec succes',
                'ticket' => $ticket->load(['category', 'priority', 'assignee', 'attachments'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur serveur', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignToMe(Request $request, int $id)
    {
        $user = $request->user();

        if (!$user || $this->role($user) !== 'agent') {
            return response()->json(['message' => 'Non autorise. Reserve aux agents.'], 403);
        }

        try {
            $ticket = Ticket::findOrFail($id);

            $ticket->update([
                'assignee_id' => $user->id,
                'status' => 'in_progress'
            ]);

            return response()->json([
                'message' => 'Ticket assigne avec succes',
                'ticket' => $ticket->load(['category', 'priority', 'assignee', 'attachments'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l assignation', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignAgent(Request $request, $id)
    {
        if ($this->role($request->user()) !== 'admin') {
            return response()->json(['message' => 'Reserve aux administrateurs.'], 403);
        }

        $request->validate([
            'assignee_id' => 'nullable|exists:users,id',
            'agent_id' => 'nullable|exists:users,id',
        ]);

        try {
            $ticket = Ticket::findOrFail($id);
            $agentId = $request->assignee_id ?? $request->agent_id;

            if (!$agentId) {
                return response()->json(['message' => 'ID de l agent est requis'], 400);
            }

            $agent = User::where('id', $agentId)->where('role', 'agent')->first();
            if (!$agent) {
                return response()->json(['message' => 'Agent introuvable.'], 422);
            }

            $ticket->assignee_id = $agentId;
            $ticket->status = 'in_progress';
            $ticket->save();

            return response()->json([
                'message' => 'Ticket assigne avec succes !',
                'ticket' => $ticket->load(['category', 'priority', 'assignee', 'attachments'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l assignation du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmSolution(Request $request, int $id)
    {
        $ticket = Ticket::findOrFail($id);

        if ((int) $ticket->requester_id !== (int) $request->user()->id) {
            return response()->json(['message' => 'Reserve au demandeur du ticket.'], 403);
        }

        if ($ticket->status !== 'resolved') {
            return response()->json(['message' => 'Le ticket doit etre marque comme resolu avant validation.'], 422);
        }

        $ticket->update([
            'status' => 'closed',
            'closed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Solution validee. Ticket ferme.',
            'ticket' => $ticket->load(['category', 'priority', 'assignee', 'attachments']),
        ]);
    }

    public function getCategories()
    {
        return response()->json(Category::all());
    }

    public function getPriorities()
    {
        return response()->json(Priority::all());
    }

    private function storeAttachment($file, int $ticketId, ?int $messageId = null): Attachment
    {
        $path = $file->store('ticket-attachments', 'public');

        return Attachment::create([
            'ticket_id' => $ticketId,
            'message_id' => $messageId,
            'path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'mime' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);
    }
}
