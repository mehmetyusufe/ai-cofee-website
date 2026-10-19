/**
 * YUSUF CAFFEE - INTERACTIVE ENGINE
 * Cart Management, Live Status, Coffee Quiz, Filter Engine & Toasts
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCafeStatus();
  initCart();
  initMenuFilters();
  initCoffeeFinder();
  initReservation();
  initNewsletter();
  initScrollReveal();
  initStatsCounter();
  initSteamEffect();
  initButtonRipples();
});

/* ===================================================================
   1. NAVBAR & MOBILE MENU
   =================================================================== */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const menuToggle = document.querySelector('.menu-toggle-btn');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-active');
      const isOpen = navLinks.classList.contains('mobile-active');
      menuToggle.innerHTML = isOpen 
        ? '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>'
        : '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('mobile-active');
        menuToggle.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      });
    });
  }
}

/* ===================================================================
   2. LIVE CAFE STATUS (REAL-TIME OPEN / CLOSED CLOCK)
   =================================================================== */
function initCafeStatus() {
  const statusBadge = document.getElementById('liveCafeStatus');
  if (!statusBadge) return;

  const now = new Date();
  const hours = now.getHours();
  // Open 08:00 - 23:00
  const isOpen = hours >= 8 && hours < 23;

  if (isOpen) {
    statusBadge.innerHTML = `<span class="status-dot"></span><span>Şu an Açık (23:00'a kadar)</span>`;
    statusBadge.style.borderColor = 'rgba(56, 161, 105, 0.4)';
    statusBadge.style.color = '#68d391';
  } else {
    statusBadge.innerHTML = `<span class="status-dot" style="background:#e53e3e;box-shadow:0 0 8px #e53e3e"></span><span>Şu an Kapalı (08:00'de açılır)</span>`;
    statusBadge.style.borderColor = 'rgba(229, 62, 62, 0.4)';
    statusBadge.style.color = '#fc8181';
  }
}

/* ===================================================================
   3. SHOPPING CART ENGINE
   =================================================================== */
let cart = JSON.parse(localStorage.getItem('yusuf_caffee_cart')) || [];

function initCart() {
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartOverlay = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  function openCart() {
    cartDrawer?.classList.add('open');
    cartOverlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartDrawer?.classList.remove('open');
    cartOverlay?.classList.remove('open');
    document.body.style.overflow = '';
  }

  cartToggleBtn?.addEventListener('click', openCart);
  closeCartBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);

  // Bind all "Add to cart" buttons
  document.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('.menu-card') || e.target.closest('[data-item-name]');
      if (!card) return;

      const item = {
        id: card.dataset.itemId || 'item-' + Math.random().toString(36).substr(2, 9),
        name: card.dataset.itemName || card.querySelector('.menu-item-title')?.innerText || 'Özel Kahve',
        price: parseFloat(card.dataset.itemPrice || 140),
        img: card.dataset.itemImg || card.querySelector('img')?.src || 'assets/images/hero-coffee.jpg',
        quantity: 1
      };

      addToCart(item);
      showToast(`${item.name} sepete eklendi!`);
    });
  });

  checkoutBtn?.addEventListener('click', () => {
    if (cart.length === 0) {
      showToast('Sepetiniz şu anda boş.');
      return;
    }
    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    alert(`🎉 Siparişiniz Alındı!\nToplam: ₺${total.toFixed(2)}\nSipariş Numaranız: #YUSUF-${Math.floor(100000 + Math.random() * 900000)}\nBaristalarımız siparişinizi hazırlamaya başladı!`);
    cart = [];
    saveCart();
    renderCart();
    closeCart();
  });

  renderCart();
}

function addToCart(item) {
  const existing = cart.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(item);
  }
  saveCart();
  renderCart();

  const cartBadge = document.getElementById('cartBadge');
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  if (cartBadge) {
    cartBadge.classList.remove('pop-animate');
    void cartBadge.offsetWidth;
    cartBadge.classList.add('pop-animate');
  }
  if (cartToggleBtn) {
    cartToggleBtn.style.transform = 'scale(1.18)';
    setTimeout(() => { cartToggleBtn.style.transform = ''; }, 220);
  }
}

function updateCartQuantity(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  renderCart();
}

