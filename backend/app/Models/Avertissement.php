<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avertissement extends Model
{
    protected $fillable = ['etudiant_id', 'motif', 'date_avertissement'];

    public function etudiant() { return $this->belongsTo(Etudiant::class); }
}
