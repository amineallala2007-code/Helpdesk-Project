<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RegistrationRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; 
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            if (!Auth::attempt($request->only('email', 'password'))) {
                return response()->json(['message' => 'Identifiants incorrects'], 401);
            }

            /** @var \App\Models\User $user */
            $user = Auth::user();
            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'user' => $user,
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur Login Laravel',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function requestAccount(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|in:requester,agent',
        ]);

        if (User::where('email', $validated['email'])->exists()) {
            return response()->json(['message' => 'Un compte existe deja avec cet email.'], 422);
        }

        $registrationRequest = RegistrationRequest::where('email', $validated['email'])->first();

        if ($registrationRequest && $registrationRequest->status === 'approved') {
            return response()->json(['message' => 'Cette demande est deja approuvee. Connectez-vous.'], 422);
        }

        if ($registrationRequest) {
            $registrationRequest->update([
                'name' => $validated['name'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
                'status' => 'pending',
                'reviewed_by' => null,
                'reviewed_at' => null,
            ]);
        } else {
            $registrationRequest = RegistrationRequest::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);
        }

        return response()->json([
            'message' => 'Demande envoyee. Un administrateur doit valider le compte.',
            'request' => $registrationRequest,
        ], 201);
    }


    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }
}
