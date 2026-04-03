<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('nom_classe');
            $table->string('filiere');
            $table->string('niveau');
            $table->string('groupe');
            $table->string('annee_scolaire');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('classes');
    }
};
