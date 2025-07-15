// لینک CSV که از گوگل شیت کپی کردید را اینجا جای‌گذاری کنید
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6PUzQQzzPHFf5-QOpL58JWOFwUTKFzs3vi95mCHJQVB6efWYoMzTCs7wQ9bWRZw7k1OO6_9CuylCl/pub?output=csv';

const menuContainer = document.getElementById('menu-container');
const filtersContainer = document.getElementById('category-filters');

let fullMenuData = []; // برای نگهداری کل داده‌های منو

// تابع اصلی برای شروع عملیات
async function initializeMenu() {
    try {
        menuContainer.innerHTML = '<div class="loading">درحال بارگذاری منو...</div>';
        const response = await fetch(googleSheetURL);
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

// تابع برای تبدیل متن CSV به آرایه‌ای از آبجکت‌ها
function csvToArray(csv) {
    const rows = csv.trim().split('\n');
    const headers = rows[0].split(',').map(h => h.trim()); // حذف فاصله‌های اضافی از هدرها
    
    return rows.slice(1).map(row => {
        const values = row.split(',');
        // اگر ردیف خالی بود، از آن رد شو
        if (values.length < headers.length) return null;

        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index] ? values[index].trim() : '';
        });
        return entry;
    }).filter(Boolean); // حذف ردیف‌های خالی
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
            menuItemDiv.innerHTML = `
                <img src="${item.ImageURL}" alt="${item.Name}" class="item-image" onerror="this.style.display='none'">
                <div class="item-details">
                    <h3 class="item-name">${item.Name}</h3>
                    <p class="item-price">${item.Price} تومان</p>
                </div>
            `;
            section.appendChild(menuItemDiv);
        });
        menuContainer.appendChild(section);
    }
}

// اجرای برنامه
initializeMenu();
