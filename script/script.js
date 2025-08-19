// Script für Multi-Select Filter-Funktion der Speisekarte
document.addEventListener('DOMContentLoaded', () => {
    const filterList = document.querySelector('.ulFilter');
    const itemBoxes = document.querySelectorAll('.item-box');

    // Array für aktive Filter
    let activeCategories = [];

    /**
     * Funktion: Filtert die Items basierend auf den aktiven Kategorien
     */
    function filterItems() {
    itemBoxes.forEach(box => {
        const itemCategory = box.getAttribute('data-category').toLowerCase();

        if (
            activeCategories.length === 0 ||
            activeCategories.includes('alles') ||
            activeCategories.includes(itemCategory)
        ) {
            // wieder sichtbar machen: display zuerst, dann Animation
            if (box.style.display === 'none') {
                box.style.display = 'block';
                // ans Ende verschieben
                box.parentNode.appendChild(box);
            }
            requestAnimationFrame(() => {
                box.classList.remove('hidden'); // Transition startet sanft
            });
        } else {
            // ausblenden: Transition, danach display:none
            box.classList.add('hidden');
            setTimeout(() => {
                if (box.classList.contains('hidden')) {
                    box.style.display = 'none';
                }
            }, 400);
        }
    });
}

    /**
     * Funktion: Toggle für Filter-Buttons
     */
    function toggleFilter(button) {
        const category = button.textContent.trim().toLowerCase();

        if (category === 'alles') {
            // Reset: nur "alles" aktiv
            activeCategories = ['alles'];
            [...filterList.children].forEach(btn => btn.classList.remove('current'));
            button.classList.add('current');
        } else {
            // "alles" rauswerfen, wenn ein spezifischer Filter genutzt wird
            activeCategories = activeCategories.filter(cat => cat !== 'alles');
            filterList.querySelector('li:first-child')?.classList.remove('current'); // "Alles"-Button zurücksetzen

            if (activeCategories.includes(category)) {
                // schon drin → entfernen
                activeCategories = activeCategories.filter(cat => cat !== category);
                button.classList.remove('current');
            } else {
                // noch nicht drin → hinzufügen
                activeCategories.push(category);
                button.classList.add('current');
            }
        }

        filterItems();
    }

    // Nur ein Event-Listener für die gesamte Liste
    filterList.addEventListener('click', e => {
        if (e.target.tagName === 'LI') {
            toggleFilter(e.target);
        }
    });

    // Initial: "Alles" aktiv
    activeCategories = ['alles'];
    filterList.querySelector('li:first-child')?.classList.add('current');
    filterItems();
});
