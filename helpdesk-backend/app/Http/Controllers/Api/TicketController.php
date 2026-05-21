<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{

    public function index()
    {
        try {
            $user = Auth::user();

            if ($user->role === 'agent') {
                $tickets = Ticket::with(['requester', 'category', 'priority'])
                                 ->orderBy('created_at', 'desc')
                                 ->get();
            } else {
                $tickets = Ticket::with(['category', 'priority'])
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
            ]);

            $user = Auth::user();

            $ticket = Ticket::create([
                'title'        => $request->title,
                'description'  => $request->description,
                'status'       => 'open',
                'requester_id' => $user->id, 
                'priority_id'  => 1, 
                'category_id'  => 1, 
            ]);

            return response()->json([
                'message' => 'Ticket créé avec succès ! 🎉',
                'ticket'  => $ticket
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la création du ticket',
                'error'   => $e->getMessage()
            ], 500);
        }
    }
    public function show( int $id){
        try {
        $ticket = Ticket::with(['requester', 'category', 'priority', 'assignee'])->find($id);
        
        if (!$ticket) {
            return response()->json(['message' => 'Ticket non trouvé'], 404);
        }

        return response()->json($ticket, 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur server', 'error' => $e->getMessage()], 500);
    }
}

/**
 * PUT /api/tickets/{id}/assign
 * الـ Agent يعين التذكرة لراسو
 */
public function assign(int $id)
{
    if (Auth::user()->role !== 'agent') {
        return response()->json(['message' => 'Action non autorisée'], 403);
    }

    try {
        $ticket = Ticket::findOrFail($id);
        $ticket->assignee_id = Auth::id(); // الـ Agent الحالي كيرجع هو المسؤول
        $ticket->status = 'in_progress';   // الحالة كتحول أوتوماتيكياً لـ قيد المعالجة
        $ticket->save();

        return response()->json(['message' => 'Ticket pris en charge avec succès', 'ticket' => $ticket], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur server', 'error' => $e->getMessage()], 500);
    }
}

/**
 * PUT /api/tickets/{id}/update-status
 * الـ Agent كيغير الفئة، الأولوية، والحالة د التيكيت
 */
public function updateStatus(Request $request, int $id)
{
    if (Auth::user()->role !== 'agent') {
        return response()->json(['message' => 'Action non autorisée'], 403);
    }

    try {
        $ticket = Ticket::findOrFail($id);
        
        // تحديث الحقول على حساب شنو اختار الـ Agent ف الواجهة
        if ($request->has('category_id')) $ticket->category_id = $request->category_id;
        if ($request->has('priority_id')) $ticket->priority_id = $request->priority_id;
        if ($request->has('status')) {
            $ticket->status = $request->status;
            
            // إيلا رجعها تتحل، كنسجلو الوقت ف البلاصة
            if ($request->status === 'resolved') {
                $ticket->resolved_at = now();
            } elseif ($request->status === 'closed') {
                $ticket->closed_at = now();
            }
        }

        $ticket->save();
        return response()->json(['message' => 'Ticket mis à jour avec succès', 'ticket' => $ticket], 200);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Erreur server', 'error' => $e->getMessage()], 500);
    }
    }
}