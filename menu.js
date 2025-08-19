document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.querySelector('.items');
    const filterList = document.querySelector('.ulFilter');
    const menuTitle = document.querySelector('.menuTitle');
    const filterTitle = document.querySelector('.filterTitle');
    const toggle = document.querySelector('.lang-toggle');
    const dropdown = document.querySelector('.lang-dropdown');
    const langButtons = document.querySelectorAll('.lang-dropdown li');

    let currentLang = 'de';
    let menuData = [];
    let activeCategories = new Set();

    // Funktion: JSON für aktuelle Sprache laden
    async function loadMenu(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            const data = await response.json();
            menuData = data.items;

            menuTitle.textContent = data.menuTitle || '';
            filterTitle.textContent = data.filterTitle || '';

            buildMenu();
            buildFilters(data.filters);
            applyFilters(); // Filter direkt anwenden
        } catch (err) {
            console.error("Fehler beim Laden der Menü-Daten:", err);
        }
    }

    // Funktion: Filter-Liste erstellen
    function buildFilters(filterArray = []) {
        filterList.innerHTML = '';
        filterArray.forEach((cat, index) => {
            const li = document.createElement('li');
            li.textContent = cat;
            if (index === 0) li.classList.add('current'); // "Alles" standardmäßig aktiv
            filterList.appendChild(li);
        });
        activeCategories.clear();
    }

    // Funktion: Items in den Container einfügen
    function buildMenu() {
        itemsContainer.innerHTML = '';
        menuData.forEach(item => {
            const box = document.createElement('div');
            box.classList.add('item-box');
            box.setAttribute('data-category', item.category.toLowerCase());

            box.innerHTML = `
                <img src="${item.image}" alt="${item.title}">
                <div class="item-description">
                    <h2>${item.title}</h2>
                    <p>${item.description}</p>
                </div>
            `;
            itemsContainer.appendChild(box);
        });
    }

    // Funktion: Filter anwenden mit sanfter Animation
    function applyFilters() {
        const boxes = document.querySelectorAll('.item-box');
        boxes.forEach(box => {
            const cat = box.getAttribute('data-category');

            if (activeCategories.size === 0 || activeCategories.has(cat) || activeCategories.has('alles')) {
                if (box.style.display === 'none' || box.style.display === '') {
                    box.style.display = 'block';
                    box.parentNode.appendChild(box); // neue Items ans Ende
                    requestAnimationFrame(() => box.classList.remove('hidden'));
                }
            } else {
                if (box.style.display !== 'none') {
                    box.classList.add('hidden');
                    setTimeout(() => {
                        if (box.classList.contains('hidden')) box.style.display = 'none';
                    }, 400);
                }
            }
        });
    }

    // Funktion: Toggle für Filter-Buttons
    function toggleFilter(button) {
        const category = button.textContent.trim().toLowerCase();
        const allLi = filterList.querySelector('li:first-child');

        if (category === 'alles') {
            activeCategories.clear();
            activeCategories.add('alles');
            [...filterList.children].forEach(btn => btn.classList.remove('current'));
            allLi.classList.add('current');
        } else {
            activeCategories.delete('alles'); // "Alles" raus
            if (activeCategories.has(category)) {
                activeCategories.delete(category);
                button.classList.remove('current');
            } else {
                activeCategories.add(category);
                button.classList.add('current');
            }

            if (activeCategories.size === 0) {
                activeCategories.add('alles');
                allLi.classList.add('current');
            } else {
                allLi.classList.remove('current');
            }
        }

        applyFilters();
    }

    // EventListener für Filter
    filterList.addEventListener('click', e => {
        if (e.target.tagName === 'LI') toggleFilter(e.target);
    });

    // Dropdown öffnen / schließen
    toggle.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

    // Sprache wechseln
    langButtons.forEach(li => {
        li.addEventListener('click', e => {
            e.stopPropagation();
            const selectedLang = li.dataset.lang;
            loadMenu(selectedLang);

            const flagSrc = li.querySelector('img').getAttribute('src');
            const label = li.textContent.trim();
            toggle.innerHTML = `<img src="${flagSrc}" class="flag-icon"> ${label} ▼`;
            dropdown.classList.remove('open');
        });
    });

    // Klick außerhalb schließt Dropdown
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    document.addEventListener('keydown', e => { if (e.key === "Escape") dropdown.classList.remove('open'); });

    // Initial laden
    loadMenu(currentLang);
});
