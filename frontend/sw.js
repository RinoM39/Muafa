// اسم الكاش (مفيد لتحديث الموقع لاحقاً)
const CACHE_NAME = 'muafa-v1';

// الأحداث الأساسية المطلوبة ليعمل الـ PWA
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activated');
});

// هذا الحدث ضروري جداً لكي يعتبر المتصفح الموقع PWA
self.addEventListener('fetch', (event) => {
    // يمكنك تركه فارغاً الآن، وجوده فقط يكفي لتحقيق الشروط
});