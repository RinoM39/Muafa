// حماية صفحة إنشاء الحجوزات (مركز طبي + أدمن)
(function() {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('user_role');

    if (!token || (role !== '1' && role !== '2')) {
        showToast("عذراً، يجب أن تملك حساب مركز طبي لإضافة عروض جديدة.");
        window.location.href = "../Booking/bookings.html";
    }
})();

document.addEventListener('DOMContentLoaded', () => {

    const API_URL = 'http://127.0.0.1:8000/api/bookings';
    const createBookingForm = document.getElementById('createBookingForm');
    const saveBtn = document.querySelector('.btn-save');

    // 1. نظام تبديل اللغة
    const langBtns = document.querySelectorAll('.lang-btn, #langToggle'); // يدعم الأزرار وقائمة الاختيار
    langBtns.forEach(btn => {
        btn.addEventListener('change', (e) => { // عند استخدام الـ select
            const lang = e.target.value || btn.getAttribute('data-lang');
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

    // 3. منطق إرسال البيانات للباك أند (استخدام FormData)
    if (createBookingForm) {
        createBookingForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const isAr = document.documentElement.lang === 'ar';

            // تجميع الأيام المختارة
            const selectedDays = [];
            const checkboxes = document.querySelectorAll('input[name="days"]:checked');
            checkboxes.forEach((cb) => selectedDays.push(cb.value));

            console.log("الأيام التي تم جمعها:", selectedDays);

            // إنشاء كائن FormData لدعم إرسال النصوص والصور معاً
            const formData = new FormData();
            formData.append('customer_name', document.getElementById('customer_name')?.value || '');
            formData.append('venue_name', document.getElementById('venue_name')?.value || '');
            formData.append('phone', document.getElementById('phone')?.value || '');
            formData.append('price', parseFloat(document.getElementById('price')?.value) || 0);
            formData.append('duration_minutes', parseInt(document.getElementById('duration_minutes')?.value) || 60);
            formData.append('description', document.getElementById('description')?.value || '');
            
            // الحقول الجديدة (الوقت)
            formData.append('opening_time', document.getElementById('opening_time')?.value || '');
            formData.append('closing_time', document.getElementById('closing_time')?.value || '');
            
            // إضافة مصفوفة الأيام
            selectedDays.forEach(day => formData.append('working_days[]', day));

            // إضافة ملف الصورة
            const imageInput = document.getElementById('image');
            if (imageInput && imageInput.files[0]) {
                formData.append('image', imageInput.files[0]);
            }

            try {
                const token = localStorage.getItem('auth_token');
                saveBtn.disabled = true;
                saveBtn.textContent = isAr ? "...جاري الحفظ" : "...Saving";

                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                        // ملاحظة: لا تضع Content-Type هنا، المتصفح يقوم بتعيينه تلقائياً عند استخدام FormData
                    },
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    showToast(isAr ? "✅ تم إنشاء الحجز بنجاح!" : "✅ Booking Created Successfully!");
                    window.location.href = "../Booking/bookings.html"; 
                } else {
                    const errorData = await response.json();
                    console.error("خطأ من السيرفر:", errorData);
                    showToast(isAr ? "❌ فشل الحفظ: " + (errorData.message || "خطأ غير معروف") : "❌ Save failed", "error");
                }

            } catch (error) {
                console.error("خطأ في الاتصال:", error);
                showToast(isAr ? "❌ لا يمكن الاتصال بالسيرفر (تأكد من تشغيل php artisan serve)" : "❌ Connection Error", "error");
            } finally {
                saveBtn.disabled = false;
                saveBtn.textContent = isAr ? "إتمام إنشاء الحجز" : "Confirm Booking";
            }
        });
    }

    // 4. منطق معاينة الصورة قبل الرفع
    const imageInput = document.getElementById('image');
    if (imageInput) {
        imageInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name || "تم اختيار صورة";
            const fileNameDisplay = document.getElementById('fileNameDisplay');
            if (fileNameDisplay) {
                fileNameDisplay.textContent = fileName;
            }
            
            // معاينة مصغرة للصورة
            const preview = document.getElementById('imagePreview');
            const reader = new FileReader();
            
            reader.onload = function(event) {
                if (preview) {
                    preview.src = event.target.result;
                    preview.style.display = 'block';
                }
            };
            
            if (e.target.files[0]) {
                reader.readAsDataURL(e.target.files[0]);
            }
        });
    }
});