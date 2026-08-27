<?php

namespace App\Models;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;
use Stancl\Tenancy\Contracts\TenantWithDatabase;
use Stancl\Tenancy\Database\Concerns\HasDatabase;
use Stancl\Tenancy\Database\Concerns\HasDomains;

class Tenant extends BaseTenant implements TenantWithDatabase
{
    use HasDatabase, HasDomains;

    /**
     * Custom columns to be mapped directly to the database columns.
     */
    public static function getCustomColumns(): array
    {
        return [
            'id',
            'plan',
            'template', // smokeshop-dark, adventure-outdoor, service-minimal
        ];
    }
}
