<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets')->onDelete('cascade');
            $table->foreignId('message_id')->nullable()->constrained('ticket_messages')->onDelete('cascade');
            $table->string('path');
            $table->string('original_name');
            $table->string('mime');
            $table->integer('size');
            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('attachments');
    }
};
