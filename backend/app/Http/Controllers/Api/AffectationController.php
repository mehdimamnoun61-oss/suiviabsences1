<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Affectation;
use Illuminate\Http\Request;

class AffectationController extends Controller
{
    public function index() {
        return response()->json(Affectation::with('enseignant', 'module', 'classe')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'enseignant_id'  => 'required|exists:enseignants,id',
            'module_id'      => 'required|exists:modules,id',
            'classe_id'      => 'required|exists:classes,id',
            'annee_scolaire' => 'required|regex:/^\d{4}\/\d{4}$/',
        ], [
            'enseignant_id.required' => "L'enseignant est requis.",
            'enseignant_id.exists'   => "L'enseignant selectionne n'existe pas.",
            'module_id.required'     => 'Le module est requis.',
            'module_id.exists'       => "Le module selectionne n'existe pas.",
            'classe_id.required'     => 'La classe est requise.',
            'classe_id.exists'       => "La classe selectionnee n'existe pas.",
            'annee_scolaire.required'=> "L'annee scolaire est requise.",
            'annee_scolaire.regex'   => "Format invalide. Exemple: 2024/2025.",
        ]);
        return response()->json(Affectation::create($data), 201);
    }

    public function show(Affectation $affectation) {
        return response()->json($affectation->load('enseignant', 'module', 'classe', 'seances'));
    }

    public function update(Request $request, Affectation $affectation) {
        $affectation->update($request->validate([
            'enseignant_id'  => 'sometimes|exists:enseignants,id',
            'module_id'      => 'sometimes|exists:modules,id',
            'classe_id'      => 'sometimes|exists:classes,id',
            'annee_scolaire' => 'sometimes|regex:/^\d{4}\/\d{4}$/',
        ], [
            'annee_scolaire.regex' => "Format invalide. Exemple: 2024/2025.",
        ]));
        return response()->json($affectation);
    }

    public function destroy(Affectation $affectation) {
        $affectation->delete();
        return response()->json(null, 204);
    }
}
