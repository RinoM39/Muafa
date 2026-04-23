document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('langToggle');

    function updateLanguage(lang) {
        // 1. تغيير اتجاه الصفحة
        document.body.dir = (lang === 'ar') ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;

        // 2. ترجمة النصوص
        const transElements = document.querySelectorAll('[data-en]');
        transElements.forEach(el => {
            const text = (lang === 'ar') ? el.getAttribute('data-ar') : el.getAttribute('data-en');
            if (text) el.textContent = text;
        });

        // 3. ترجمة الـ Placeholders
        const inputs = document.querySelectorAll('.translate-ph');
        inputs.forEach(input => {
            const ph = (lang === 'ar') ? input.getAttribute('data-ar-ph') : input.getAttribute('data-en-ph');
            if (ph) input.placeholder = ph;
        });
        
        // حفظ اللغة
        localStorage.setItem('selectedLanguage', lang);
    }

    // استرجاع اللغة المفضلة
    const savedLang = localStorage.getItem('selectedLanguage') || 'en';
    langToggle.value = savedLang;
    updateLanguage(savedLang);

    langToggle.addEventListener('change', (e) => {
        updateLanguage(e.target.value);
    });

    // دالة Menu Active
    window.selectMenu = (element) => {
        document.querySelectorAll('nav ul li').forEach(li => li.classList.remove('active'));
        element.classList.add('active');
    };

// دالة الانتقال لصفحة تسجيل الدخول
function goToAuth() {
    // يمكنك تغيير اسم الملف إلى اسم صفحة تسجيل الدخول الخاصة بك
    window.location.href = "auth.html"; 
}

});