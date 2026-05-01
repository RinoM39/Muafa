// إنشاء حاوية التنبيهات عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("toast-container")) {
        const container = document.createElement("div");
        container.id = "toast-container";
        document.body.appendChild(container);
    }
});

// دالة عرض التنبيه
function showToast(message, type = 'success') {
    const container = document.getElementById("toast-container");
    
    // إنشاء عنصر التنبيه
    const toast = document.createElement("div");
    toast.className = `custom-toast ${type}`;
    
    // تحديد الأيقونة حسب النوع
    let iconHTML = `<i class="fas fa-check-circle icon"></i>`;
    if (type === 'error') {
        iconHTML = `<i class="fas fa-exclamation-circle icon"></i>`;
    } else if (type === 'warning') {
        iconHTML = `<i class="fas fa-exclamation-triangle icon"></i>`;
    }
    
    toast.innerHTML = `${iconHTML}<span>${message}</span>`;
    
    // إضافته للحاوية
    container.appendChild(toast);
    
    // إزالة العنصر بعد 4 ثوانٍ لتوفير الذاكرة
    setTimeout(() => {
        toast.remove();
    }, 4000);
}