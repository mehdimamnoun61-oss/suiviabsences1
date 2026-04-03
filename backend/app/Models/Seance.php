<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seance extends Model
{
    protected $fillable = ['affectation_id', 'date_seance', 'heure_debut', 'heure_fin', 'duree', 'statut'];

    public function affectation() { return $this->belongsTo(Affectation::class); }
    public function absences() { return $this->hasMany(Absence::class); }
}
