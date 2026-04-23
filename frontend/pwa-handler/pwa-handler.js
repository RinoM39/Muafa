// المتغير الخاص بحفظ حدث التثبيت
let deferredPrompt;

// 1. تسجيل الـ Service Worker (مرة واحدة فقط وبشكل صحيح)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // نستخدم المسار المطلق '/' لضمان الوصول للملف في الجذر
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker Registered Successfully!', reg.scope))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// 2. الاستماع لحدث جاهزية التثبيت (Shortcut)
window.addEventListener('beforeinstallprompt', (e) => {
    // منع ظهور الرسالة التلقائية فجأة
    e.preventDefault();
    // حفظ الحدث لاستخدامه عند الضغط على زر التثبيت الخاص بك
    deferredPrompt = e;
    
    console.log('الموقع جاهز للتثبيت كـ Shortcut على الشاشة الرئيسية');
});

// 3. دالة استدعاء التثبيت (يتم ربطها بزر "تحميل التطبيق")
function installApp() {
    if (deferredPrompt) {
        // إظهار نافذة التثبيت للمستخدم
        deferredPrompt.prompt();
        
        // معرفة قرار المستخدم (وافق أم رفض)
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('المستخدم وافق على تثبيت التطبيق');
            } else {
                console.log('المستخدم رفض تثبيت التطبيق');
            }
            // تصفير المتغير لعدم تكرار الطلب فوراً
            deferredPrompt = null;
        });
    } else {
        console.log('خيار التثبيت غير متاح حالياً (قد يكون التطبيق مثبتاً بالفعل)');
    }
}