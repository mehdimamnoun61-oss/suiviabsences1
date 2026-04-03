<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Etudiant;
use Illuminate\Http\Request;

class EtudiantController extends Controller
{
    public function index() {
        return response()->json(Etudiant::with('classe')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nom'            => 'required|string|max:100',
            'prenom'         => 'required|string|max:100',
            'email'          => 'required|email|unique:etudiants',
            'tel'            => 'required|regex:/^\d{10}$/',
            'date_naissance' => 'required|date',
            'sex'            => 'required|in:homme,femme',
            'classe_id'      => 'required|exists:classes,id',
        ], [
            'email.email'    => 'The email address is invalid.',
            'email.unique'   => 'This email is already used.',
            'tel.regex'      => 'Phone number must be exactly 10 digits.',
        ]);
        return response()->json(Etudiant::create($data), 201);
    }

    public function show(Etudiant $etudiant) {
        return response()->json($etudiant->load('classe', 'absences', 'avertissements'));
    }

    public function update(Request $request, Etudiant $etudiant) {
        $etudiant->update($request->validate([
            'nom'            => 'sometimes|string|max:100',
            'prenom'         => 'sometimes|string|max:100',
            'email'          => 'sometimes|email|unique:etudiants,email,' . $etudiant->id,
            'tel'            => 'sometimes|regex:/^\d{10}$/',
            'date_naissance' => 'sometimes|date',
            'sex'            => 'sometimes|in:homme,femme',
            'classe_id'      => 'sometimes|exists:classes,id',
        ], [
            'email.email'  => 'The email address is invalid.',
            'email.unique' => 'This email is already used.',
            'tel.regex'    => 'Phone number must be exactly 10 digits.',
        ]));
        return response()->json($etudiant);
    }

    public function destroy(Etudiant $etudiant) {
        $etudiant->delete();
        return response()->json(null, 204);
    }
}
