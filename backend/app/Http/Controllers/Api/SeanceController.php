<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Seance;
use Illuminate\Http\Request;

class SeanceController extends Controller
{
    public function index() {
        return response()->json(Seance::with('affectation.enseignant', 'affectation.module', 'affectation.classe')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'affectation_id' => 'required|exists:affectations,id',
            'date_seance'    => 'required|date',
            'heure_debut'    => 'required|date_format:H:i',
            'heure_fin'      => 'required|date_format:H:i|after:heure_debut',
            'duree'          => 'required|numeric|min:1|max:480',
            'statut'         => 'required|in:planifiee,realisee,annulee',
        ], [
            'affectation_id.required' => "L'affectation est requise.",
            'affectation_id.exists'   => "L'affectation selectionnee n'existe pas.",
            'date_seance.required'    => 'La date est requise.',
            'date_seance.date'        => 'La date est invalide.',
            'heure_debut.required'    => "L'heure de debut est requise.",
            'heure_debut.date_format' => "Format invalide. Utilisez HH:MM.",
            'heure_fin.required'      => "L'heure de fin est requise.",
            'heure_fin.date_format'   => "Format invalide. Utilisez HH:MM.",
            'heure_fin.after'         => "L'heure de fin doit etre apres l'heure de debut.",
            'duree.required'          => 'La duree est requise.',
            'duree.min'               => 'La duree doit etre au moins 1 minute.',
            'duree.max'               => 'La duree ne peut pas depasser 480 minutes.',
            'statut.required'         => 'Le statut est requis.',
            'statut.in'               => 'Statut invalide.',
        ]);
        return response()->json(Seance::create($data), 201);
    }

    public function show(Seance $seance) {
        return response()->json($seance->load('affectation', 'absences.etudiant'));
    }

    public function update(Request $request, Seance $seance) {
        $seance->update($request->validate([
            'affectation_id' => 'sometimes|exists:affectations,id',
            'date_seance'    => 'sometimes|date',
            'heure_debut'    => 'sometimes|date_format:H:i',
            'heure_fin'      => 'sometimes|date_format:H:i',
            'duree'          => 'sometimes|numeric|min:1|max:480',
            'statut'         => 'sometimes|in:planifiee,realisee,annulee',
        ], [
            'heure_fin.after'      => "L'heure de fin doit etre apres l'heure de debut.",
            'statut.in'            => 'Statut invalide.',
        ]));
        return response()->json($seance);
    }

    public function destroy(Seance $seance) {
        $seance->delete();
        return response()->json(null, 204);
    }
}
