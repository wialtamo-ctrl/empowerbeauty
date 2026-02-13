// Menú móvil
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
  });
}

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', (e) => {
    navLinks.classList.remove('is-open');
  });
});

// ========== DESPLAZAMIENTO SUAVE ==========
// Scroll suave controlado (≈800ms) para enlaces de ancla
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#' || href === '#!') return;
    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    const headerOffset = 80; // altura aproximada del header fijo
    const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    const startPos = window.pageYOffset;
    const distance = targetPos - startPos;
    const duration = 800; // ms - notable pero no lento
    let startTime = null;

    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function scrollStep(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeInOutCubic(progress);
      window.scrollTo(0, startPos + distance * eased);

      if (progress < 1) requestAnimationFrame(scrollStep);
    }

    requestAnimationFrame(scrollStep);
    history.pushState(null, '', href);
  });
});

// ========== CARRITO ==========
const TICKET_PRICE = 49;
const quantityInput = document.getElementById('ticket-quantity');
const decreaseBtn = document.getElementById('decrease-qty');
const increaseBtn = document.getElementById('increase-qty');
const cartTotal = document.getElementById('cart-total');
const addToCartBtn = document.getElementById('add-to-cart');
const cartIconBtn = document.getElementById('cart-icon-btn');
const cartBadge = document.getElementById('cart-badge');
const cartDropdown = document.getElementById('cart-dropdown');
const cartDropdownItems = document.getElementById('cart-dropdown-items');
const cartDropdownEmpty = document.getElementById('cart-dropdown-empty');
const cartDropdownFooter = document.getElementById('cart-dropdown-footer');
const cartDropdownTotal = document.getElementById('cart-dropdown-total');
const cartCloseBtn = document.getElementById('cart-close-btn');
const cartCheckoutBtn = document.getElementById('cart-checkout-btn');

// Estado del carrito: array de { id, name, qty, price }
let cartItems = JSON.parse(localStorage.getItem('empower-cart') || '[]');

function saveCart() {
  localStorage.setItem('empower-cart', JSON.stringify(cartItems));
}

function getTotalItems() {
  return cartItems.reduce((sum, item) => sum + item.qty, 0);
}

function getTotalPrice() {
  return cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
}

function updateBadge() {
  const total = getTotalItems();
  cartBadge.textContent = total;
  cartBadge.classList.toggle('has-items', total > 0);
}

function updateHeroTotal() {
  const quantity = parseInt(quantityInput.value) || 1;
  const total = TICKET_PRICE * quantity;
  cartTotal.textContent = `${total}€`;
}

function renderCartDropdown() {
  cartDropdownItems.innerHTML = '';
  if (cartItems.length === 0) {
    cartDropdownEmpty.classList.add('is-visible');
    cartDropdownFooter.classList.remove('is-visible');
    return;
  }
  cartDropdownEmpty.classList.remove('is-visible');
  cartDropdownFooter.classList.add('is-visible');

  cartItems.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'cart-dropdown-item';
    div.dataset.index = index;
    const minusBtn = item.qty > 1
      ? `<button type="button" class="cart-dropdown-item-minus" data-index="${index}" aria-label="Quitar 1 entrada">−</button>`
      : '';
    div.innerHTML = `
      <div class="cart-dropdown-item-info">
        <div class="cart-dropdown-item-name">${item.name}</div>
        <div class="cart-dropdown-item-qty-row">
          ${minusBtn}
          <span class="cart-dropdown-item-qty">${item.qty} entrada(s)</span>
        </div>
      </div>
      <span class="cart-dropdown-item-price">${item.qty * item.price}€</span>
      <button type="button" class="cart-dropdown-item-remove" data-index="${index}" aria-label="Eliminar todo">×</button>
    `;
    cartDropdownItems.appendChild(div);
  });

  cartDropdownTotal.textContent = `${getTotalPrice()}€`;

  // Evento para quitar 1 unidad
  cartDropdownItems.querySelectorAll('.cart-dropdown-item-minus').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(e.currentTarget.dataset.index);
      decreaseItemQty(index);
    });
  });
  // Evento para eliminar todo el ítem
  cartDropdownItems.querySelectorAll('.cart-dropdown-item-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const index = parseInt(e.currentTarget.dataset.index);
      removeFromCart(index);
    });
  });
}

