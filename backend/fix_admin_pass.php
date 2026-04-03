<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

DB::table('users')->where('email', 'admin@test.com')->update(['password' => Hash::make('1111')]);

echo "Admin password updated to 1111\n";
