



// فحص حالة تسجيل الدخول لعرض الأزرار المناسبة
const token = localStorage.getItem('auth_token');
const role = localStorage.getItem('user_role');

function checkAccessForBooking() {
    if (!token) {
showToast("⚠️ يرجى تسجيل الدخول أولاً لحجز العروض.", "warning");  
        window.location.href = "../Auth/auth.html";
        return false;
    }
    return true;
}

// إعداد الأحداث عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    loadBookings();

    // منع الفورم من تحديث الصفحة نهائياً عند الضغط على أزرار عشوائية
    const form = document.getElementById('confirmBookingForm');
    if (form) {
       form.addEventListener('submit', submitBooking); 
    }

    // زر إغلاق المودال
    const closeBtn = document.getElementById('closeModal');
    if (closeBtn) {
        closeBtn.onclick = () => {
            const modal = document.getElementById('bookingModal');
            if (modal) modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }
});


// 1. المتغيرات العالمية لضمان الوصول إليها من أي مكان
let currentSelectedBookingId = null;
let allBookings = [];
let selectedBookingForModal = null;

// مصفوفة عامة لتخزين البيانات لكي يستخدمها نظام البحث

async function loadBookings() {
    const container = document.querySelector('.bookings-grid');
    const token = localStorage.getItem('auth_token');

    // إذا لم يكن هناك توكن، لا داعي لإضاعة طلب API
    if (!token) {
        console.error("❌ لا يوجد توكن، يرجى تسجيل الدخول.");
        return;
    }

    console.log("⏳ جاري جلب الحجوزات...");

    try {
        const response = await fetch('http://127.0.0.1:8000/api/bookings', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ فشل السيرفر في الرد:", response.status, errorText);
            return;
        }

        // تحويل النتيجة لـ JSON
        allBookings = await response.json(); 
        console.log("✅ البيانات وصلت:", allBookings);

        // 1. عرض البيانات في الكروت
        if (container) {
            container.innerHTML = ''; 
            
            if (allBookings.length === 0) {
                container.innerHTML = '<p>لا توجد حجوزات متاحة حالياً.</p>';
                return;
            }

            allBookings.forEach(booking => {
                // تأمين البيانات لتحويلها لنص داخل الـ onclick
                const bookingData = JSON.stringify(booking).replace(/'/g, "&apos;");
                
               const cardHTML = `
                    <div class="booking-card">
                        <div class="card-image">
                            <img src="../logo.jpg" alt="صورة">
                            <span class="category-badge">مدة الجلسة: ${booking.duration_minutes || 60} H</span>
                        </div>
                        <div class="card-details">
                            <h3 class="customer-name-text">${booking.venue_name || 'اسم المكان'}</h3>
                            <p class="venue-text"><i class="fas fa-user"></i> المسؤول: ${booking.customer_name || 'غير محدد'}</p>

                            <p class="price-text">
                                <i class="fas fa-money-bill-wave"></i> 
                                <span>${booking.price || 0}</span> ل.س
                            </p>

                            <div class="rating-container-card">
                                <span class="rating-badge">
                                    <i class="fas fa-star"></i>
                                    ${booking.average_rating || 0.0}
                                </span>
                                <span class="ratings-count-text">
                                    (${booking.ratings_count || 0} تقييمات)
                                </span>
                            </div>

                            <button class="btn-view" onclick='prepareAndOpenModal(${bookingData})'>حجز الآن</button>
                        </div>
                    </div>`;
                container.insertAdjacentHTML('beforeend', cardHTML);
            });
        }

        // 2. تشغيل الأنظمة الإضافية (البحث والعرض الإضافي إن وجد)
        if (typeof renderBookings === "function") renderBookings(allBookings);
        if (typeof setupSearch === "function") setupSearch();

    } catch (error) {
        console.error("❌ خطأ في جلب الكروت:", error);
    }
}

window.prepareAndOpenModal = function(booking) {
    // تخزين الـ ID الحقيقي من قاعدة البيانات
    currentSelectedBookingId = booking.id; 
    selectedBookingForModal = booking;

    // توحيد الحقول لتجنب undefined
    const data = {
        id: booking.id,
        title: booking.venue_name || booking.title,
        desc: booking.description || "لا يوجد وصف حالياً",
        price: booking.price,
        duration: booking.duration_minutes || 60,
        image: booking.image, // جلب اسم الصورة من بيانات الحجز
        working_days: typeof booking.working_days === 'string' ? JSON.parse(booking.working_days) : booking.working_days
    };

    // تعبئة البيانات النصية
    const titleEl = document.getElementById('modalTitle');
    if (titleEl) titleEl.innerText = data.title;

    const descEl = document.getElementById('modalDescription');
    if (descEl) descEl.innerText = data.desc;

    const priceEl = document.getElementById('unitPrice');
    if (priceEl) priceEl.innerText = data.price;

    const durationEl = document.getElementById('modalDuration');
    if (durationEl) durationEl.innerText = data.duration;
    
    // ⬇️ التعديل الجديد: تحديث صورة المودال
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        if (data.image) {
            modalImage.src = 'http://127.0.0.1:8000/storage/' + data.image;
        } else {
            modalImage.src = '../logo.jpg';
        }
        
        // صورة احتياطية في حال لم يتم العثور على الصورة
        modalImage.onerror = function() {
            this.onerror = null;
            this.src = '../logo.jpg';
        };
    }
    
    // تصفير التاريخ والوقت عند فتح مودال جديد
    const dateEl = document.getElementById('selectedBookingDate');
    if (dateEl) dateEl.value = "";
    
    const timeEl = document.getElementById('selected_time');
    if (timeEl) timeEl.innerHTML = '<option value="">اختر اليوم أولاً</option>';

    // بناء التقويم المتاح لهذا المكان
    if (typeof generateCalendar === 'function') {
        generateCalendar(data);
    }

    // إظهار المودال
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
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

    if (!venueId || venueId === "undefined") {
        console.error("❌ فشل: الـ ID غير معرف");
        return;
    }

    timeSelect.innerHTML = '<option value="">جاري التحميل...</option>';

    try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-booked-slots?venue_id=${venueId}&date=${selectedDate}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const bookedSlots = await response.json();
        const duration = parseFloat(document.getElementById('modalDuration').innerText) || 60;
        
        // ⬇️ جلب أوقات العمل الديناميكية
        const startTime = selectedBookingForModal?.opening_time || "08:00";
        const endTime = selectedBookingForModal?.closing_time || "22:00";
        
        // توليد الخيارات
        const slots = generateTimeSlots(duration, bookedSlots, startTime, endTime);
        timeSelect.innerHTML = '<option value="">اختر الوقت المناسب</option>';
        
        slots.forEach(slot => {
            let option = document.createElement('option');
            option.value = slot.value;
            option.textContent = slot.label;
            timeSelect.appendChild(option);
        });

    } catch (error) {
        console.error("❌ Error:", error);
        timeSelect.innerHTML = '<option value="">تعذر جلب الأوقات</option>';
    }
}

