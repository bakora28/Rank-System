<?php

namespace App\Support;

class Permissions
{
    /** Modules an assistant's access can be scoped to. `assistants` itself is never delegable. */
    public const MODULES = ['categories', 'books', 'teachers', 'requests', 'gifts', 'notifications'];

    public const ACTIONS = ['view', 'add', 'edit', 'delete'];

    /** Fixed permission set granted to every teacher. */
    public const TEACHER_PERMISSIONS = [
        'categories.view',
        'books.view',
        'requests.add',
        'requests.view',
        'gifts.view',
        'notifications.view',
    ];

    /**
     * @return string[] every `module.action` permission key, e.g. "categories.view"
     */
    public static function all(): array
    {
        $keys = [];

        foreach (self::MODULES as $module) {
            foreach (self::ACTIONS as $action) {
                $keys[] = "{$module}.{$action}";
            }
        }

        return $keys;
    }
}
