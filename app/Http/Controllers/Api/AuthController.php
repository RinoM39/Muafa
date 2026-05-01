<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;    

class AuthController extends Controller
{
    // تسجيل حساب جديد
    public function register(Request $request) {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
            'role' => 'required|integer' // تحديد الرول عند التسجيل
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']), // الهاش القوي
            'role' => $data['role']
        ]);

        return response()->json(['message' => 'تم إنشاء الحساب بنجاح'], 201);
    }

    // تسجيل الدخول مع دعم الـ Cookies
  // داخل AuthController.php
public function login(Request $request) {
    $credentials = $request->only('email', 'password');

    if (!Auth::attempt($credentials)) {
        return response()->json(['message' => 'بيانات الدخول غير صحيحة'], 401);
    }

    $user = Auth::user();
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'token' => $token,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role, // تأكد أن هذا الحقل موجود في قاعدة البيانات
        ]
    ]);
}

    // تسجيل الخروج وحذف الجلسة
    public function logout(Request $request) {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'تم تسجيل الخروج']);
    }
}