function saveCart() {
  localStorage.setItem('yusuf_caffee_cart', JSON.stringify(cart));
}

function renderCart() {
  const cartBody = document.getElementById('cartItemsList');
  const cartBadge = document.getElementById('cartBadge');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  if (cartBadge) {
    cartBadge.textContent = totalCount;
    cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
  }

  if (subtotalEl) subtotalEl.textContent = `₺${totalPrice.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `₺${totalPrice.toFixed(2)}`;

  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="empty-cart-state">
        <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
          <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p>Sepetiniz henüz boş.<br>Özel kahvelerimizi keşfetmeye başlayın!</p>
      </div>
    `;
    return;
  }

  cartBody.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" class="cart-item-img">
      <div class="cart-item-info">
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-price">₺${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="cart-item-qty">
        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">-</button>
        <span style="font-weight:600; font-size:0.9rem; min-width: 16px; text-align: center;">${item.quantity}</span>
        <button class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
      </div>
    </div>
  `).join('');
}

// Expose to window for inline onclicks
window.updateCartQuantity = updateCartQuantity;

/* ===================================================================
   4. MENU CATEGORY FILTER
   =================================================================== */
function initMenuFilters() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const cards = document.querySelectorAll('.menu-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const category = card.dataset.category;
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ===================================================================
   5. INTERACTIVE COFFEE FLAVOR FINDER (QUIZ)
   =================================================================== */
function initCoffeeFinder() {
  const quizForm = document.getElementById('coffeeQuizForm');
  const resultBox = document.getElementById('quizResultBox');
  const resultTitle = document.getElementById('quizResultTitle');
  const resultDesc = document.getElementById('quizResultDesc');
  const resultAddBtn = document.getElementById('quizAddBtn');

  if (!quizForm || !resultBox) return;

  const coffeeProfiles = {
    'intense-bold': {
      id: 'espresso-doppio',
      name: 'Double Origin Espresso',
      price: 110,
      desc: 'Güçlü gövde, bitter çikolata ve fındık notaları. Yoğun ve keskin bir kahve deneyimi arayanlar için.',
      img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=600&q=80'
    },
    'intense-mild': {
      id: 'cortado-yusuf',
      name: 'Artisan Cortado',
      price: 135,
      desc: 'İpeksi süt köpüğü ile dengelenmiş, karamel ve kakao dengesi yüksek asil İspanyol tarifi.',
      img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80'
    },
    'fruity-filter': {
      id: 'ethiopia-v60',
      name: 'Etiyopya Yirgacheffe V60',
      price: 165,
      desc: 'Çiçeksi yasemin, bergamot ve yaban mersini notaları ile berrak, meyvemsi ve canlı pour over lezzeti.',
      img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
    },
    'cold-refreshing': {
      id: 'yusuf-cold-brew',
      name: '18-Saat Nitro Cold Brew',
      price: 155,
      desc: '18 saat soğuk demlenen, asiditesi kırılmış, kadifemsi kreması ve doğal tatlılığıyla ferahlatıcı.',
      img: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80'
    }
  };

  quizForm.addEventListener('change', () => {
    const preference = quizForm.elements['preference']?.value;
    const body = quizForm.elements['body']?.value;

    let selectedKey = 'intense-bold';
    if (preference === 'cold') {
      selectedKey = 'cold-refreshing';
    } else if (body === 'fruity') {
      selectedKey = 'fruity-filter';
    } else if (preference === 'milk') {
      selectedKey = 'intense-mild';
    }

    const coffee = coffeeProfiles[selectedKey];
    resultTitle.textContent = coffee.name;
    resultDesc.textContent = coffee.desc;
    resultBox.classList.add('active');

    if (resultAddBtn) {
      resultAddBtn.onclick = () => {
        addToCart({
          id: coffee.id,
          name: coffee.name,
          price: coffee.price,
          img: coffee.img,
          quantity: 1
        });
        showToast(`${coffee.name} sepete eklendi!`);
      };
    }
  });
}

/* ===================================================================
   6. TABLE RESERVATION FORM
   =================================================================== */
function initReservation() {
  const form = document.getElementById('reservationForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.elements['name'].value;
    const date = form.elements['date'].value;
    const time = form.elements['time'].value;
    const guests = form.elements['guests'].value;

    if (!name || !date || !time) {
      showToast('Lütfen rezervasyon alanlarını doldurunuz.');
      return;
    }

    alert(`✨ Rezervasyonunuz Onaylandı!\nSayın ${name},\n${date} tarihinde saat ${time} için ${guests} kişilik masanız ayrılmıştır.\nRezervasyon Kodunuz: #REZ-${Math.floor(1000 + Math.random() * 9000)}`);
    form.reset();
  });
}

