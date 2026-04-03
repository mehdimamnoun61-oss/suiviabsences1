<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('avertissements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etudiant_id')->constrained('etudiants')->onDelete('cascade');
            $table->text('motif');
            $table->date('date_avertissement');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('avertissements');
    }
};
