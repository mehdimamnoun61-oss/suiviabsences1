<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Affectation extends Model
{
    protected $fillable = ['enseignant_id', 'module_id', 'classe_id', 'annee_scolaire'];

    public function enseignant() { return $this->belongsTo(Enseignant::class); }
    public function module() { return $this->belongsTo(Module::class); }
    public function classe() { return $this->belongsTo(Classe::class); }
    public function seances() { return $this->hasMany(Seance::class); }
}
