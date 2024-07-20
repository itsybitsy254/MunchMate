document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    fetchMenuItems();
    loadAppState();

    // Navigation
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            console.log('Navigation link clicked:', targetId);
            showSection(targetId);
            saveAppState();
        });
    });

    // Complete Order Button
    const completeOrderButton = document.getElementById('complete-order');
    if (completeOrderButton) {
        completeOrderButton.addEventListener('click', () => {
            console.log('Complete Order button clicked');
            displayOrderDetails();
            showSection('checkout');
            saveAppState();
        });
    } else {
        console.error('Complete Order button not found');
    }

    // Checkout Form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            placeOrder();
        });
    } else {
        console.error('Checkout form not found');
    }

    // Continue Shopping Button
    const continueShoppingButton = document.getElementById('continue-shopping');
    if (continueShoppingButton) {
        continueShoppingButton.addEventListener('click', () => {
            showSection('menu');
            saveAppState();
        });
    } else {
        console.error('Continue Shopping button not found');
    }

    // Real-Time Search
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => searchMenuItems(e.target.value));
    } else {
        console.error('Search bar not found');
    }

    // Filter Functionality
    const filterButton = document.getElementById('filter-button');
    const priceFilter = document.getElementById('price-filter');
    if (filterButton && priceFilter) {
        filterButton.addEventListener('click', () => filterByPrice(priceFilter.value));
    } else {
        console.error('Filter button or price filter not found');
    }

    // Favorites Functionality
    const favoritesButton = document.getElementById('favorites-button');
    if (favoritesButton) {
        favoritesButton.addEventListener('click', () => showSection('favorites'));
    } else {
        console.error('Favorites button not found');
    }

    // Load saved section
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        const { currentSection } = JSON.parse(savedState);
        console.log('Loading saved section:', currentSection);
        showSection(currentSection);
    } else {
        showSection('home');
    }
});

async function fetchMenuItems() {
    try {
        const response = await fetch('https://munchdb.onrender.com/menu');
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        displayMenuItems(data);
    } catch (error) {
        console.error('Error fetching menu items:', error.message);
    }
}

function displayMenuItems(menuItems) {
    const menuContainer = document.getElementById('menu-items');
    menuContainer.innerHTML = '';

    const categoryHeaderContainer = document.createElement('div');
    categoryHeaderContainer.className = 'menu-category-header-container';
    menuContainer.appendChild(categoryHeaderContainer);

    Object.keys(menuItems).forEach(category => {
        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'menu-category-header';
        categoryHeader.textContent = category;
        categoryHeader.addEventListener('click', () => {
            toggleCategoryItems(category);
            saveAppState();
        });

        categoryHeaderContainer.appendChild(categoryHeader);

        const categoryItemsContainer = document.createElement('div');
        categoryItemsContainer.className = 'category-items-container hidden';
        categoryItemsContainer.id = `${category}-items`;

        menuItems[category].items.forEach(item => {
            const isFavorite = favorites.includes(item.name.toLowerCase()) ? '❤️' : '🤍';

            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'menu-item';
            menuItemDiv.setAttribute('data-name', item.name.toLowerCase());
            menuItemDiv.setAttribute('data-price', item.price.toFixed(2));
            menuItemDiv.innerHTML = `
                <img src="${item.picture}" alt="${item.name}" class="menu-item-image">
                <div class="menu-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <button onclick="addToCart('${item.name}', ${item.price}, '${item.picture}')">Add to Cart</button>
                    <button onclick="toggleFavorite('${item.name.toLowerCase()}', this)">${isFavorite}</button>
                </div>
            `;
            categoryItemsContainer.appendChild(menuItemDiv);
        });

        menuContainer.appendChild(categoryItemsContainer);
    });

    updateFavorites();
}

let cart = [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

function addToCart(name, price, imageUrl) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1, imageUrl });
    }

    updateCart();
    saveAppState();

    showSoftAlert(`${name} added to cart`);
}

