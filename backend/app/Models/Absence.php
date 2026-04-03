<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Absence extends Model
{
    protected $fillable = ['etudiant_id', 'seance_id', 'statut', 'justifie'];

    public function etudiant() { return $this->belongsTo(Etudiant::class); }
    public function seance() { return $this->belongsTo(Seance::class); }
}
