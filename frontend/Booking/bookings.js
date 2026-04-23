// 1. المتغيرات العالمية لضمان الوصول إليها من أي مكان
let currentSelectedBookingId = null;
let allBookings = [];

document.addEventListener("DOMContentLoaded", () => {
    loadBookings();

    // منع الفورم من تحديث الصفحة نهائياً عند الضغط على أزرار عشوائية
    const form = document.getElementById('confirmBookingForm');
    if (form) {
       form.addEventListener('submit', submitBooking); // نربطه بدالة الإرسال الجديدة
    }

    // زر إغلاق المودال
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById('bookingModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }
});

// 2. دالة جلب وعرض الكروت
async function loadBookings() {
    const container = document.querySelector('.bookings-grid');
    try {
        const response = await fetch('http://127.0.0.1:8000/api/bookings');
        allBookings = await response.json(); 

        // 1. عرض كل البيانات عند أول تحميل
        renderBookings(allBookings);
        // 2. تشغيل نظام البحث
        setupSearch();

        if (container) {
            container.innerHTML = ''; 
            allBookings.forEach(booking => {
                // تأمين البيانات لتحويلها لنص داخل الـ onclick
                const bookingData = JSON.stringify(booking).replace(/'/g, "&apos;");
                
                const cardHTML = `
                    <div class="booking-card">
                        <div class="card-image">
                            <img src="../logo.jpg" alt="صورة">
                            <span class="category-badge">مدة الجلسة: ${booking.duration_minutes || 60} د</span>
                        </div>
                        <div class="card-details">
                            <h3 class="customer-name-text">${booking.venue_name || 'اسم المكان'}</h3>
                            <p class="venue-text"><i class="fas fa-user"></i> المسؤول: ${booking.customer_name || 'غير محدد'}</p>
                            <p class="price-text">
                                <i class="fas fa-money-bill-wave"></i> 
                                <span>${booking.price || 0}</span> ل.س
                            </p>
                            <button class="btn-view" onclick='prepareAndOpenModal(${bookingData})'>حجز الآن</button>
                        </div>
                    </div>`;
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        }
    } catch (error) {
        console.error("خطأ في جلب الكروت:", error);
    }
}



window.prepareAndOpenModal = function(booking) {
    // تخزين الـ ID الحقيقي من قاعدة البيانات (id)
    currentSelectedBookingId = booking.id; 

    // توحيد الحقول لتجنب undefined
    const data = {
        id: booking.id,
        title: booking.venue_name,
        desc: booking.description || "لا يوجد وصف حالياً",
        price: booking.price,
        duration: booking.duration_minutes || 60,
        // معالجة أيام العمل سواء كانت نص JSON أو مصفوفة
        working_days: typeof booking.working_days === 'string' ? JSON.parse(booking.working_days) : booking.working_days
    };

    // تعبئة الـ HTML بالبيانات
    document.getElementById('modalTitle').innerText = data.title;
    document.getElementById('modalDescription').innerText = data.desc;
    document.getElementById('unitPrice').innerText = data.price;
    document.getElementById('modalDuration').innerText = data.duration;
    
    // تصفير التاريخ والوقت عند فتح مودال جديد
    document.getElementById('selectedBookingDate').value = "";
    document.getElementById('selected_time').innerHTML = '<option value="">اختر اليوم أولاً</option>';

    // بناء التقويم المتاح لهذا المكان
    generateCalendar(data);

    // إظهار المودال
    const modal = document.getElementById('bookingModal');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
};

function generateCalendar(data) {
    const calendarContainer = document.getElementById('weeklyCalendar');
    if (!calendarContainer) return;

    calendarContainer.innerHTML = '';
    const dayNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayNamesAr = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        let date = new Date();
        date.setDate(today.getDate() + i);
        let dayNameEn = dayNamesEn[date.getDay()];

        if (data.working_days && data.working_days.includes(dayNameEn)) {
            const dayBtn = document.createElement('div');
            dayBtn.className = 'day-slot-btn';
            // تخزين الـ ID داخل الزر لضمان عدم ضياعه
            dayBtn.setAttribute('data-venue-id', data.id); 
            
            dayBtn.innerHTML = `
                <span class="day-name">${dayNamesAr[date.getDay()]}</span>
                <span class="day-date">${date.getDate()}/${date.getMonth() + 1}</span>
            `;
            
            dayBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation(); // منع انتقال الحدث للفورم

                document.querySelectorAll('.day-slot-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const formattedDate = date.toISOString().split('T')[0];
                document.getElementById('selectedBookingDate').value = formattedDate;
                
                // جلب الـ ID من الزر مباشرة
                const venueId = this.getAttribute('data-venue-id');
                loadAvailableTimes(venueId, formattedDate);
            };
            calendarContainer.appendChild(dayBtn);
        }
    }
}

async function loadAvailableTimes(venueId, selectedDate) {
    const timeSelect = document.getElementById('selected_time');
    if (!timeSelect) return;

    console.log(`🔎 جاري الفحص للمكان: ${venueId} بتاريخ: ${selectedDate}`);

    if (!venueId || venueId === "undefined") {
        console.error("❌ فشل: الـ ID غير معرف");
        return;
    }

    timeSelect.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-booked-slots?venue_id=${venueId}&date=${selectedDate}`);
        
        if (!response.ok) {
            const errorHtml = await response.text();
            console.error("❌ خطأ من السيرفر (500): جاري عرض تفاصيل الخطأ...");
            // هذا السطر سيفتح صفحة الخطأ في الكونسول لتعرف السطر المعطل في لارافيل
            console.log(errorHtml.substring(0, 500)); 
            throw new Error(`Server error: ${response.status}`);
        }

        const bookedSlots = await response.json();
        const duration = parseFloat(document.getElementById('modalDuration').innerText) || 60;
        
        // توليد الخيارات
        const slots = generateTimeSlots(duration , bookedSlots);
        timeSelect.innerHTML = '<option value="">اختر الوقت المناسب</option>';
        
        slots.forEach(slot => {
            let option = document.createElement('option');
            option.value = slot.value;
            option.textContent = slot.label;
            timeSelect.appendChild(option);
        });

    } catch (error) {
        console.error("❌ Network/Logic Error:", error);
        timeSelect.innerHTML = '<option value="">تعذر جلب الأوقات</option>';
    }

    
}

function generateTimeSlots(durationInHours, bookedSlots = []) {
    const slots = [];
    
    // 1. تحويل مدة الحجز من ساعات إلى دقائق لضمان دقة الحساب
    const durationInMinutes = durationInHours * 60;

    // 2. تحويل بداية ونهاية الدوام لدقائق كقيمة مطلقة
    // 8 صباحاً = 8 * 60 = 480 دقيقة
    // 10 مساءً = 22 * 60 = 1320 دقيقة
    let currentTotalMinutes = 8 * 60; 
    const endTotalMinutes = 22 * 60;

    while (currentTotalMinutes + durationInMinutes <= endTotalMinutes) {
        // 3. استخراج الساعات والدقائق الحقيقية من المجموع الكلي
        const hours = Math.floor(currentTotalMinutes / 60);
        const minutes = currentTotalMinutes % 60;

        // 4. تنسيق القيمة لإرسالها للباك أند (HH:mm) مثل "08:00"
        const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // 5. تنسيق القيمة للعرض الجمالي للمستخدم (12-hour format)
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        // 6. التحقق من الحجوزات المستلمة من الباك أند
        if (!bookedSlots.includes(timeValue)) {
            slots.push({
                value: timeValue,
                label: displayTime
            });
        }

        // 7. إضافة المدة (بالدقائق) للانتقال للموعد التالي
        currentTotalMinutes += durationInMinutes;
    }
    return slots;
}

async function submitBooking(event) {
    event.preventDefault();

    // تجهيز البيانات من المودال
    const bookingData = {
        booking_id: currentSelectedBookingId, // الـ ID الذي حفظناه عند فتح المودال
        customer_email: document.getElementById('customer_email').value,
        phone: document.getElementById('customer_phone').value, // اختياري حسب الـ Controller
        date: document.getElementById('selectedBookingDate').value,
        time: document.getElementById('selected_time').value
    };

    // التحقق من اكتمال البيانات قبل الإرسال
    if (!bookingData.date || !bookingData.time) {
        alert("يرجى اختيار اليوم والوقت أولاً");
        return;
    }

    try {
        const response = await fetch('http://127.0.0.1:8000/api/reserve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("✅ " + result.message);
            // إغلاق المودال وتصفير الفورم
            document.getElementById('bookingModal').style.display = 'none';
            document.getElementById('confirmBookingForm').reset();
            document.body.style.overflow = 'auto';
        } else {
            alert("❌ " + (result.message || "حدث خطأ أثناء الحجز"));
        }
    } catch (error) {
        console.error("Error submitting booking:", error);
        alert("تعذر الاتصال بالسيرفر لإتمام الحجز");
    }
}


function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        // الفلترة بناءً على اسم المكان أو الوصف
        const filteredResults = allBookings.filter(booking => {
            const name = (booking.venue_name || "").toLowerCase();
            const desc = (booking.description || "").toLowerCase();
            return name.includes(searchTerm) || desc.includes(searchTerm);
        });

        // استدعاء دالة الرسم لعرض النتائج المفلترة فقط
        renderBookings(filteredResults);
    });
}

// دالة مساعدة لعرض الكروت (منعاً لتكرار الكود)
function renderBookings(bookingsList) {
    const container = document.querySelector('.bookings-grid');
    if (!container) return;

    container.innerHTML = ''; // تنظيف الحاوية قبل العرض الجديد

    bookingsList.forEach(booking => {
        // تحويل البيانات لنص آمن للاستخدام داخل الـ onclick
        const bookingData = JSON.stringify(booking).replace(/'/g, "&apos;");
        
        const cardHTML = `
            <div class="booking-card">
                <div class="card-image">
                    <img src="../logo.jpg" alt="صورة">
                    <span class="category-badge">مدة الجلسة: ${booking.duration_minutes || 60} د</span>
                </div>
                <div class="card-details">
                    <h3 class="customer-name-text">${booking.venue_name || 'اسم المكان'}</h3>
                    <p class="venue-text"><i class="fas fa-user"></i> المسؤول: ${booking.customer_name || 'غير محدد'}</p>
                    <p class="price-text">
                        <i class="fas fa-money-bill-wave"></i> 
                        <span>${booking.price || 0}</span> ل.س
                    </p>
                    <button class="btn-view" onclick='prepareAndOpenModal(${bookingData})'>حجز الآن</button>
                </div>
            </div>`;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}