function generateTimeSlots(durationInHours, bookedSlots = [], startTime = "08:00", endTime = "22:00") {
    const slots = [];
    
    // 1. تحويل مدة الحجز من ساعات إلى دقائق
    const durationInMinutes = durationInHours * 60;

    // 2. تحويل أوقات البدء والانتهاء إلى دقائق
    const startParts = startTime.split(':');
    let currentTotalMinutes = parseInt(startParts[0], 10) * 60 + parseInt(startParts[1], 10);
    
    const endParts = endTime.split(':');
    const endTotalMinutes = parseInt(endParts[0], 10) * 60 + parseInt(endParts[1], 10);

    while (currentTotalMinutes + durationInMinutes <= endTotalMinutes) {
        const hours = Math.floor(currentTotalMinutes / 60);
        const minutes = currentTotalMinutes % 60;

        const timeValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
        const displayTime = `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;

        // 3. التحقق من الحجوزات المستلمة
        if (!bookedSlots.includes(timeValue)) {
            slots.push({
                value: timeValue,
                label: displayTime
            });
        }

        currentTotalMinutes += durationInMinutes;
    }
    return slots;
}

async function submitBooking(event) {
    if (event) event.preventDefault();

    const bookingId = currentSelectedBookingId;
    const date = document.getElementById('selectedBookingDate').value;
    const time = document.getElementById('selected_time').value;
    const customerEmail = document.getElementById('customer_email').value;
    const customer_phone = document.getElementById('customer_phone').value;

    try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch('http://127.0.0.1:8000/api/reserve', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                booking_id: bookingId,
                date: date,
                time: time,
                customer_email: customerEmail,
                customer_phone: customer_phone
            })
        });

        const result = await response.json();

        if (response.ok) {
showToast("✅ " + (result.message || "تم الحجز بنجاح!"), "success");
            // 1. إخفاء الموديل الأول (موديل الحجز القديم) بالكامل
            const firstModalEl = document.getElementById('bookingModal');
            if (firstModalEl) {
                const firstModal = bootstrap.Modal.getInstance(firstModalEl) || new bootstrap.Modal(firstModalEl);
                firstModal.hide();
                
                // إزالة الخلفية الداكنة وإعادة التمرير للصفحة
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(b => b.remove());
                document.body.style.overflow = 'auto';
            }

            // 2. إعادة تعيين الفورم
            const form = document.getElementById('confirmBookingForm');
            if (form) {
                form.reset();
            }

            // 3. فتح الموديل الثاني وتمرير البيانات إليه في المنتصف
            if (selectedBookingForModal) {
                showBookingModal(
                    date,
                    time,
                    selectedBookingForModal.customer_name || selectedBookingForModal.venue_name, 
                    selectedBookingForModal.phone
                );
            }
        } else {
showToast("❌ " + (result.message || "فشل الحجز. يرجى المحاولة مرة أخرى."), "error");
}
    } catch (error) {
        console.error("خطأ:", error);
        showToast("❌ لا يمكن الاتصال بالسيرفر", "error");

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
                          <img src="${booking.image ? 'http://127.0.0.1:8000/storage/' + booking.image : '../logo.jpg'}" 
                     alt="صورة المكان" 
                     onerror="this.onerror=null; this.src='../logo.jpg';">
                                                 <span class="category-badge">مدة الجلسة: ${booking.duration_minutes || 60} H</span>
                        </div>
                        <div class="card-details">
                            <h3 class="customer-name-text">${booking.venue_name || 'اسم المكان'}</h3>
                            <p class="venue-text"><i class="fas fa-user"></i> المسؤول: ${booking.customer_name || 'غير محدد'}</p>
                            
                            <p class="price-text">
                                <i class="fas fa-money-bill-wave"></i> 
                                <span>${booking.price || 0}</span> ل.س
                            </p>

                            <div class="rating-container-card">
                                <span class="rating-badge">
                                    <i class="fas fa-star"></i>
                                    ${booking.average_rating || 0.0}
                                </span>
                                <span class="ratings-count-text">
                                    (${booking.ratings_count || 0} تقييمات)
                                </span>
                            </div>

                            <button class="btn-view" onclick='prepareAndOpenModal(${bookingData})'>حجز الآن</button>
                        </div>
                    </div>`;
                container.insertAdjacentHTML('beforeend', cardHTML);
    });
}

