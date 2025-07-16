// ═══════════════════════════════════════════════════════════════
// منوی دیجیتال کافه - اسکریپت اصلی
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

const menuContainer = document.getElementById('menu-container');
const filtersContainer = document.getElementById('category-filters');

let fullMenuData = []; // برای نگهداری کل داده‌های منو

// تابع اعمال تنظیمات از config
function applyConfigSettings() {
    // تنظیم عنوان صفحه
    document.title = `منوی دیجیتال ${CAFE_CONFIG.name}`;
    
    // تنظیم نام کافه
    document.getElementById('cafe-name').textContent = CAFE_CONFIG.name;
    
    // تنظیم پیام خوش‌آمدگویی
    document.getElementById('welcome-message').textContent = CAFE_CONFIG.welcomeMessage;
    
    // تنظیم لوگو (در صورت وجود)
    const logoContainer = document.getElementById('logo-container');
    if (CAFE_CONFIG.logo) {
        logoContainer.innerHTML = `<img src="${CAFE_CONFIG.logo}" alt="لوگوی ${CAFE_CONFIG.name}" id="cafe-logo">`;
    }
    
    // تنظیم اعتبار توسعه‌دهنده
    const creditElement = document.getElementById('developer-credit');
    if (CAFE_CONFIG.developer.showCredit) {
        creditElement.innerHTML = `طراحی و توسعه توسط <a href="https://mykh.ir/" target="_blank">${CAFE_CONFIG.developer.name}</a> ⭐`;
    } else {
        creditElement.style.display = 'none';
    }
    
    // اعمال رنگ‌ها
    applyColors();
}

// تابع اعمال رنگ‌ها و تولید شیدهای هوشمند
function applyColors() {
    const root = document.documentElement;
    const colors = CAFE_CONFIG.colors;

    // تنظیم رنگ‌های اصلی از کانفیگ
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--card-background', colors.cardBackground);
    root.style.setProperty('--text-color', colors.text);
    root.style.setProperty('--light-text-color', colors.lightText);

    // تولید و اعمال شیدهای هوشمند برای رنگ اصلی
    root.style.setProperty('--primary-hover-color', adjustColor(colors.primary, 20));
    root.style.setProperty('--primary-active-color', adjustColor(colors.primary, -10));
    root.style.setProperty('--primary-text-color', getContrastYIQ(colors.primary));
}

/**
 * یک رنگ هگز را به مقدار مشخصی روشن‌تر یا تیره‌تر می‌کند.
 * @param {string} color - رنگ هگز ورودی (مثلاً #A0522D).
 * @param {number} amount - مقدار تغییر (مثبت برای روشن‌تر، منفی برای تیره‌تر).
 * @returns {string} رنگ هگز جدید.
 */
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, c => 
        ('0' + Math.min(255, Math.max(0, parseInt(c, 16) + amount)).toString(16)).substr(-2)
    );
}

/**
 * بر اساس روشنایی رنگ پس‌زمینه، رنگ متن مناسب (سیاه یا سفید) را برمی‌گرداند.
 * @param {string} hexcolor - رنگ هگز پس‌زمینه.
 * @returns {string} '#ffffff' (سفید) یا '#000000' (سیاه).
 */
function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    const r = parseInt(hexcolor.substr(0,2),16);
    const g = parseInt(hexcolor.substr(2,2),16);
    const b = parseInt(hexcolor.substr(4,2),16);
    const yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
}

// تابع اصلی برای شروع عملیات
async function initializeMenu() {
    // اعمال تنظیمات از config
    applyConfigSettings();
    
    try {
        menuContainer.innerHTML = '<div class="loading">درحال بارگذاری منو...</div>';
        const response = await fetch(CAFE_CONFIG.googleSheetURL);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const csvText = await response.text();
        fullMenuData = csvToArray(csvText);

        setupCategoryFilters();
        displayMenu(fullMenuData); // نمایش همه آیتم‌ها در ابتدا

    } catch (error) {
        menuContainer.innerHTML = '<div class="loading">خطا در بارگذاری منو. لطفاً از صحت لینک گوگل شیت و نام ستون‌ها اطمینان حاصل کنید.</div>';
        console.error('Error initializing menu:', error);
    }
}

