// ═══════════════════════════════════════════════════════════════
// منوی دیجیتال کافه - اسکریپت اصلی
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', function() {

const menuContainer = document.getElementById('menu-container');
const filtersContainer = document.getElementById('category-filters');
const searchInput = document.getElementById('search-input');

let fullMenuData = []; // برای نگهداری کل داده‌های منو
let activeCategory = 'همه'; // برای نگهداری دسته‌بندی فعال

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

    // اعمال فونت
    applyFont();
}

// تابع اعمال فونت از کانفیگ
function applyFont() {
    if (CAFE_CONFIG.font && CAFE_CONFIG.font.fontFamily && CAFE_CONFIG.font.fontFile) {
        const { fontFamily, fontFile } = CAFE_CONFIG.font;

        // استخراج فرمت فونت از نام فایل
        const format = fontFile.split('.').pop().toLowerCase();
        let fontFormat = format;
        if (format === 'ttf') fontFormat = 'truetype';
        if (format === 'otf') fontFormat = 'opentype';

        // ایجاد استایل داینامیک برای @font-face
        const style = document.createElement('style');
        style.textContent = `
            @font-face {
                font-family: '${fontFamily}';
                src: url('${fontFile}') format('${fontFormat}');
                font-weight: normal;
                font-style: normal;
            }
        `;
        document.head.appendChild(style);

        // اعمال فونت به کل صفحه
        document.body.style.fontFamily = `'${fontFamily}', sans-serif`;
    }
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

// تابع برای ایجاد دکمه‌های فیلتر و کنترل‌های نمایش
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
            activeCategory = category; // به‌روزرسانی دسته‌بندی فعال
            // مدیریت کلاس 'active'
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            filterAndDisplayMenu();
        });
        filtersContainer.appendChild(btn);
    });

    // اضافه کردن event listener برای جستجو
    searchInput.addEventListener('input', filterAndDisplayMenu);

    // منطق دکمه‌های تغییر حالت نمایش با انیمیشن نرم
    const gridViewBtn = document.getElementById('grid-view-btn');
    const listViewBtn = document.getElementById('list-view-btn');

    function switchView(view) {
        animateMenuChange(() => {
            if (view === 'list') {
                menuContainer.classList.add('list-view');
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
            } else {
                menuContainer.classList.remove('list-view');
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
            }
        });
    }

    gridViewBtn.addEventListener('click', () => switchView('grid'));
    listViewBtn.addEventListener('click', () => switchView('list'));
}

// تابع جدید و بهینه برای فیلتر کردن و نمایش منو
function filterAndDisplayMenu() {
    animateMenuChange(() => {
        const searchTerm = searchInput.value.toLowerCase();
        let filteredData = fullMenuData;

        // 1. فیلتر بر اساس دسته‌بندی
        if (activeCategory !== 'همه') {
            filteredData = filteredData.filter(item => item.Category === activeCategory);
        }

        // 2. فیلتر بر اساس جستجو
        if (searchTerm) {
            filteredData = filteredData.filter(item => 
                (item.Name && item.Name.toLowerCase().includes(searchTerm)) ||
                (item.Description && item.Description.toLowerCase().includes(searchTerm))
            );
        }
        
        displayMenu(filteredData);
    });
}

// تابع برای نمایش آیتم‌های منو در صفحه (بهینه‌سازی شده با DocumentFragment)
// تابع انیمیشن FLIP برای تغییرات نرم در منو
function animateMenuChange(updateFunction) {
    const firstRects = new Map();
    const children = Array.from(menuContainer.children);
    children.forEach(child => {
        firstRects.set(child, child.getBoundingClientRect());
    });

    // اجرای تغییرات (مانند فیلتر کردن یا تغییر ویو)
    updateFunction();

    const lastRects = new Map();
    const newChildren = Array.from(menuContainer.children);
    newChildren.forEach(child => {
        lastRects.set(child, child.getBoundingClientRect());
    });

    newChildren.forEach(child => {
        const first = firstRects.get(child);
        const last = lastRects.get(child);

        if (first) { // اگر عنصر از قبل وجود داشته
            const deltaX = first.left - last.left;
            const deltaY = first.top - last.top;
            const deltaW = first.width / last.width;
            const deltaH = first.height / last.height;

            child.style.transition = 'none';
            child.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
            child.style.transformOrigin = 'top left';

            // برای اجرای انیمیشن
            requestAnimationFrame(() => {
                child.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                child.style.transform = '';
            });
        } else { // اگر عنصر جدید است
            child.style.transition = 'none';
            child.style.opacity = '0';
            child.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                child.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                child.style.opacity = '1';
                child.style.transform = '';
            });
        }
    });
}

