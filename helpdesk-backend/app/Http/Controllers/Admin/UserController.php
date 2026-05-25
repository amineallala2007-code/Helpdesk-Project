<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;


class UserController extends Controller
{
    public function index()
    {
        try {
            $users = User::select('id', 'name', 'email', 'role')->get();
            return response()->json($users, 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors du chargement des utilisateurs'], 500);
        }
    }

public function updateUserRole(Request $request, $id) 
{
    try {
        $user = User::findOrFail($id);

        if ($user->email === 'admin@helpdesk.com') {
            return response()->json([
                'status' => 'error',
                'message' => 'Action interdite : Le Super Admin principal ne peut pas être modifié !'
            ], 403); 
        }

        $role = $request->role;
        if ($role === 'requester') {
            $role = 'REQUESTER';
        } elseif ($role === 'agent') {
            $role = 'AGENT';
        } elseif ($role === 'admin') {
            $role = 'ADMIN';
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->role = $role;

        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Rôle mis à jour avec succès !',
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
}
