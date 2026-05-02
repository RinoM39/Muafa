// إنشاء حاوية التنبيهات وفحص الرسائل المعلقة عند تحميل أي صفحة
document.addEventListener("DOMContentLoaded", () => {
    // 1. إنشاء الحاوية إذا لم تكن موجودة
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }

    // 2. الفحص: هل هناك رسالة "معلقة" قادمة من سكيور شيك؟
    const pendingMsg = sessionStorage.getItem('pending_toast_msg');
    const pendingType = sessionStorage.getItem('pending_toast_type');

    if (pendingMsg) {
        // عرض التنبيه فوراً
        showToast(pendingMsg, pendingType || 'success');
        
        // تنظيف الذاكرة لكي لا يظهر التنبيه مرة أخرى عند تحديث الصفحة
        sessionStorage.removeItem('pending_toast_msg');
        sessionStorage.removeItem('pending_toast_type');
    }
});

// دالة عرض التنبيه الأساسية
function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    if (!container) return; // حماية في حال لم يتم إنشاء الحاوية بعد

    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;
    
    let iconHTML = `<i class="fas fa-check-circle icon"></i>`;
    if (type === 'error') iconHTML = `<i class="fas fa-exclamation-circle icon"></i>`;
    else if (type === 'warning') iconHTML = `<i class="fas fa-exclamation-triangle icon"></i>`;
    
    toast.innerHTML = `${iconHTML}<span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0'; // إضافة تلاشي بسيط إذا أردت
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// دالة فحص الحجز (تستخدم التوست مباشرة لأننا في نفس الصفحة)
function checkAccessForBooking() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token) {
        showToast("يرجى تسجيل الدخول أولاً لتتمكن من الحجز.", "warning");
        setTimeout(() => { window.location.href = "Auth/auth.html"; }, 1200);
        return false;
    }

    if (role == '0') {
        showToast("عذراً، حسابك لا يملك صلاحية القيام بحجز.", "error");
        return false;
    }
    
    return true;
}