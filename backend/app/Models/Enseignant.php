<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enseignant extends Model
{
    protected $fillable = ['nom', 'prenom', 'email', 'tel', 'specialite'];

    public function affectations() { return $this->hasMany(Affectation::class); }
}
