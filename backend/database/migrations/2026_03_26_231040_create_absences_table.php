<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->foreignId('seance_id')->constrained('seances')->onDelete('cascade');
            $table->enum('statut', ['Absent', 'Retard', 'Présent'])->default('Présent');
            $table->boolean('justifie')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('absences');
    }
};
