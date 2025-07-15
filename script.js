// لینک CSV که از گوگل شیت کپی کردید را اینجا جای‌گذاری کنید
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS6PUzQQzzPHFf5-QOpL58JWOFwUTKFzs3vi95mCHJQVB6efWYoMzTCs7wQ9bWRZw7k1OO6_9CuylCl/pub?output=csv';

const menuContainer = document.getElementById('menu-container');

// این تابع برای تبدیل متن CSV به آرایه‌ای از آبجکت‌ها استفاده می‌شود
function csvToArray(csv) {
    const rows = csv.split('\n');
    const headers = rows[0].split(',');
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const entry = {};
        for (let j = 0; j < headers.length; j++) {
            entry[headers[j].trim()] = values[j].trim();
        }
        data.push(entry);
    }
    return data;
}

// این تابع آیتم‌های منو را بر اساس دسته‌بندی گروه‌بندی می‌کند
function groupByCategory(data) {
    return data.reduce((acc, item) => {
        const category = item.Category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {});
}

// تابع اصلی برای بارگذاری و نمایش منو
async function loadMenu() {
    try {
        const response = await fetch(googleSheetURL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const csvText = await response.text();
        const menuData = csvToArray(csvText);
        const groupedMenu = groupByCategory(menuData);

        // پاک کردن پیام "درحال بارگذاری"
        menuContainer.innerHTML = '';

        // ایجاد HTML برای هر دسته‌بندی و آیتم
        for (const category in groupedMenu) {
            const section = document.createElement('div');
            section.className = 'category-section';

            const title = document.createElement('h2');
            title.className = 'category-title';
            title.textContent = category;
            section.appendChild(title);

            groupedMenu[category].forEach(item => {
                const menuItemDiv = document.createElement('div');
                menuItemDiv.className = 'menu-item';

                menuItemDiv.innerHTML = `
                    <img src="${item.ImageURL}" alt="${item.Name}" class="item-image">
                    <div class="item-details">
                        <h3 class="item-name">${item.Name}</h3>
                        <p class="item-price">${item.Price} تومان</p>
                    </div>
                `;
                section.appendChild(menuItemDiv);
            });

            menuContainer.appendChild(section);
        }

    } catch (error) {
        menuContainer.innerHTML = '<div class="loading">خطا در بارگذاری منو. لطفاً دوباره تلاش کنید.</div>';
        console.error('There was a problem fetching the menu:', error);
    }
}

// اجرای تابع اصلی
loadMenu();
