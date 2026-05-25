<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\Category;
use App\Models\Priority;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class TicketController extends Controller
{
    public function index()
    {
        try {
            $user = Auth::user();


            if ($user->role === 'admin' || $user->role === 'agent') {
                $tickets = Ticket::with(['requester', 'category', 'priority', 'assignee'])
                    ->orderBy('created_at', 'desc')
                    ->get();
            } else {
                $tickets = Ticket::with(['category', 'priority', 'assignee'])
                    ->where('requester_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }

            return response()->json($tickets, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur serveur lors du chargement des tickets',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        if (Auth::user()->role === 'agent') {
            return response()->json([
                'message' => 'Action non autorisée. Les agents ne peuvent pas créer de tickets.'
            ], 403);
        }

        try {
            $request->validate([
                'title'       => 'required|string|max:255',
                'description' => 'required|string',
                'category_id' => 'required|exists:categories,id',
                'priority_id' => 'required|exists:priorities,id',
            ]);

            $user = Auth::user();

            $ticket = Ticket::create([
                'title'        => $request->title,
                'description'  => $request->description,
                'status'       => 'open',
                'requester_id' => $user->id,
                'priority_id'  => $request->priority_id,
                'category_id'  => $request->category_id,
            ]);

            return response()->json([
                'message' => 'Ticket créé avec succès ! 🎉',
                'ticket'  => $ticket->load(['category', 'priority'])
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du ticket',
                'error'   => $e->getMessage()
            ], 500);
        }
    }



    public function show($id)
    {
        try {
            $ticket = Ticket::with(['category', 'priority'])->findOrFail($id);
            $user = Auth::user();

            if (!$user) {
                return response()->json(['message' => 'Non autorisé'], 403);
            }

            $isOwner = (int)$user->id === (int)$ticket->requester_id;

            $userRole = strtolower($user->role);
            $isStaff = str_contains($userRole, 'admin') || str_contains($userRole, 'agent');

            if (!$isStaff && !$isOwner) {
                return response()->json(['message' => 'Accès interdit'], 403);
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

        if ($ticket->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json(['message' => 'Non autorisé'], 403);
        }

        $ticket->delete();
        return response()->json(['message' => 'Ticket supprimé'], 200);
    }
    public function updateStatus(Request $request, int $id)
    {
        $user = $request->user();

        if (!$user || !in_array($user->role, ['admin', 'agent'])) {
            return response()->json(['message' => 'Action non autorisée'], 403);
        }

        $request->validate([
            'status' => 'nullable|in:open,in_progress,resolved,closed',
            'category_id' => 'nullable|exists:categories,id',
            'priority_id' => 'nullable|exists:priorities,id',
        ]);

        try {
            $ticket = Ticket::findOrFail($id);

            if ($user->role === 'agent' && $ticket->assignee_id !== null && $ticket->assignee_id !== $user->id) {
                return response()->json(['message' => 'Ce ticket est géré par un autre agent'], 403);
            }

            if ($request->has('category_id')) $ticket->category_id = $request->category_id;
            if ($request->has('priority_id')) $ticket->priority_id = $request->priority_id;

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
                'message' => 'Ticket mis à jour avec succès',
                'ticket' => $ticket->load(['category', 'priority', 'assignee'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur serveur', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignToMe(Request $request, int $id)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'agent') {
            return response()->json(['message' => 'Non autorisé. Réservé aux agents.'], 403);
        }

        try {
            $ticket = Ticket::findOrFail($id);

            $ticket->update([
                'assignee_id' => $user->id,
                'status'      => 'in_progress'
            ]);

            return response()->json([
                'message' => 'Ticket assigné avec succès',
                'ticket'  => $ticket->load(['category', 'priority', 'assignee'])
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de l\'assignation', 'error' => $e->getMessage()], 500);
        }
    }

    public function assignAgent(Request $request, $id)
    {
        try {
            $ticket = Ticket::findOrFail($id);


            $agentId = $request->assignee_id ?? $request->agent_id;

            if (!$agentId) {
                return response()->json(['message' => 'ID de l\'agent est requis'], 400);
            }

            $ticket->assignee_id = $agentId;


            $ticket->save();

            return response()->json([
                'message' => 'Ticket assigné avec succès !',
                'ticket' => $ticket
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de l\'assignation du ticket',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getCategories()
    {
        return response()->json(Category::all());
    }

    public function getPriorities()
    {
        return response()->json(Priority::all());
    }
}
