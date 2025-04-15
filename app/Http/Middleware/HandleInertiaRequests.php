<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\Setting;
use Illuminate\Support\Facades\Auth;
use Spatie\Permission\Models\Role;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $permissions = collect();
        if ($request->user()) {
            $user = $request->user();
            $role = Role::where('name',$user->user_role)->first();
            $permissions = $role->permissions;
        }

        $shopNameMeta = Setting::where('meta_key', 'shop_name')->first();
        $modules = Setting::getModules();
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'settings'=>[
                'shop_name'=>$shopNameMeta->meta_value,
            ],
            'modules'=>$modules,
            'userPermissions'=>$permissions->pluck('name'),
        ];
    }
}