function decreaseItemQty(index) {
  const item = cartItems[index];
  if (!item || item.qty <= 1) return;
  item.qty -= 1;
  if (item.qty === 0) {
    cartItems.splice(index, 1);
  }
  saveCart();
  updateBadge();
  renderCartDropdown();
}

function removeFromCart(index) {
  cartItems.splice(index, 1);
  saveCart();
  updateBadge();
  renderCartDropdown();
}

function toggleCartDropdown() {
  const isOpen = cartDropdown.classList.toggle('is-open');
  cartIconBtn.setAttribute('aria-expanded', isOpen);
  if (isOpen) {
    renderCartDropdown();
  }
}

function closeCartDropdown() {
  cartDropdown.classList.remove('is-open');
  cartIconBtn.setAttribute('aria-expanded', 'false');
}

// Añadir al carrito
if (addToCartBtn) {
  addToCartBtn.addEventListener('click', () => {
    const quantity = parseInt(quantityInput.value) || 1;
    if (quantity < 1) return;

    const existing = cartItems.find(item => item.id === 'preinscripcion');
    if (existing) {
      existing.qty += quantity;
    } else {
      cartItems.push({
        id: 'preinscripcion',
        name: 'Preinscripción Empower Beauty 2026',
        qty: quantity,
        price: TICKET_PRICE
      });
    }
    saveCart();
    updateBadge();
    quantityInput.value = 1;
    updateHeroTotal();
  });
}

// Selector de cantidad en hero
if (decreaseBtn && increaseBtn && quantityInput) {
  decreaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value) || 1;
    if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
      updateHeroTotal();
    }
  });

  increaseBtn.addEventListener('click', () => {
    const currentValue = parseInt(quantityInput.value) || 1;
    const maxValue = parseInt(quantityInput.max) || 10;
    if (currentValue < maxValue) {
      quantityInput.value = currentValue + 1;
      updateHeroTotal();
    }
  });

  quantityInput.addEventListener('change', () => {
    const value = parseInt(quantityInput.value) || 1;
    const min = parseInt(quantityInput.min) || 1;
    const max = parseInt(quantityInput.max) || 10;
    if (value < min) quantityInput.value = min;
    if (value > max) quantityInput.value = max;
    updateHeroTotal();
  });
}

// Icono carrito - toggle dropdown
if (cartIconBtn) {
  cartIconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCartDropdown();
  });
}

if (cartCloseBtn) {
  cartCloseBtn.addEventListener('click', closeCartDropdown);
}

// Cerrar dropdown al hacer clic fuera
document.addEventListener('click', (e) => {
  if (cartDropdown?.classList.contains('is-open') &&
      !cartDropdown.contains(e.target) &&
      !cartIconBtn?.contains(e.target)) {
    closeCartDropdown();
  }
});

// Botón Ir a pagar - preparado para Stripe
if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener('click', () => {
    if (cartItems.length === 0) return;

    // ========== STRIPE CHECKOUT ==========
    // Para conectar Stripe necesitas:
    // 1. Crear un endpoint en tu backend que cree una Checkout Session
    // 2. Stripe Checkout maneja el pago y redirige al éxito/cancelación
    //
    // Ejemplo con fetch (requiere backend):
    // fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     items: cartItems,
    //     successUrl: window.location.origin + '/gracias.html',
    //     cancelUrl: window.location.origin + '/entradas.html'
    //   })
    // }).then(r => r.json()).then(({ url }) => window.location.href = url);

    // Por ahora: enlace a email (alternativa sin backend)
    const total = getTotalPrice();
    const qty = getTotalItems();
    const subject = encodeURIComponent(`Preinscripción Empower Beauty 2026 - ${qty} entrada(s) - ${total}€`);
    window.location.href = `mailto:hello@reallygreatsite.com?subject=${subject}`;
  });
}

// Cerrar dropdown al ir a entradas
document.querySelector('.cart-dropdown-empty .btn')?.addEventListener('click', closeCartDropdown);

// Inicialización
updateBadge();
updateHeroTotal();
