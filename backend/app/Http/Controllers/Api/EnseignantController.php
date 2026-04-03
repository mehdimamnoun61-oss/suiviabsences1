<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Enseignant;
use Illuminate\Http\Request;

class EnseignantController extends Controller
{
    public function index() {
        return response()->json(Enseignant::all());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nom'        => 'required|string|max:100',
            'prenom'     => 'required|string|max:100',
            'email'      => 'required|email|unique:enseignants',
            'tel'        => 'required|regex:/^\d{10}$/',
            'specialite' => 'required|string|max:150',
        ], [
            'email.email'    => 'The email address is invalid.',
            'email.unique'   => 'This email is already used.',
            'tel.regex'      => 'Phone number must be exactly 10 digits.',
        ]);
        return response()->json(Enseignant::create($data), 201);
    }

    public function show(Enseignant $enseignant) {
        return response()->json($enseignant->load('affectations.module', 'affectations.classe'));
    }

    public function update(Request $request, Enseignant $enseignant) {
        $enseignant->update($request->validate([
            'nom'        => 'sometimes|string|max:100',
            'prenom'     => 'sometimes|string|max:100',
            'email'      => 'sometimes|email|unique:enseignants,email,' . $enseignant->id,
            'tel'        => 'sometimes|regex:/^\d{10}$/',
            'specialite' => 'sometimes|string|max:150',
        ], [
            'email.email'  => 'The email address is invalid.',
            'email.unique' => 'This email is already used.',
            'tel.regex'    => 'Phone number must be exactly 10 digits.',
        ]));
        return response()->json($enseignant);
    }

    public function destroy(Enseignant $enseignant) {
        $enseignant->delete();
        return response()->json(null, 204);
    }
}
