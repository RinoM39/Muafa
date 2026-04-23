document.addEventListener("DOMContentLoaded", function() {
    // 1. تنظيف أي نسخ قديمة لمنع التكرار
    const oldSidebars = document.querySelectorAll('.sidebar, .sidebar-hover, .sidebar-mobile-only');
    oldSidebars.forEach(el => el.remove());

    const path = window.location.pathname;
    const isSubFolder = path.includes('/Auth/') || path.includes('/Create/') || path.includes('/Booking/');
    const root = isSubFolder ? '../' : '';

    // 2. بناء الهيكل (نستخدم كلاس موحد ولكن بمنطقين مختلفين)
    const sidebarHTML = `
    <aside class="sidebar" id="mainSidebar">
        <div class="sidebar-content">
            <img src="${root}logo.jpg" alt="Logo" style="width:80px; display:block; margin:0 auto 20px;">
            <h2 style="text-align:center; color:#575756;" class="sidebar-title">مُعافى</h2>
            <nav>
                <ul style="list-style:none; padding:20px 0;">
                    <li onclick="location.href='${root}index.html'" style="padding:15px; cursor:pointer;">
                        <i class="fas fa-chart-line"></i> لوحة التحكم
                    </li>
                    <li onclick="location.href='${root}Booking/bookings.html'" style="padding:15px; cursor:pointer;">
                        <i class="fas fa-calendar-alt"></i> الحجوزات
                    </li>
                    <li onclick="location.href='${root}Create/create-booking.html'" style="padding:15px; cursor:pointer;">
                        <i class="fas fa-plus-circle"></i> إنشاء حجز
                    </li>
                </ul>
            </nav>
        </div>
    </aside>`;

    document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('mainSidebar');

    if (window.innerWidth <= 768) {
        // --- منطق الموبايل: يعتمد على الضغط فقط ---
        if (menuToggle && sidebar) {
            menuToggle.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();
                sidebar.classList.toggle('active');
                console.log("تم النقر في الموبايل");
            };
        }
    } else {
        // --- منطق الكمبيوتر: يعتمد على الـ Hover ---
        // لا نحتاج لكود جافاسكريبت هنا لأن الـ CSS (sidebar-hover) يتكفل بالأمر
        sidebar.classList.add('sidebar-hover');
    }

    // إغلاق القائمة عند النقر في الخارج (للموبايل)
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
            sidebar.classList.remove('active');
        }
    });
});