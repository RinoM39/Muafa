// حارس البوابة - مُعافى Security System
(function () {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const path = window.location.pathname;
    const currentPage = path.split("/").pop();

    // دالة التوجيه الذكية
    const redirectWithToast = (message, type, targetUrl) => {
        // نضع الرسالة والنوع في الـ sessionStorage لتقرأها الصفحة القادمة
        sessionStorage.setItem('pending_toast_msg', message);
        sessionStorage.setItem('pending_toast_type', type);
        
        // التوجيه فوراً بدون انتظار موافقة المستخدم
        window.location.href = targetUrl;
    };

    const protectedPages = ['index.html', 'create-booking.html'];

    // 1. فحص تسجيل الدخول
    if (protectedPages.includes(currentPage) && !token) {
        redirectWithToast("يجب تسجيل الدخول للوصول لهذه الصفحة", "warning", "Auth/auth.html");
        return;
    }

    // 2. فحص الصلاحيات (Roles)
    
    // صفحة الإدارة (index.html) - مسموح فقط للرول 2
    if (currentPage === 'index.html' && role !== '2') {
        redirectWithToast("ليست من صلاحياتك", "error", "Booking/bookings.html");
        return;
    }

    // صفحة إنشاء العروض - مسموح للرول 1 و 2
    if (currentPage === 'create-booking.html' && (role !== '1' && role !== '2')) {
        redirectWithToast("ليست من صلاحياتك", "error", "../Booking/bookings.html");
        return;
    }
})();