/* ===================================================================
   7. NEWSLETTER SUBSCRIPTION
   =================================================================== */
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (input && input.value) {
      showToast('☕ Yusuf Caffee Kahve Kulübüne Hoş Geldiniz! İlk kahvenizde %15 indirim kodunuz iletildi.');
      input.value = '';
    }
  });
}

/* ===================================================================
   8. TOAST NOTIFICATIONS
   =================================================================== */
function showToast(message) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="toast-icon">
      <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

/* ===================================================================
   9. SCROLL REVEAL & INTERSECTION OBSERVER ANIMATIONS
   =================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal, .reveal-fade');
  if (reveals.length === 0) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}

/* ===================================================================
   10. ANIMATED STATS NUMBER COUNTERS
   =================================================================== */
function initStatsCounter() {
  const statItems = document.querySelectorAll('.stat-item h3');
  if (statItems.length === 0) return;

  let animated = false;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        animateStatNumbers();
        obs.disconnect();
      }
    });
  }, { threshold: 0.5 });

  const statsContainer = document.querySelector('.hero-stats');
  if (statsContainer) observer.observe(statsContainer);
}

function animateStatNumbers() {
  const statItems = document.querySelectorAll('.stat-item h3');
  statItems.forEach((item, index) => {
    const rawText = item.innerText.trim();
    if (rawText.includes('%')) {
      animateCounter(item, 0, 100, 1400, '%', '%');
    } else if (rawText.includes('+')) {
      animateCounter(item, 0, 18, 1200, '', '+');
    } else if (rawText.includes('★')) {
      animateDecimalCounter(item, 0.0, 4.9, 1300, '★');
    }
  });
}

function animateCounter(element, start, end, duration, prefix = '', suffix = '') {
  let startTime = null;
  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.floor(start + (end - start) * ease);
    element.innerText = `${prefix}${current}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
}

function animateDecimalCounter(element, start, end, duration, suffix = '') {
  let startTime = null;
  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = (start + (end - start) * ease).toFixed(1);
    element.innerText = `${current}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  }
  window.requestAnimationFrame(step);
}

/* ===================================================================
   11. REALISTIC COFFEE STEAM EFFECT INJECTOR
   =================================================================== */
function initSteamEffect() {
  const heroCard = document.querySelector('.hero-image-card');
  if (!heroCard || heroCard.querySelector('.steam-container')) return;

  const steam = document.createElement('div');
  steam.className = 'steam-container';
  steam.innerHTML = `
    <div class="steam-wisp"></div>
    <div class="steam-wisp"></div>
    <div class="steam-wisp"></div>
    <div class="steam-wisp"></div>
  `;
  heroCard.appendChild(steam);
}

/* ===================================================================
   12. BUTTON CLICK RIPPLE EFFECT
   =================================================================== */
function initButtonRipples() {
  document.querySelectorAll('.btn, .tab-btn').forEach(button => {
    button.addEventListener('click', function(e) {
      const circle = document.createElement('span');
      const diameter = Math.max(this.clientWidth, this.clientHeight);
      const radius = diameter / 2;
      const rect = this.getBoundingClientRect();

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.style.position = 'absolute';
      circle.style.borderRadius = '50%';
      circle.style.background = 'rgba(255, 255, 255, 0.25)';
      circle.style.transform = 'scale(0)';
      circle.style.animation = 'ripple 0.55s linear';
      circle.style.pointerEvents = 'none';

      const existingRipple = this.querySelector('.ripple-effect');
      if (existingRipple) existingRipple.remove();

      circle.className = 'ripple-effect';
      this.appendChild(circle);

      setTimeout(() => circle.remove(), 550);
    });
  });
}
