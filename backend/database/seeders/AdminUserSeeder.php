<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'Admin',          'email' => 'admin@test.com',          'password' => Hash::make('1234'), 'role' => 'admin'],
            ['name' => 'Enseignant',      'email' => 'enseignant@test.com',     'password' => Hash::make('1234'), 'role' => 'enseignant'],
            ['name' => 'Administration',  'email' => 'administration@test.com', 'password' => Hash::make('1234'), 'role' => 'administration'],
        ];

        foreach ($users as $user) {
            User::firstOrCreate(['email' => $user['email']], $user);
        }
    }
}
