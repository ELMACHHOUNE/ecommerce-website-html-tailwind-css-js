// Load the cart from localStorage or initialize it as an empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Variable to store the products
let products = [];

// Fetch product data from data.json
fetch('data.json')
  .then(response => response.json())
  .then(data => {
    products = data;
    updateCartDisplay(); // Call updateCartDisplay after products are loaded
  })
  .catch(error => console.error('Error loading product data:', error));

// Handle mobile menu toggle
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
menuToggle.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

function showAlert(message) {
  const alertContainer = document.getElementById("alert-container");

  // Create the alert HTML structure
  const alertHTML = `
    <div role="alert" class="rounded-xl border border-gray-100 bg-white p-4 shadow-lg">
      <div class="flex items-start gap-4">
        <span class="text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
        <div class="flex-1">
          <strong class="block font-medium text-gray-900">Success</strong>
          <p class="mt-1 text-sm text-gray-700">${message}</p>
        </div>
        <button class="text-gray-500 transition hover:text-gray-600" onclick="dismissAlert(this)">
          <span class="sr-only">Dismiss popup</span>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `;

  // Append the alert to the container
  alertContainer.innerHTML = alertHTML;

  // Automatically remove the alert after 3 seconds
  setTimeout(() => {
    dismissAlert(alertContainer.querySelector('button')); // dismiss alert after timeout
  }, 3000);
}

function dismissAlert(button) {
  button.closest('div[role="alert"]').remove();
}

// Function to add to cart
function addToCart(productId) {
  // Find the product by its ID
  const product = products.find(p => p.id === productId);

  // Check if the product exists
  if (!product) {
    showAlert("Product not found."); // Show alert if product is not found
    return;
  }

  // Check if the product is already in the cart
  const existingProduct = cart.find(item => item.id === productId);
  if (existingProduct) {
    existingProduct.quantity += 1; // Increase quantity if already in cart
  } else {
    // Add product with quantity
    cart.push({ ...product, quantity: 1 });
  }

  // Save cart to local storage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Show success alert
  showAlert(`${product.name} has been added to your cart!`);

  // Update cart display
  updateCartDisplay(); 
}

function updateCartDisplay() {
  const cartItemsDiv = document.getElementById('cart-items');
  const totalElement = document.getElementById('total');
  const checkoutButton = document.getElementById('checkout-button');
  const emptyCartDiv = document.getElementById('empty-cart'); // Reference to the empty cart message
  const cartContainer = document.querySelector('.relative.w-full.max-w-4xl'); // Reference to the cart items container

  // Get references to both desktop and mobile cart count elements
  const cartCountElement = document.getElementById('cart-count');
  const mobileCartCountElement = document.getElementById('mobile-cart-count');

  if (cartItemsDiv) {
    cartItemsDiv.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      // Show the empty cart message if there are no items
      emptyCartDiv.classList.remove('hidden');
      cartContainer.classList.add('hidden'); // Hide the cart items container
      totalElement.innerText = 'Total: 0 DH'; // Reset total to 0 when cart is empty
    } else {
      // Hide the empty cart message if there are items
      emptyCartDiv.classList.add('hidden');
      cartContainer.classList.remove('hidden'); // Show the cart items container

      cart.forEach(product => {
        const item = document.createElement('div');
        item.className = 'flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-2';
        item.innerHTML = `
          <div class="flex items-center">
            <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg mr-4">
            <div>
              <span class="font-bold">${product.name}</span>
              <div class="flex items-center space-x-2 mt-1">
                <button onclick="updateQuantity(${product.id}, -1)" class="text-gray-500 bg-gray-200 p-2 rounded hover:bg-gray-300 transition duration-300 ease-in-out">-</button>
                <span class="font-semibold">${product.quantity}</span>
                <button onclick="updateQuantity(${product.id}, 1)" class="text-gray-500 bg-gray-200 p-2 rounded hover:bg-gray-300 transition duration-300 ease-in-out">+</button>
              </div>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="font-bold">${product.price * product.quantity} DH</span>
            <button onclick="removeFromCart(${product.id})" class="flex items-center justify-center text-red-600 hover:bg-red-100 transition duration-300 ease-in-out p-2 rounded">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        `;
        cartItemsDiv.appendChild(item);
        total += product.price * product.quantity;
      });

      totalElement.innerText = `Total: ${total} DH`; // Update total
    }
  }

  // Update both cart count elements
  const cartCount = cart.reduce((sum, product) => sum + product.quantity, 0);
  cartCountElement.innerText = cartCount;
  mobileCartCountElement.innerText = cartCount;

  // Enable or disable checkout button
  if (checkoutButton) {
    checkoutButton.disabled = cart.length === 0;
  }
}

// Function to update product quantity
function updateQuantity(productId, change) {
  const product = cart.find(item => item.id === productId);
  if (product) {
    product.quantity += change;
    if (product.quantity <= 0) {
      removeFromCart(productId);
    } else {
      localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in local storage
      updateCartDisplay(); // Update display
    }
  }
}

// Function to remove a product from the cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in local storage
  updateCartDisplay(); // Update display
}

// Function to checkout
function checkout() {
  if (cart.length === 0) return;

  const productDetails = cart.map(product => `${product.name} - ${product.price * product.quantity} DH`).join(', ');
  const total = cart.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const shippingPrice = 30; // Shipping cost
  const grandTotal = total + shippingPrice; // Grand total with shipping

  const message = `Hello! Thank you for choosing MR TECHNOLOGIES. Here are the details of your order:\n\n${productDetails}.\n\nTotal Amount: ${total} DH\nShipping Cost: ${shippingPrice} DH\nGrand Total: ${grandTotal} DH.\n\nPlease confirm your order, and we will contact you shortly for delivery details.`;

  const phoneNumber = '+212649455082';
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  // Redirect to WhatsApp
  window.open(whatsappURL, '_blank');

  // Clear the cart
  cart = [];
  localStorage.setItem('cart', JSON.stringify(cart)); // Update cart in local storage

  // Update the cart display
  updateCartDisplay();
}

// Call this function on page load to display cart items
updateCartDisplay();
if (document.getElementById('checkout-button')) {
  document.getElementById('checkout-button').addEventListener('click', checkout);
}
