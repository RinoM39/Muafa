document.addEventListener('DOMContentLoaded', () => {
    
    const API_URL = 'http://127.0.0.1:8000/api/bookings';
    const createBookingForm = document.getElementById('createBookingForm');
    const saveBtn = document.querySelector('.btn-save');

    // 1. نظام تبديل اللغة
    const langBtns = document.querySelectorAll('.lang-btn');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            const isAr = lang === 'ar';
            document.documentElement.lang = lang;
            document.documentElement.dir = isAr ? 'rtl' : 'ltr';
            document.querySelectorAll('[data-en]').forEach(el => {
                el.textContent = isAr ? el.getAttribute('data-ar') : el.getAttribute('data-en');
            });
        });
    });

    // 2. تحديث الإجمالي التقديري في الملخص
    const priceInput = document.getElementById('price');
    const totalPriceDisplay = document.getElementById('total_price');

    if (priceInput && totalPriceDisplay) {
        priceInput.addEventListener('input', () => {
            totalPriceDisplay.innerText = priceInput.value || "0";
        });
    }

    // 3. منطق إرسال البيانات للباك أند
    if (createBookingForm) {
        createBookingForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 

            const isAr = document.documentElement.lang === 'ar';
            
            // --- الدمج المطلوب: تجميع الأيام المختارة ---
            const selectedDays = [];
            // نبحث عن كل input نوعه checkbox واسمه days ويكون "مختاراً"
            const checkboxes = document.querySelectorAll('input[name="days"]:checked');

            checkboxes.forEach((checkbox) => {
                selectedDays.push(checkbox.value);
            });

            console.log("الأيام التي تم جمعها:", selectedDays); 
            // ------------------------------------------

            const payload = {
                customer_name: document.getElementById('customer_name')?.value,
                venue_name: document.getElementById('venue_name')?.value,
                phone: document.getElementById('phone')?.value,
                price: parseFloat(document.getElementById('price')?.value) || 0,
                duration_minutes: parseInt(document.getElementById('duration_minutes')?.value) || 60,
                people_count: parseInt(document.getElementById('people_count')?.value) || 1,
                description: document.getElementById('description')?.value,
                working_days: selectedDays // إرسال المصفوفة المجمعة
            };

            console.log("البيانات المرسلة كاملة:", payload);

            try {
                saveBtn.disabled = true;
                saveBtn.textContent = isAr ? "...جاري الحفظ" : "...Saving";

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert(isAr ? "✅ تم إنشاء الحجز بنجاح!" : "✅ Booking Created Successfully!");
                    window.location.href = "../Booking/bookings.html"; 
                } else {
                    const errorData = await response.json();
                    console.error("خطأ من السيرفر:", errorData);
                    alert(isAr ? "❌ فشل الحفظ: " + (errorData.message || "خطأ غير معروف") : "❌ Save failed");
                }

            } catch (error) {
                console.error("خطأ في الاتصال:", error);
                alert(isAr ? "❌ لا يمكن الاتصال بالسيرفر (تأكد من تشغيل php artisan serve)" : "❌ Connection Error");
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = isAr ? "إتمام إنشاء الحجز" : "Confirm Booking";
            }
        });
    }
});