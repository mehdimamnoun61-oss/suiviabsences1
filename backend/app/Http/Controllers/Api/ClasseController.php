<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Classe;
use Illuminate\Http\Request;

class ClasseController extends Controller
{
    public function index() {
        return response()->json(Classe::all());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nom_classe'     => 'required|string|max:100',
            'filiere'        => 'required|string|max:100',
            'niveau'         => 'required|string|max:50',
            'groupe'         => 'required|string|max:10',
            'annee_scolaire' => 'required|regex:/^\d{4}\/\d{4}$/',
        ], [
            'nom_classe.required'     => 'Le nom de la classe est requis.',
            'filiere.required'        => 'La filiere est requise.',
            'niveau.required'         => 'Le niveau est requis.',
            'groupe.required'         => 'Le groupe est requis.',
            'annee_scolaire.required' => "L'annee scolaire est requise.",
            'annee_scolaire.regex'    => "Format invalide. Exemple: 2024/2025.",
        ]);
        return response()->json(Classe::create($data), 201);
    }

    public function show(Classe $classe) {
        return response()->json($classe->load('etudiants'));
    }

    public function update(Request $request, Classe $classe) {
        $classe->update($request->validate([
            'nom_classe'     => 'sometimes|string|max:100',
            'filiere'        => 'sometimes|string|max:100',
            'niveau'         => 'sometimes|string|max:50',
            'groupe'         => 'sometimes|string|max:10',
            'annee_scolaire' => 'sometimes|regex:/^\d{4}\/\d{4}$/',
        ], [
            'annee_scolaire.regex' => "Format invalide. Exemple: 2024/2025.",
        ]));
        return response()->json($classe);
    }

    public function destroy(Classe $classe) {
        $classe->delete();
        return response()->json(null, 204);
    }
}
