<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Classe extends Model
{
    protected $fillable = ['nom_classe', 'filiere', 'niveau', 'groupe', 'annee_scolaire'];

    public function etudiants() { return $this->hasMany(Etudiant::class); }
    public function affectations() { return $this->hasMany(Affectation::class); }
}
