<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function requireAdmin(Request $request): void
    {
        abort_unless(strtolower($request->user()?->role ?? '') === 'admin', 403, 'Reserve aux administrateurs.');
    }

    public function index(Request $request)
    {
        $this->requireAdmin($request);

        try {
            $users = User::select('id', 'name', 'email', 'role')->get();
            return response()->json($users, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors du chargement des utilisateurs'], 500);
        }
    }

    public function store(Request $request)
    {
        $this->requireAdmin($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:requester,agent,admin',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'Utilisateur cree avec succes.',
            'user' => $user,
        ], 201);
    }

    public function updateUserRole(Request $request, $id)
    {
        $this->requireAdmin($request);

        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'role' => 'required|in:requester,agent,admin,user,1,2',
            ]);

            $user = User::findOrFail($id);

            if ($user->email === 'admin@helpdesk.com') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Action interdite : Le Super Admin principal ne peut pas etre modifie !'
                ], 403);
            }

            $role = strtolower((string) $validated['role']);
            if ($role === 'user' || $role === '1') {
                $role = 'requester';
            } elseif ($role === '2') {
                $role = 'agent';
            }

            $user->name = $validated['name'];
            $user->email = $validated['email'];
            $user->role = $role;
            $user->save();

            return response()->json([
                'status' => 'success',
                'message' => 'Role mis a jour avec succes !',
                'user' => $user
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Erreur lors de la modification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function registrationRequests(Request $request)
    {
        $this->requireAdmin($request);

        return response()->json(
            RegistrationRequest::where('status', 'pending')->latest()->get()
        );
    }

    public function approveRegistration(Request $request, $id)
    {
        $this->requireAdmin($request);

        $registrationRequest = RegistrationRequest::findOrFail($id);

        if ($registrationRequest->status !== 'pending') {
            return response()->json(['message' => 'Cette demande est deja traitee.'], 422);
        }

        if (User::where('email', $registrationRequest->email)->exists()) {
            return response()->json(['message' => 'Un utilisateur existe deja avec cet email.'], 422);
        }

        $user = User::create([
            'name' => $registrationRequest->name,
            'email' => $registrationRequest->email,
            'password' => $registrationRequest->password,
            'role' => $registrationRequest->role,
        ]);

        $registrationRequest->update([
            'status' => 'approved',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Demande approuvee et compte cree.',
            'user' => $user,
        ]);
    }

    public function rejectRegistration(Request $request, $id)
    {
        $this->requireAdmin($request);

        $registrationRequest = RegistrationRequest::findOrFail($id);
        $registrationRequest->update([
            'status' => 'rejected',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['message' => 'Demande refusee.']);
    }
}
