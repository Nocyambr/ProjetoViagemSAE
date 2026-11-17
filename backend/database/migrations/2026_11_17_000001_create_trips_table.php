<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trips', function (Blueprint $table) {
            $table->string('id', 64)->primary();
            $table->string('title', 100);
            $table->string('destination', 120)->default('');
            $table->string('date', 10);
            $table->string('departure', 5);
            $table->string('arrival', 5);
            $table->string('bus_name', 100)->default('Ônibus fretado');
            $table->string('teacher_name', 100)->default('Professor responsável');
            $table->string('teacher_contact', 100)->default('');
            $table->string('status', 20)->default('planned');
            $table->timestamp('started_at')->nullable();
            $table->string('location_label', 200)->default('SESI Cerquilho - SP (Rua Antônio Modanez, 111)');
            $table->string('location_address', 240)->default('Rua Antônio Modanez, 111 - Residencial São Francisco, Cerquilho - SP, CEP 18527-372');
            $table->string('location_lat', 32)->default('-23.16345');
            $table->string('location_lng', 32)->default('-47.76580');
            $table->unsignedTinyInteger('location_progress')->default(0);
            $table->timestamp('location_updated_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trips');
    }
};
