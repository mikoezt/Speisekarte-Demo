//Menu Script
document.addEventListener('DOMContentLoaded', () => {

    //#region Elemente
    const itemsContainer = document.querySelector('.items');
    const filterList = document.querySelector('.ulFilter');
    const menuTitle = document.querySelector('.menuTitle');
    const cartTitle = document.querySelector('.cartTitle');
    const cartSum = document.querySelector('.cartSum');
    const cartEmpty = document.querySelector('.cartEmpty');

    const filterTitle = document.querySelector('.filterTitle');
    const toggle = document.querySelector('.lang-toggle');
    const dropdown = document.querySelector('.lang-dropdown');
    const langButtons = document.querySelectorAll('.lang-dropdown li');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalElem = document.querySelector('.cart-total');
    const cartEl = document.querySelector('.cart');
    //#endregion

    //#region Daten & State
    let cart = [];
    let currentLang = 'de';
    let menuData = [];
    let activeCategories = new Set();
    //#endregion

    //#region Funktionen

    // JSON für aktuelle Sprache laden
    async function loadMenu(lang) {
        try {
            const response = await fetch(`lang/${lang}.json`);
            const data = await response.json();
            menuData = data.items;

            menuTitle.textContent = data.menuTitle || '';
            cartTitle.textContent = data.cartTitle || '';
            cartSum.textContent = data.cartSum || '';
            cartEmpty.textContent = data.cartEmpty || '';
            filterTitle.textContent = data.filterTitle || '';

            buildMenu();
            buildFilters(data.filters);
            applyFilters();
        } catch (err) {
            console.error("Fehler beim Laden der Menü-Daten:", err);
        }
    }

    // Menü erstellen
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
                <div class="item-footer">
                    <span class="price">${item.price} €</span>
                    <button class="add-to-cart">+</button>
                </div>
            `;
            itemsContainer.appendChild(box);
        });
    }

    // Filter erstellen
    function buildFilters(filterArray = []) {
        filterList.innerHTML = '';
        filterArray.forEach((cat, index) => {
            const li = document.createElement('li');
            li.textContent = cat;
            if (index === 0) li.classList.add('current');
            filterList.appendChild(li);
        });
        activeCategories.clear();
    }

    // Filter anwenden
    function applyFilters() {
        const boxes = document.querySelectorAll('.item-box');
        boxes.forEach(box => {
            const cat = box.getAttribute('data-category');
            if (activeCategories.size === 0 || activeCategories.has(cat) || activeCategories.has('alles')) {
                box.style.display = 'block';
                requestAnimationFrame(() => box.classList.remove('hidden'));
            } else {
                box.classList.add('hidden');
                setTimeout(() => { box.style.display = 'none'; }, 400);
            }
        });
    }

    // Filter toggeln
    function toggleFilter(button) {
        const category = button.textContent.trim().toLowerCase();
        const allLi = filterList.querySelector('li:first-child');

        if (category === 'alles') {
            activeCategories.clear();
            activeCategories.add('alles');
            [...filterList.children].forEach(btn => btn.classList.remove('current'));
            allLi.classList.add('current');
        } else {
            activeCategories.delete('alles');
            if (activeCategories.has(category)) {
                activeCategories.delete(category);
                button.classList.remove('current');
            } else {
                activeCategories.add(category);
                button.classList.add('current');
            }
            if (activeCategories.size === 0) allLi.classList.add('current');
            else allLi.classList.remove('current');
        }
        applyFilters();
    }

    // Artikel zum Warenkorb hinzufügen
    function addToCart(itemData) {
        const existing = cart.find(i => i.title === itemData.title);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({...itemData, qty: 1});
        }
        renderCart();
    }

    // Warenkorb rendern
    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            const emptyP = document.createElement('p');
            emptyP.classList.add('empty');
            emptyP.textContent = 'Noch keine Artikel hinzugefügt';
            cartItemsContainer.appendChild(emptyP);
            cartTotalElem.textContent = '0,00 €';
        } else {
            let total = 0;
            cart.forEach((item, index) => {
                const div = document.createElement('div');
                div.classList.add('cart-item');
                div.innerHTML = `
                    <span class="title">${item.title}</span>
                    <div class="qty-controls">
                        <button class="decrease" data-index="${index}">–</button>
                        <span>${item.qty}</span>
                        <button class="increase" data-index="${index}">+</button>
                    </div>
                    <div class="price">${(item.price * item.qty).toFixed(2)} €</div>
                `;
                cartItemsContainer.appendChild(div);
                total += item.price * item.qty;
            });
            cartTotalElem.textContent = total.toFixed(2) + ' €';
        }

        updateCartBadge();
    }

    // Badge aktualisieren
    function updateCartBadge() {
        let badge = document.querySelector('.cart-badge'); // direkt im body
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

        if (!badge) {
            badge = document.createElement('div');
            badge.classList.add('cart-badge');
            document.body.appendChild(badge); // NICHT in cartEl!
        }

        if (totalItems === 0 || !cartEl.classList.contains('collapsed')) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
            badge.textContent = totalItems;

            const rect = cartEl.getBoundingClientRect();
            badge.style.top = `${rect.top - 8}px`;
            badge.style.left = `${rect.left + rect.width - 8}px`;
        }
    }
    //#endregion Funktionen

    //#region Event Listener

    // Filter klicken
    filterList.addEventListener('click', e => {
        if (e.target.tagName === 'LI') toggleFilter(e.target);
    });

    // Sprache wechseln
    toggle.addEventListener('click', e => {
        e.stopPropagation();
        dropdown.classList.toggle('open');
    });

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

    // Artikel hinzufügen
    itemsContainer.addEventListener('click', e => {
        if (e.target.classList.contains('add-to-cart')) {
            const box = e.target.closest('.item-box');
            const title = box.querySelector('h2').textContent;
            const price = parseFloat(box.querySelector('.price').textContent.replace(' €',''));
            addToCart({title, price});
        }
    });

    // Artikelanzahl ändern
    cartItemsContainer.addEventListener('click', e => {
        const index = e.target.dataset.index;
        if (index === undefined) return;
        if (e.target.classList.contains('increase')) cart[index].qty += 1;
        if (e.target.classList.contains('decrease')) {
            cart[index].qty -= 1;
            if (cart[index].qty <= 0) cart.splice(index, 1);
        }
        renderCart();
    });

    // Klick auf Warenkorb toggelt collapsed
    cartEl.addEventListener('click', e => {
        if (! cartEl.classList.contains('collapsed')) {
            const isClickOnHeader = e.target.closest('.cart-header');
            if (! isClickOnHeader) return;
        }
        cartEl.classList.toggle('collapsed');
        updateCartBadge(); 
    });

    // Fenster Events
    window.addEventListener('resize', updateCartBadge);
    window.addEventListener('scroll', updateCartBadge);

    // Klick außerhalb schließt Dropdown
    document.addEventListener('click', () => dropdown.classList.remove('open'));
    document.addEventListener('keydown', e => { 
        if (e.key === "Escape") dropdown.classList.remove('open'); 
    });

    //#endregion Event Listener

    //#region Initialisierung
    loadMenu(currentLang);
    cartEl.classList.add('collapsed');
    updateCartBadge();
    //#endregion Initialisierung
});
