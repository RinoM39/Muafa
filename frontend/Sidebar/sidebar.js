document.addEventListener("DOMContentLoaded", function() {
    // يعمل فقط إذا كان عرض الشاشة أكبر من 768 بكسل (كمبيوتر)
    if (window.innerWidth > 768) {
        const path = window.location.pathname;
        const isSubFolder = path.includes('/Auth/') || path.includes('/Create/') || path.includes('/Booking/');
        const root = isSubFolder ? '../' : '';

        // 1. بناء هيكل السايدبار مع إضافة زر التحميل
        const sidebarHTML = `
        <aside class="sidebar-hover" id="desktopSidebar">
            <div class="sidebar-content">
                <img src="${root}logo.jpg" alt="Logo" style="width:70px; display:block; margin:20px auto;">
                <h2 style="text-align:center; color:#575756; font-size: 1.2rem;">مُعافى</h2>
                <nav style="margin-top: 30px;">
                    <ul style="list-style:none; padding:0; text-align: right;">
                        <li onclick="location.href='${root}index.html'" style="padding:15px 20px; cursor:pointer; color:#575756;">
                            <i class="fas fa-chart-line" style="margin-left:10px;"></i> لوحة التحكم
                        </li>
                        <li onclick="location.href='${root}Booking/bookings.html'" style="padding:15px 20px; cursor:pointer; color:#575756;">
                            <i class="fas fa-calendar-alt" style="margin-left:10px;"></i> الحجوزات
                        </li>
                        <li onclick="location.href='${root}Create/create-booking.html'" style="padding:15px 20px; cursor:pointer; color:#575756;">
                            <i class="fas fa-plus-circle" style="margin-left:10px;"></i> إنشاء حجز
                        </li>
                        <li id="installApp" style="padding:15px 20px; cursor:pointer; color:#5A9789; font-weight:bold; display:none;">
                            <i class="fas fa-download" style="margin-left:10px;"></i> تحميل التطبيق
                        </li>
                    </ul>
                </nav>
            </div>
        </aside>`;

        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // 2. تنسيقات الـ CSS المحدثة (لتقليل الحافة ومنع التغطية)
        const style = document.createElement('style');
        style.innerHTML = `
            .sidebar-hover { 
                position: fixed; 
                right: -250px; /* تم تعديله ليظهر 10px فقط وهو مغلق */
                top: 0; 
                width: 260px; 
                height: 100vh; 
                background: white; 
                border-left: 1px solid #eee; 
                transition: 0.3s ease-in-out; 
                z-index: 9999; 
                box-shadow: -2px 0 10px rgba(0,0,0,0.05); 
                direction: rtl; 
            }

            .sidebar-hover:hover { 
                right: 0; 
            }

            /* دفع المحتوى الرئيسي لليسار عند فتح السايدبار لكي لا يتغطى شيء */
            .sidebar-hover:hover ~ .main-content,
            .sidebar-hover:hover ~ main { 
                margin-right: 260px !important; 
                margin-left: 0 !important;
            }

            .main-content { 
                transition: 0.6s ease-in-out; 
                margin-right: 5px; /* يطابق الحافة الظاهرة لمنع الفراغ الأبيض */
            }

            .sidebar-hover li:hover { 
                background-color: #f8f9fa; 
                color: #5A9789 !important; 
            }
        `;
        document.head.appendChild(style);

        // 3. منطق برمجة زر التحميل (PWA) داخل السايدبار
        let innerDeferredPrompt;
        const installBtn = document.getElementById('installApp');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            innerDeferredPrompt = e;
            if (installBtn) installBtn.style.display = 'block';
        });

        if (installBtn) {
            installBtn.addEventListener('click', async () => {
                if (innerDeferredPrompt) {
                    innerDeferredPrompt.prompt();
                    const { outcome } = await innerDeferredPrompt.userChoice;
                    if (outcome === 'accepted') console.log('User accepted');
                    innerDeferredPrompt = null;
                    installBtn.style.display = 'none';
                }
            });
        }
    }

    // 4. ميزة إظهار نافذة كروم التلقائية بعد 3 ثوانٍ (للموبايل والكمبيوتر)
    let globalDeferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        globalDeferredPrompt = e;

        setTimeout(() => {
            if (globalDeferredPrompt) {
                globalDeferredPrompt.prompt();
                globalDeferredPrompt.userChoice.then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') console.log('User installed via Chrome Prompt');
                    globalDeferredPrompt = null;
                });
            }
        }, 3000); 
    });
});