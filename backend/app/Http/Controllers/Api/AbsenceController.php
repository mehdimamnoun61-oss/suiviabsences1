<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Absence;
use Illuminate\Http\Request;

class AbsenceController extends Controller
{
    public function index() {
        return response()->json(Absence::with('etudiant', 'seance')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'etudiant_id' => 'required|exists:etudiants,id',
            'seance_id'   => 'required|exists:seances,id',
            'statut'      => 'required|in:Absent,Retard,Present,Présent',
            'justifie'    => 'boolean',
        ], [
            'etudiant_id.required' => "L'etudiant est requis.",
            'etudiant_id.exists'   => "L'etudiant selectionne n'existe pas.",
            'seance_id.required'   => 'La seance est requise.',
            'seance_id.exists'     => "La seance selectionnee n'existe pas.",
            'statut.required'      => 'Le statut est requis.',
            'statut.in'            => 'Statut invalide. Valeurs: Absent, Retard, Present.',
        ]);
        return response()->json(Absence::create($data), 201);
    }

    public function show(Absence $absence) {
        return response()->json($absence->load('etudiant', 'seance'));
    }

    public function update(Request $request, Absence $absence) {
        $absence->update($request->validate([
            'statut'   => 'sometimes|in:Absent,Retard,Present,Présent',
            'justifie' => 'sometimes|boolean',
        ], [
            'statut.in' => 'Statut invalide. Valeurs: Absent, Retard, Present.',
        ]));
        return response()->json($absence);
    }

    public function destroy(Absence $absence) {
        $absence->delete();
        return response()->json(null, 204);
    }
}
