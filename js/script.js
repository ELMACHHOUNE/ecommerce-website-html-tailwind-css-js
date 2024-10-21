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

// Function to add a product to the cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);

  if (!product) {
    alert("Product not found.");
    return;
  }

  const existingProduct = cart.find(item => item.id === productId);
  if (existingProduct) {
    existingProduct.quantity += 1; // Increase quantity if already in cart
  } else {
    cart.push({ ...product, quantity: 1 }); // Add product with quantity
  }

  localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to local storage
  alert(`${product.name} has been added to your cart!`);
  updateCartDisplay(); // Update cart display
}
function updateCartDisplay() {
  const cartItemsDiv = document.getElementById('cart-items');
  const totalElement = document.getElementById('total');
  const checkoutButton = document.getElementById('checkout-button');
  
  // Get references to both desktop and mobile cart count elements
  const cartCountElement = document.getElementById('cart-count');
  const mobileCartCountElement = document.getElementById('mobile-cart-count');

  if (cartItemsDiv) {
    cartItemsDiv.innerHTML = '';
    let total = 0;

    cart.forEach(product => {
      const item = document.createElement('div');
      item.className = 'flex justify-between items-center bg-white p-4 rounded-lg shadow-md mb-2';
      item.innerHTML = `
        <div class="flex items-center">
          <img src="${product.image}" alt="${product.name}" class="w-16 h-16 object-cover rounded-lg mr-4">
          <div>
            <span class="font-bold">${product.name}</span>
            <div class="flex items-center space-x-2 mt-1">
              <button onclick="updateQuantity(${product.id}, -1)" class="text-gray-500 bg-gray-200 p-2 rounded">  -  </button>
              <span>${product.quantity}</span>
              <button onclick="updateQuantity(${product.id}, 1)" class="text-gray-500 bg-gray-200 p-2 rounded">+</button>
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <span class="font-bold">${product.price * product.quantity} DH</span>
          <button onclick="removeFromCart(${product.id})" class="text-red-600 bg-red-100 p-2 rounded hover:bg-red-400 transition duration-300 ease-in-out">Delete</button>
        </div>
      `;
      cartItemsDiv.appendChild(item);
      total += product.price * product.quantity;
    });

    totalElement.innerText = `Total: ${total} DH`;
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
}

// Call this function on page load to display cart items
updateCartDisplay();
if (document.getElementById('checkout-button')) {
  document.getElementById('checkout-button').addEventListener('click', checkout);
}
