const BASE_URL = 'http://127.0.0.1:8000/api';

// دالة تسجيل الدخول
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();
        console.log("البيانات القادمة من السيرفر:", result); // هاد السطر رح يورجيك شكل البيانات الحقيقي

        if (response.ok) {
            localStorage.setItem('auth_token', result.token);
            localStorage.setItem('user_role', result.user.role);
            localStorage.setItem('user_name', result.user.name);
            
            showToast("تم تسجيل الدخول بنجاح!", "success");
            window.location.href = "../Booking/bookings.html";
        } else {
            showToast(result.message || "بيانات الدخول غير صحيحة", "error");
        }
    } catch (error) {
        showToast("خطأ في الاتصال بالسيرفر", "error");
    }
}

// دالة تسجيل حساب جديد
async function handleRegister(event) {
    event.preventDefault();
    const data = {
        name: document.getElementById('reg-name').value,
        email: document.getElementById('reg-email').value,
        password: document.getElementById('reg-password').value,
        password_confirmation: document.getElementById('reg-confirm').value,
        role: 2 // رول افتراضي
    };

    try {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json' 
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showToast("تم إنشاء الحساب بنجاح!", "success");
            toggleAuth();
        } else {
            const result = await response.json();
            showToast(result.message || "فشل التسجيل", "error");
        }
    } catch (error) {
        showToast("خطأ في الاتصال بالشبكة", "error");
    }
}

// دالة التبديل البصري
function toggleAuth() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    if (loginForm.style.display === "none") {
        loginForm.style.display = "block";
        signupForm.style.display = "none";
    } else {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    }
}

// ربط الأحداث مرة واحدة فقط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm) loginForm.onsubmit = handleLogin;
    if (signupForm) signupForm.onsubmit = handleRegister;
});