// متغير لتخزين التقييم الحالي
let currentRating = 0;

// دالة لتحديد النجوم
function rate(value) {
    currentRating = value;
    const stars = document.querySelectorAll('#bookingSuccessModal .star');
    stars.forEach((star, index) => {
        if (index < value) {
            star.style.color = '#ffc107'; // لون أصفر للتقييم
        } else {
            star.style.color = '#ccc';
        }
    });
}

// دالة لتحويل الوقت من نظام الـ 24 ساعة إلى نظام الـ 12 ساعة (AM/PM)
function formatTo12Hour(time24) {
    if (!time24) return '';
    const parts = time24.split(':');
    if (parts.length < 2) return time24;
    
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    hours = hours % 12;
    hours = hours ? hours : 12; // الساعة 0 تصبح 12
    
    return `${hours}:${minutes} ${ampm}`;
}

// دالة لعرض الموديل بعد نجاح عملية الحجز
function showBookingModal(date, time, centerName, centerPhone) {
    // تعبئة البيانات في الموديل
    document.getElementById('modal-date').textContent = date;
    document.getElementById('modal-time').textContent = formatTo12Hour(time);
    document.getElementById('modal-center-name').textContent = centerName;
    document.getElementById('modal-center-phone').textContent = centerPhone;

    // إظهار الموديل
    var myModal = new bootstrap.Modal(document.getElementById('bookingSuccessModal'));
    myModal.show();
}

// دالة لإرسال التقييم
async function submitRating() {
    const notes = document.getElementById('rating-notes').value;
    
    // التأكد من أن رقم الحجز الحالي معرف
    const bookingId = typeof currentSelectedBookingId !== 'undefined' ? currentSelectedBookingId : null;
    
    if (!bookingId) {
        showToast("⚠️ لم يتم تحديد الحجز. يرجى المحاولة مرة أخرى.", "warning");
        return;
    }

    const payload = {
        booking_id: bookingId,
        rating: typeof currentRating !== 'undefined' ? currentRating : 0,
        notes: notes
    };

    if (payload.rating === 0 || !payload.rating) {
        showToast("⚠️ يرجى اختيار عدد النجوم أولاً.", "warning");
        return;
    }

    console.log("البيانات التي سيتم إرسالها:", payload);

    try {
        const response = await fetch('http://127.0.0.1:8000/api/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            showToast("✅ " + (result.message || "تم حفظ التقييم بنجاح!"), "success");
            
            // إعادة تعيين حقل الملاحظات والموديل
            document.getElementById('rating-notes').value = '';
            
            if (typeof rate === 'function') {
                rate(0); // تصفير النجوم
            }
            
            // إخفاء الموديل
            const modalEl = document.getElementById('ratingModal');
            if (modalEl) {
                const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                modalInstance.hide();
            }
            
            // إعادة تحميل الكروت لتحديث البيانات
            if (typeof loadBookings === 'function') {
                loadBookings();
            }
        } else {
            showToast("❌ " + (result.message || "فشل حفظ التقييم"), "error");
        }
    } catch (error) {
        console.error("خطأ:", error);
        showToast("❌ لا يمكن الاتصال بالسيرفر", "error");
    }

    var myModalEl = document.getElementById('bookingSuccessModal');
    var modal = bootstrap.Modal.getInstance(myModalEl);
    modal.hide();
}