function updateCart() {
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '';

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p>Price: $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                <button onclick="removeFromCart('${item.name}')">Remove</button>
            </div>
        `;
        cartContainer.appendChild(cartItemDiv);
    });

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    document.getElementById('total').innerHTML = `Total: $${totalAmount.toFixed(2)}`;
    saveAppState();
}

function removeFromCart(name) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) {
        if (existingItem.quantity > 1) {
            existingItem.quantity--;
        } else {
            const itemIndex = cart.findIndex(item => item.name === name);
            cart.splice(itemIndex, 1);
        }
    }

    updateCart();
}

function displayOrderDetails() {
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = '';

    cart.forEach(item => {
        const orderItemDiv = document.createElement('div');
        orderItemDiv.className = 'order-item';
        orderItemDiv.innerHTML = `
            <h3>${item.name}</h3>
            <p>Price: $${item.price.toFixed(2)} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
        `;
        orderDetails.appendChild(orderItemDiv);
    });

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const totalDiv = document.createElement('div');
    totalDiv.className = 'order-total';
    totalDiv.innerHTML = `Total: $${totalAmount.toFixed(2)}`;
    orderDetails.appendChild(totalDiv);
}

function placeOrder() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const order = {
        customer: { name, email },
        items: cart,
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0),
        date: new Date().toLocaleString()
    };

    console.log('Order placed:', order);

    cart = [];
    updateCart();
    alert('Order placed successfully! Please wait as we package your meal for Delivery');
    showSection('home'); // Reload to home section
    saveAppState();
}

function showSection(sectionId) {
    console.log(`Navigating to section: ${sectionId}`);
    document.querySelectorAll('section').forEach(section => {
        section.style.display = section.id === sectionId ? 'block' : 'none';
    });
}

function toggleCategoryItems(category) {
    const categoryItemsContainers = document.querySelectorAll('.category-items-container');
    categoryItemsContainers.forEach(container => {
        if (container.id === `${category}-items`) {
            container.classList.toggle('hidden');
        } else {
            container.classList.add('hidden');
        }
    });
    saveAppState();
}

function saveAppState() {
    const currentSection = Array.from(document.querySelectorAll('section')).find(section => section.style.display === 'block')?.id || 'home';
    const appState = {
        currentSection,
        cart,
        favorites
    };
    console.log('Saving app state:', appState);
    localStorage.setItem('appState', JSON.stringify(appState));
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadAppState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        const { currentSection, cart: savedCart, favorites: savedFavorites } = JSON.parse(savedState);
        cart = savedCart || [];
        favorites = savedFavorites || [];
        console.log('Loading saved cart:', cart);
        updateCart();
        updateFavorites();
        showSection(currentSection);
    } else {
        showSection('home');
    }
}

function toggleFavorite(itemName, button) {
    const itemIndex = favorites.indexOf(itemName.toLowerCase());
    let message;

    if (itemIndex === -1) {
        favorites.push(itemName.toLowerCase());
        button.textContent = '❤️'; // Favorite icon
        message = `${itemName} added to favorites!`;
    } else {
        favorites.splice(itemIndex, 1);
        button.textContent = '🤍'; // Not favorite icon
        message = `${itemName} removed from favorites!`;
    }
    
    saveAppState();
    updateFavorites();
    showSoftAlert(message);
}

function updateFavorites() {
    const favoritesContainer = document.getElementById('favorite-items');
    favoritesContainer.innerHTML = '';
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const itemName = item.getAttribute('data-name');
        if (favorites.includes(itemName)) {
            const favoriteItemDiv = document.createElement('div');
            favoriteItemDiv.className = 'favorite-item';
            favoriteItemDiv.innerHTML = item.innerHTML;
            favoritesContainer.appendChild(favoriteItemDiv);
        }
    });
}

// Real-Time Search
const searchMenuItems = (query) => {
    const menuItems = document.getElementById('menu-items');
    const allItems = menuItems.querySelectorAll('.menu-item');
    allItems.forEach(item => {
        const itemName = item.getAttribute('data-name');
        if (itemName.includes(query.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
};

// Filter by Price Functionality
const filterByPrice = (filterValue) => {
    const menuItems = document.getElementById('menu-items');
    const allItems = menuItems.querySelectorAll('.menu-item');
    allItems.forEach(item => {
        const itemPrice = parseFloat(item.getAttribute('data-price'));
        switch (filterValue) {
            case 'min15':
                item.style.display = itemPrice >= 15 ? 'block' : 'none';
                break;
            case 'max15':
                item.style.display = itemPrice <= 15 ? 'block' : 'none';
                break;
            default:
                item.style.display = 'block';
                break;
        }
    });
};

// Show soft alert
function showSoftAlert(message) {
    const alertContainer = document.getElementById('soft-alert');
    if (!alertContainer) {
        console.error('Soft alert container not found');
        return;
    }
    alertContainer.textContent = message;
    alertContainer.style.display = 'block';

    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 2000);
}
