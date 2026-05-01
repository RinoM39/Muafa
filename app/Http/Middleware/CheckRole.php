<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
 public function handle(Request $request, Closure $next, ...$roles)
{
    // 1. التأكد أن المستخدم مسجل دخول أصلاً
    if (!auth()->check()) {
        return response()->json(['message' => 'يجب تسجيل الدخول أولاً'], 401);
    }

    $userRole = auth()->user()->role;

    // 2. التحقق إذا كان رول المستخدم ضمن الأدوار المسموح لها بدخول هذا الرابط
    if (in_array($userRole, $roles)) {
        return $next($request);
    }

    return response()->json(['message' => 'ليس لديك صلاحية للقيام بهذا الإجراء'], 403);
}
}
