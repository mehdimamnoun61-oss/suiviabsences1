<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('seances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affectation_id')->constrained('affectations')->onDelete('cascade');
            $table->date('date_seance');
            $table->time('heure_debut');
            $table->time('heure_fin');
            $table->decimal('duree', 6, 2)->nullable();
            $table->enum('statut', ['planifiee', 'realisee', 'annulee'])->default('planifiee');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('seances');
    }
};
