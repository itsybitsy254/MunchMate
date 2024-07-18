document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded');
    fetchMenuItems();

    // Load application state from localStorage
    loadAppState();

    // Add event listeners for navigation links
    document.querySelectorAll('header nav ul li a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.target.getAttribute('href').substring(1);
            console.log('Navigation link clicked:', targetId);
            showSection(targetId);
            saveAppState(); // Save app state on navigation
        });
    });

    // Add event listener for the "Complete Order" button
    const completeOrderButton = document.getElementById('complete-order');
    if (completeOrderButton) {
        completeOrderButton.addEventListener('click', () => {
            console.log('Complete Order button clicked');
            displayOrderDetails();
            showSection('checkout');
            saveAppState(); // Save app state on order completion
        });
    } else {
        console.error('Complete Order button not found');
    }

    // Add event listener for the checkout form
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            placeOrder();
        });
    } else {
        console.error('Checkout form not found');
    }

    // Show the correct section based on saved state
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        const { currentSection } = JSON.parse(savedState);
        console.log('Loading saved section:', currentSection);
        showSection(currentSection);
    } else {
        // Default to 'home' if no saved state
        showSection('home');
    }
});

async function fetchMenuItems() {
    try {
        const response = await fetch('https://munchdb.onrender.com/menu');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
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
            saveAppState(); // Save app state on category toggle
        });

        categoryHeaderContainer.appendChild(categoryHeader);

        const categoryItemsContainer = document.createElement('div');
        categoryItemsContainer.className = 'category-items-container hidden';
        categoryItemsContainer.id = `${category}-items`;

        menuItems[category].items.forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'menu-item';

            const imageUrl = new URL(item.picture, 'https://munchdb.onrender.com');  // adjust the base URL as needed
            menuItemDiv.innerHTML = `
                <img src="${imageUrl.href}" alt="${item.name}" class="menu-item-image">
                <div class="menu-item-details">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    <p>Price: $${item.price.toFixed(2)}</p>
                    <button onclick="addToCart('${item.name}', ${item.price}, '${imageUrl.href}')">Add to Cart</button>
                </div>
            `;
            categoryItemsContainer.appendChild(menuItemDiv);
        });

        menuContainer.appendChild(categoryItemsContainer);
    });
}

let cart = [];

// Add to cart and save state
function addToCart(name, price, imageUrl) {
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ name, price, quantity: 1, imageUrl });
    }

    updateCart();
    saveAppState(); // Save app state when adding to cart

    const alertContainer = document.getElementById('soft-alert');
    alertContainer.textContent = `${name} added to cart`;
    alertContainer.style.display = 'block';

    setTimeout(() => {
        alertContainer.style.display = 'none';
    }, 2000); // Hide after 2 seconds (adjust as needed)
}

// Update cart and save state
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
    saveAppState(); // Save app state when cart is updated
}

// Remove from cart and save state
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

// Display order details
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

// Place order and clear cart
function placeOrder() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;

    const order = {
        customer: { name, email },
        items: cart,
        total: cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    };

    console.log('Order placed:', order);
    alert('Thank you for your order! Please Wait as we package your meal for Delivery...');

    cart = [];
    updateCart();
    document.getElementById('checkout-form').reset();
    clearOrderDetails();
    showSection('home');
    saveAppState(); // Save app state after placing order
}

function clearOrderDetails() {
    const orderDetails = document.getElementById('order-details');
    orderDetails.innerHTML = '';
}

// Continue shopping button
const continueShoppingButton = document.getElementById('continue-shopping');
if (continueShoppingButton) {
    continueShoppingButton.addEventListener('click', () => {
        showSection('menu');
        saveAppState(); // Save app state on continue shopping
    });
} else {
    console.error('Continue Shopping button not found');
}

// Show section
function showSection(sectionId) {
    console.log(`Navigating to section: ${sectionId}`);
    document.querySelectorAll('section').forEach(section => {
        if (section.id === sectionId) {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
}

// Toggle category items
function toggleCategoryItems(category) {
    const categoryItemsContainers = document.querySelectorAll('.category-items-container');
    categoryItemsContainers.forEach(container => {
        if (container.id === `${category}-items`) {
            container.classList.toggle('hidden');
        } else {
            container.classList.add('hidden');
        }
    });
    saveAppState(); // Save app state on category toggle
}

// Save app state to localStorage
function saveAppState() {
    const currentSection = Array.from(document.querySelectorAll('section')).find(section => section.style.display === 'block')?.id || 'home';
    const appState = {
        currentSection,
        cart
    };
    console.log('Saving app state:', appState);
    localStorage.setItem('appState', JSON.stringify(appState));
}

// Load app state from localStorage
function loadAppState() {
    const savedState = localStorage.getItem('appState');
    if (savedState) {
        const { currentSection, cart: savedCart } = JSON.parse(savedState);
        cart = savedCart || [];
        console.log('Loading saved cart:', cart);
        updateCart(); // Ensure cart is updated based on saved state
        showSection(currentSection);
    } else {
        // Default to 'home' if no saved state
        showSection('home');
    }
}
