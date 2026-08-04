<?php

namespace Database\Seeders;

use App\Support\Permissions;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (Permissions::all() as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $admin = Role::findOrCreate('admin', 'web');
        $admin->syncPermissions(Permissions::all());

        $teacher = Role::findOrCreate('teacher', 'web');
        $teacher->syncPermissions(Permissions::TEACHER_PERMISSIONS);

        // The assistant role carries no permissions by default; admin assigns
        // each assistant's access individually as direct user permissions.
        Role::findOrCreate('assistant', 'web');
    }
}
