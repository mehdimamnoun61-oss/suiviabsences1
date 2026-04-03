<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClasseController;
use App\Http\Controllers\Api\EtudiantController;
use App\Http\Controllers\Api\EnseignantController;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\AffectationController;
use App\Http\Controllers\Api\SeanceController;
use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\AvertissementController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // ── Read-only for all roles ──────────────────────────────────────────
    Route::get('classes',      [ClasseController::class,      'index']);
    Route::get('classes/{classe}', [ClasseController::class,  'show']);
    Route::get('etudiants',    [EtudiantController::class,    'index']);
    Route::get('etudiants/{etudiant}', [EtudiantController::class, 'show']);
    Route::get('affectations', [AffectationController::class, 'index']);
    Route::get('affectations/{affectation}', [AffectationController::class, 'show']);
    Route::get('modules',      [ModuleController::class,      'index']);
    Route::get('modules/{module}', [ModuleController::class,  'show']);
    Route::get('enseignants',  [EnseignantController::class,  'index']);
    Route::get('enseignants/{enseignant}', [EnseignantController::class, 'show']);

    // ── All roles: absences + seances ────────────────────────────────────
    Route::apiResource('absences', AbsenceController::class);
    Route::apiResource('seances',  SeanceController::class);

    // ── Admin + Administration ───────────────────────────────────────────
    Route::middleware('role:admin,administration')->group(function () {
        Route::post('classes',              [ClasseController::class,      'store']);
        Route::put('classes/{classe}',      [ClasseController::class,      'update']);
        Route::delete('classes/{classe}',   [ClasseController::class,      'destroy']);

        Route::post('etudiants',            [EtudiantController::class,    'store']);
        Route::put('etudiants/{etudiant}',  [EtudiantController::class,    'update']);
        Route::delete('etudiants/{etudiant}',[EtudiantController::class,   'destroy']);

        Route::apiResource('avertissements', AvertissementController::class);
    });

    // ── Admin only ───────────────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::post('enseignants',              [EnseignantController::class,  'store']);
        Route::put('enseignants/{enseignant}',  [EnseignantController::class,  'update']);
        Route::delete('enseignants/{enseignant}',[EnseignantController::class, 'destroy']);

        Route::post('modules',              [ModuleController::class,      'store']);
        Route::put('modules/{module}',      [ModuleController::class,      'update']);
        Route::delete('modules/{module}',   [ModuleController::class,      'destroy']);

        Route::post('affectations',              [AffectationController::class, 'store']);
        Route::put('affectations/{affectation}', [AffectationController::class, 'update']);
        Route::delete('affectations/{affectation}',[AffectationController::class,'destroy']);
    });
});
