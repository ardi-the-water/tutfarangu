// ═══════════════════════════════════════════════════════════════
// تنظیمات منوی دیجیتال کافه - فقط این بخش را تغییر دهید
// ═══════════════════════════════════════════════════════════════

const CAFE_CONFIG = {
    // ═══ اطلاعات کافه ═══
    name: "به توت فرنگو خوش آمدید",
    welcomeMessage: "مدیریت زهرا قزوینی",
    logo: "https://i.postimg.cc/prC5VKBT/Friendly-hi-cafe-Logo-with-Bright-White-1.png", // مسیر لوگو (اختیاری) - مثال: "assets/logo.png"
    
    // ═══ لینک گوگل شیت ═══
    // راهنما: از گوگل شیت خود، File > Share > Publish to web > CSV را انتخاب کنید
    googleSheetURL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQn8Lql_5LgSCksjSG9FGjMKT7d75zwmyDU06KflCTfAoMOQiZm7ovjU-BeB3-ohW9pgIa_3pD9lvfN/pub?output=csv',
    
    // ═══ رنگ‌بندی هوشمند ═══
    // با تغییر رنگ اصلی، رنگ هاور، اکتیو و متن به صورت خودکار تنظیم می‌شود.
    colors: {
        primary: "#A0522D",      // رنگ اصلی: هدر، فوتر و دکمه‌های فعال
        secondary: "#D2691E",    // رنگ ثانویه: قیمت‌ها و جزئیات مهم
        background: "#F5F5DC",   // پس‌زمینه کلی صفحه
        cardBackground: "rgba(255, 255, 255, 0.8)", // پس‌زمینه کارت‌های منو (برای افکت شیشه‌ای از rgba استفاده کنید)
        text: "#3D2B1F",         // رنگ متن اصلی
        lightText: "#8B4513"     // رنگ متن‌های فرعی (مانند توضیحات)
    },
    
    // ═══ تنظیمات نمایش ═══
    currency: "تومان",          // واحد پول
    showImages: true,           // نمایش تصاویر آیتم‌ها
    showDescription: true,      // نمایش توضیحات آیتم‌ها

    // ═══ شبکه‌های اجتماعی ═══
    socialMedia: {
        enabled: true, // نمایش دکمه اصلی شبکه‌های اجتماعی
        openInNewTab: true, // باز شدن لینک‌ها در تب جدید
        instagram: {
            enabled: true,
            url: "https://www.instagram.com/zahra_ghazvini20?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" // لینک اینستاگرام خود را اینجا قرار دهید
        },
        telegram: {
            enabled: false,
            url: "https://t.me/your_channel" // لینک تلگرام خود را اینجا قرار دهید
        },
        whatsapp: {
            enabled: false,
            url: "https://wa.me/your_number" // لینک واتس‌اپ خود را اینجا قرار دهید
        }
    },

    // ═══ تنظیمات فونت ═══
    // برای استفاده از فونت محلی، فایل فونت را در پوشه assets/fonts قرار دهید
    // و نام خانواده و مسیر فایل را در اینجا مشخص کنید.
    font: {
        fontFamily: "SGKara-Regular", // نام خانواده فونت که در CSS استفاده می‌شود
        fontFile: "assets/fonts/SGKara-Regular.ttf" // مسیر فایل فونت
    },
    
    // ═══ اطلاعات توسعه‌دهنده ═══
    developer: {
        name: "علی خداکرمی",
        showCredit: true        // نمایش اعتبار توسعه‌دهنده در فوتر
    }
};

// ═══════════════════════════════════════════════════════════════
// توجه: فایل‌های دیگر را تغییر ندهید!
// ═══════════════════════════════════════════════════════════════
