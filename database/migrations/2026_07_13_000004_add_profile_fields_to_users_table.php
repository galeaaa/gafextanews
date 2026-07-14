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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable();
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $table->string('gender', 50)->nullable();
            }
            if (!Schema::hasColumn('users', 'birthdate')) {
                $table->date('birthdate')->nullable();
            }
            if (!Schema::hasColumn('users', 'occupation')) {
                $table->string('occupation', 100)->nullable();
            }
            if (!Schema::hasColumn('users', 'hobbies')) {
                $table->string('hobbies', 255)->nullable();
            }
            if (!Schema::hasColumn('users', 'profile_pic')) {
                $table->longText('profile_pic')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['bio', 'gender', 'birthdate', 'occupation', 'hobbies', 'profile_pic'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('users', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
