<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Avertissement;
use Illuminate\Http\Request;

class AvertissementController extends Controller
{
    public function index() {
        return response()->json(Avertissement::with('etudiant')->get());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'etudiant_id'        => 'required|exists:etudiants,id',
            'motif'              => 'required|string',
            'date_avertissement' => 'required|date',
        ]);
        return response()->json(Avertissement::create($data), 201);
    }

    public function show(Avertissement $avertissement) {
        return response()->json($avertissement->load('etudiant'));
    }

    public function update(Request $request, Avertissement $avertissement) {
        $avertissement->update($request->validate([
            'motif'              => 'sometimes|string',
            'date_avertissement' => 'sometimes|date',
        ]));
        return response()->json($avertissement);
    }

    public function destroy(Avertissement $avertissement) {
        $avertissement->delete();
        return response()->json(null, 204);
    }
}
