<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Etudiant extends Model
{
    protected $fillable = ['nom', 'prenom', 'email', 'tel', 'date_naissance', 'sex', 'classe_id'];

    public function classe() { return $this->belongsTo(Classe::class); }
    public function absences() { return $this->hasMany(Absence::class); }
    public function avertissements() { return $this->hasMany(Avertissement::class); }
}
