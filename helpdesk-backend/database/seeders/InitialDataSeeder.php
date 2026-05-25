<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\User;
use App\Models\Category;
use App\Models\Priority;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class InitialDataSeeder extends Seeder
{

    public function run(): void
    {
        User::create([
            'name' => 'Support Admin',
            'email' => 'admin@helpdesk.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Agent Rachid',
            'email' => 'agent@helpdesk.com',
            'password' => Hash::make('password123'),
            'role' => 'agent',
        ]);

        User::create([
            'name' => 'Demandeur Ahmed',
            'email' => 'user@helpdesk.com',
            'password' => Hash::make('password123'),
            'role' => 'requester',
        ]);

        $categories = ['Incidents IT', 'Demandes d\'accès', 'Maintenance & Logistique'];
        foreach ($categories as $cat) {
            Category::create(['name' => $cat, 'active' => true]);
        }

        Priority::create(['name' => 'Basse', 'level' => 1, 'active' => true]);
        Priority::create(['name' => 'Moyenne', 'level' => 2, 'active' => true]);
        Priority::create(['name' => 'Haute', 'level' => 3, 'active' => true]);
        Priority::create(['name' => 'Critique', 'level' => 4, 'active' => true]);
    }
}