// تابع برای نمایش آیتم‌های منو در صفحه (بهینه‌سازی شده با DocumentFragment)
function displayMenu(data) {
    menuContainer.innerHTML = ''; // پاک کردن محتوای فعلی
    
    if (data.length === 0) {
        menuContainer.innerHTML = '<div class="loading">آیتمی برای نمایش یافت نشد.</div>';
        return;
    }

    const fragment = document.createDocumentFragment();

    data.forEach(item => {
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';

        // بررسی وضعیت موجودی
        if (item.Available && item.Available.toLowerCase() === 'no') {
            menuItemDiv.classList.add('out-of-stock');
        }
        
        // ساخت HTML بر اساس تنظیمات
        let itemHTML = '';
        
        // تصویر (در صورت فعال بودن)
        if (CAFE_CONFIG.showImages && item.ImageURL) {
            itemHTML += `<img src="${item.ImageURL}" alt="${item.Name}" class="item-image" loading="lazy" onerror="this.style.display='none'">`;
        }
        
        // جزئیات آیتم
        itemHTML += '<div class="item-details">';
        itemHTML += `<h3 class="item-name">${item.Name}</h3>`;
        
        // توضیحات (در صورت وجود و فعال بودن)
        if (CAFE_CONFIG.showDescription && item.Description) {
            itemHTML += `<p class="item-description">${item.Description}</p>`;
        }
        
        itemHTML += `<p class="item-price">${formatPrice(item.Price)} ${CAFE_CONFIG.currency}</p>`;

        // اضافه کردن تگ دسته‌بندی
        if (item.Category) {
            itemHTML += `<div class="item-category-tag">${item.Category}</div>`;
        }

        itemHTML += '</div>';

        // اضافه کردن برچسب (Badge) در صورت وجود
        if (item.Badge) {
            itemHTML += `<div class="item-badge">${item.Badge}</div>`;
        }
        
        menuItemDiv.innerHTML = itemHTML;
        fragment.appendChild(menuItemDiv);
    });

    menuContainer.appendChild(fragment); // اضافه کردن یک‌باره به DOM
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

// --- منطق پیشرفته و بهینه اسکرول ---
const controlsContainer = document.getElementById('controls-container');
let lastScrollTop = 0;
let isThrottled = false;

function handleScroll() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    // نمایش/مخفی کردن دکمه "برو به بالا"
    if (scrollTop > 200) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }

    // انیمیشن محو شدن کنترل‌ها در موبایل
    if (window.innerWidth <= 768) {
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scroll Down
            controlsContainer.classList.add('hidden');
        } else {
            // Scroll Up
            controlsContainer.classList.remove('hidden');
        }
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    isThrottled = false;
}

window.addEventListener('scroll', () => {
    if (!isThrottled) {
        window.requestAnimationFrame(handleScroll);
        isThrottled = true;
    }
});

// کلیک برای رفتن به بالا
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({top: 0, behavior: 'smooth'});
});


    // ═══════════════════════════════════════════════════════════════
    // منطق دکمه‌های شناور شبکه‌های اجتماعی (FAB)
    // ═══════════════════════════════════════════════════════════════
    function setupSocialButtons() {
        const fabContainer = document.getElementById('social-fab-container');
        if (!fabContainer || !CAFE_CONFIG.socialMedia || !CAFE_CONFIG.socialMedia.enabled) {
            if (fabContainer) fabContainer.style.display = 'none';
            return;
        }

        const mainButton = fabContainer.querySelector('.fab-main-button');
        const iconsContainer = fabContainer.querySelector('.social-icons');
        const socialConfig = CAFE_CONFIG.socialMedia;

        const socialPlatforms = [
            { name: 'instagram', icon: 'fab fa-instagram', config: socialConfig.instagram },
            { name: 'telegram', icon: 'fab fa-telegram', config: socialConfig.telegram },
            { name: 'whatsapp', icon: 'fab fa-whatsapp', config: socialConfig.whatsapp }
        ];

        let hasVisibleIcon = false;
        iconsContainer.innerHTML = ''; // پاک کردن آیکون‌های قبلی

        socialPlatforms.forEach(platform => {
            if (platform.config && platform.config.enabled && platform.config.url) {
                hasVisibleIcon = true;
                const link = document.createElement('a');
                link.href = platform.config.url;
                link.className = `social-icon-${platform.name}`;
                link.setAttribute('aria-label', platform.name);
                if (socialConfig.openInNewTab) {
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
                
                const icon = document.createElement('i');
                icon.className = platform.icon;
                link.appendChild(icon);
                iconsContainer.appendChild(link);
            }
        });

        if (!hasVisibleIcon) {
            fabContainer.style.display = 'none';
            return;
        }

        mainButton.addEventListener('click', (e) => {
            e.stopPropagation();
            fabContainer.classList.toggle('open');
        });

        // بستن منو با کلیک بیرون از آن
        document.addEventListener('click', (e) => {
            if (!fabContainer.contains(e.target)) {
                fabContainer.classList.remove('open');
            }
        });
    }

// اجرای برنامه
initializeMenu();
setupSocialButtons(); // فراخوانی تابع جدید

});
