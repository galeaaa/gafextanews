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
        if (!Schema::hasTable('bookmarks')) {
            Schema::create('bookmarks', function (Blueprint $table) {
                $table->integer('id', true);
                $table->integer('user_id');
                $table->string('article_id', 255);
                $table->string('title', 255);
                $table->string('thumbnail', 255)->nullable();
                $table->string('category', 100)->nullable()->default('News');
                $table->timestamp('saved_at')->useCurrent();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookmarks');
    }
};
