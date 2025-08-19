document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.querySelector('.items');
    const filterList = document.querySelector('.ulFilter');
    const menuTitle = document.querySelector('.menuTitle');
    const langButtons = document.querySelectorAll('.language-switcher button');

    let currentLang = 'de';
    let menuData = [];
    let activeCategories = new Set();

    // Funktion: JSON für aktuelle Sprache laden
    async function loadMenu(lang) {
        try {



            const response = await fetch(`lang/${lang}.json`);
            const data = await response.json();
            menuData = data.items;

            // Menü-Titel setzen
            menuTitle.textContent = data.menuTitle || '';

            buildMenu();
            buildFilters(data.filters); // Filter aus JSON nutzen
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
            box.setAttribute('data-category', item.category);

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

    // Funktion: Filter anwenden
    function applyFilters() {
        const boxes = document.querySelectorAll('.item-box');
        boxes.forEach(box => {
            const cat = box.getAttribute('data-category');
            if (activeCategories.size === 0 || activeCategories.has(cat)) {
                box.classList.remove('hidden');
                box.style.display = 'block';
            } else {
                box.classList.add('hidden');
                setTimeout(() => {
                    if (box.classList.contains('hidden')) box.style.display = 'none';
                }, 400);
            }
        });
    }

    // Filter-Klick
    filterList.addEventListener('click', e => {
        if (e.target.tagName === 'LI') {
            const category = e.target.textContent;
            if (category === 'Alles') {
                activeCategories.clear();
                [...filterList.children].forEach(li => li.classList.remove('current'));
                e.target.classList.add('current');
            } else {
                const li = e.target;
                li.classList.toggle('current');
                if (li.classList.contains('current')) activeCategories.add(category);
                else activeCategories.delete(category);
            }
            applyFilters();
        }
    });

    // Sprache wechseln
    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            loadMenu(currentLang);
        });
    });

    // Initial laden
    loadMenu(currentLang);
});
