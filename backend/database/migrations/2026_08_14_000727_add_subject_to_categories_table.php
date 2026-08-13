<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->enum('subject', ['maths', 'science'])->nullable()->after('slug');
        });

        DB::table('categories')->where('slug', 'maths')->update(['subject' => 'maths']);
        DB::table('categories')->where('slug', '!=', 'maths')->update(['subject' => 'science']);
        DB::table('categories')->where('slug', 'science')->update(['name' => 'General Science']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('categories')->where('slug', 'science')->update(['name' => 'Science']);

        Schema::table('categories', function (Blueprint $table) {
            $table->dropColumn('subject');
        });
    }
};
