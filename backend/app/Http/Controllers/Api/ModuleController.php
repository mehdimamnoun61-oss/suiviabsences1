<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Module;
use Illuminate\Http\Request;

class ModuleController extends Controller
{
    public function index() {
        return response()->json(Module::all());
    }

    public function store(Request $request) {
        $data = $request->validate([
            'nom_module'     => 'required|string|max:150',
            'volume_horaire' => 'required|integer|min:1|max:500',
        ], [
            'nom_module.required'      => 'Le nom du module est requis.',
            'volume_horaire.required'  => 'Le volume horaire est requis.',
            'volume_horaire.integer'   => 'Le volume horaire doit etre un nombre entier.',
            'volume_horaire.min'       => 'Le volume horaire doit etre au moins 1.',
            'volume_horaire.max'       => 'Le volume horaire ne peut pas depasser 500.',
        ]);
        return response()->json(Module::create($data), 201);
    }

    public function show(Module $module) {
        return response()->json($module);
    }

    public function update(Request $request, Module $module) {
        $module->update($request->validate([
            'nom_module'     => 'sometimes|string|max:150',
            'volume_horaire' => 'sometimes|integer|min:1|max:500',
        ], [
            'volume_horaire.integer' => 'Le volume horaire doit etre un nombre entier.',
            'volume_horaire.min'     => 'Le volume horaire doit etre au moins 1.',
        ]));
        return response()->json($module);
    }

    public function destroy(Module $module) {
        $module->delete();
        return response()->json(null, 204);
    }
}
