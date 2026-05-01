// حارس البوابة - مُعافى Security System
(function () {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');
    const path = window.location.pathname;

    // 1. القائمة السوداء: الصفحات التي تتطلب تسجيل دخول حصراً
    const protectedPages = ['index.html', 'create-booking.html'];
    
    // الحصول على اسم الصفحة الحالية من الرابط
    const currentPage = path.split("/").pop();

    // 2. التحقق من وجود التوكن للصفحات المحمية
    if (protectedPages.includes(currentPage) && !token) {
        alert("يجب تسجيل الدخول للوصول لهذه الصفحة");
        window.location.href = "Auth/auth.html";
        return;
    }

    // 3. التحقق من الصلاحيات (Role-Based Access Control)
    
    // صفحة المدير (index.html) مسموح فقط للرول 2
    if (currentPage === 'index.html' && role !== '2') {
        alert("صلاحية مدير النظام مطلوبة");
        window.location.href = "Booking/bookings.html";
    }

    // صفحة إنشاء الحجز مسموح للمركز الطبي (1) والأدمن (2)
    if (currentPage === 'create-booking.html' && (role !== '1' && role !== '2')) {
        alert("يجب أن تكون صاحب مركز طبي لإضافة عروض");
        window.location.href = "../Booking/bookings.html";
    }

})();