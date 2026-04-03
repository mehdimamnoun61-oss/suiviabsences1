<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Module extends Model
{
    protected $fillable = ['nom_module', 'volume_horaire'];

    public function affectations() { return $this->hasMany(Affectation::class); }
}