// تابع برای تبدیل متن CSV به آرایه‌ای از آبجکت‌ها (با پشتیبانی از کاما در مقادیر)
function csvToArray(csv) {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return rows.slice(1).map(row => {
        if (!row) return null;

        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());

        if (values.length !== headers.length) return null;

        const entry = {};
        headers.forEach((header, index) => {
            // حذف کوتیشن‌های اضافی از مقادیر
            entry[header] = values[index] ? values[index].replace(/"/g, '').trim() : '';
        });
        return entry;
    }).filter(Boolean);
}

// تابع برای ایجاد دکمه‌های فیلتر
function setupCategoryFilters() {
    // پیدا کردن دسته‌بندی‌های یکتا
    const categories = ['همه', ...new Set(fullMenuData.map(item => item.Category))];
    
    filtersContainer.innerHTML = ''; // پاک کردن فیلترهای قبلی
    categories.forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = category;
        if (category === 'همه') {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => {
            // مدیریت کلاس 'active'
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // فیلتر کردن و نمایش منو
            const filteredData = category === 'همه'
                ? fullMenuData
                : fullMenuData.filter(item => item.Category === category);
            
            displayMenu(filteredData);
        });
        filtersContainer.appendChild(btn);
    });
}

// تابع برای نمایش آیتم‌های منو در صفحه
function displayMenu(data) {
    menuContainer.innerHTML = ''; // پاک کردن محتوای فعلی
    
    if (data.length === 0) {
        menuContainer.innerHTML = '<div class="loading">آیتمی برای نمایش یافت نشد.</div>';
        return;
    }

    // گروه‌بندی آیتم‌ها بر اساس دسته‌بندی
    const groupedMenu = data.reduce((acc, item) => {
        const category = item.Category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});

    // ایجاد HTML
    for (const category in groupedMenu) {
        const section = document.createElement('div');
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category;
        section.appendChild(title);

        groupedMenu[category].forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'menu-item';
            
            // ساخت HTML بر اساس تنظیمات
            let itemHTML = '';
            
            // تصویر (در صورت فعال بودن)
            if (CAFE_CONFIG.showImages && item.ImageURL) {
                itemHTML += `<img src="${item.ImageURL}" alt="${item.Name}" class="item-image" onerror="this.style.display='none'">`;
            }
            
            // جزئیات آیتم
            itemHTML += '<div class="item-details">';
            itemHTML += `<h3 class="item-name">${item.Name}</h3>`;
            
            // توضیحات (در صورت وجود و فعال بودن)
            if (CAFE_CONFIG.showDescription && item.Description) {
                itemHTML += `<p class="item-description">${item.Description}</p>`;
            }
            
            itemHTML += `<p class="item-price">${formatPrice(item.Price)} ${CAFE_CONFIG.currency}</p>`;
            itemHTML += '</div>';
            
            menuItemDiv.innerHTML = itemHTML;
            section.appendChild(menuItemDiv);
        });
        menuContainer.appendChild(section);
    }
}

/**
 * یک عدد را به فرمت فارسی با جداکننده هزارگان تبدیل می‌کند.
 * @param {string|number} price - قیمت ورودی.
 * @returns {string} قیمت فرمت‌شده به فارسی.
 */
function formatPrice(price) {
    const number = Number(price);
    if (isNaN(number)) {
        return price; // اگر عدد نبود، همان متن اصلی را برگردان
    }
    return number.toLocaleString('fa-IR');
}

// --- منطق دکمه رفتن به بالا ---
const scrollTopBtn = document.getElementById('scrollTopBtn');

// نمایش دکمه هنگام اسکرول
window.onscroll = function() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        scrollTopBtn.style.display = "block";
    } else {
        scrollTopBtn.style.display = "none";
    }
};

// کلیک برای رفتن به بالا
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});


// اجرای برنامه
initializeMenu();

});
