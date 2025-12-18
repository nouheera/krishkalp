console.log("Welcome to Krishkalp Traders!");

// Fade-in animation
const faders = document.querySelectorAll('.fade-in');
function checkFade() {
  const triggerBottom = window.innerHeight * 0.85;
  faders.forEach(el => {
    const top = el.getBoundingClientRect().top;
    if (top < triggerBottom) el.classList.add('show');
  });
}
window.addEventListener('scroll', checkFade);
checkFade();

// Reveal-on-scroll
function revealOnScroll() {
  const reveals = document.querySelectorAll('.reveal');
  for (let r of reveals) {
    const windowHeight = window.innerHeight;
    const elementTop = r.getBoundingClientRect().top;
    const revealPoint = 80;
    if (elementTop < windowHeight - revealPoint) {
      r.classList.add('active');
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    let linkPage = link.getAttribute("href");
    if (linkPage === currentPage) link.classList.add("active");
  });
});

window.addEventListener('scroll', revealOnScroll);
revealOnScroll();

// GLOBAL PRODUCTS
let products = [];

// Fetch products from backend ONCE
async function fetchProducts() {
  try {
    const res = await fetch(
      "https://krishkalp-backend.onrender.com/api/products"
    );
    products = await res.json();
    console.log("Loaded products from DB:", products);

    const list = document.getElementById("product-list");
    if (list) loadProducts();
  } catch (err) {
    console.error("Failed to load products:", err);
  }
}

fetchProducts();

fetchProducts();

// Product page: search by pressing Enter
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && document.activeElement.id === "productSearch") {
    loadProducts();
  }
});

// RENDER PRODUCTS
async function loadProducts() {
  const list = document.getElementById("product-list");
  const search = document.getElementById("productSearch")?.value.toLowerCase() || "";
  if (!list) return;

  list.innerHTML = "";

  products
    .filter(p => p.name.toLowerCase().includes(search))
    .forEach(product => {
      list.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card shadow product-card">
            <img src="${product.image}" class="product-img card-img-top" alt="${product.name}">
            <div class="card-body text-center">
              <h5>${product.name}</h5>

              <div class="mb-2">
                <select class="form-select form-select-sm unit-select"
                        data-product-id="${product._id}">
                  ${product.units.map(u =>
        `<option value="${u.key}" data-price="${u.price}">
            ${u.label} — ₹${u.price}
         </option>`
      ).join("")}
                </select>
              </div>

              <div class="mb-2">
                <span class="stock-label" id="stock-${product._id}"></span>
              </div>

              <div class="d-flex justify-content-center align-items-center mb-2">
                <input type="number" min="1" value="1"
                  class="form-control form-control-sm me-2 qty-input"
                  style="width:80px"
                  data-product-id="${product._id}">
                <button class="btn btn-warning" onclick="addToCart('${product._id}')">
                  Add to Cart
                </button>
              </div>

            </div>
          </div>
        </div>
      `;

      // STOCK DISPLAY
      const stockEl = document.getElementById(`stock-${product._id}`);
      if (product.stock > 20) {
        stockEl.innerHTML = `<span style="color: green; font-weight:bold;">🟢 In stock (${product.stock})</span>`;
      } else if (product.stock > 0) {
        stockEl.innerHTML = `<span style="color: orange; font-weight:bold;">🟠 Low stock (${product.stock})</span>`;
      } else {
        stockEl.innerHTML = `<span style="color: red; font-weight:bold;">🔴 Out of stock</span>`;
      }
    });
}

// CART LOGIC
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function addToCart(id) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const product = products.find(p => p._id === id);
  if (!product) return;

  if (product.stock <= 0) {
    alert("This item is OUT OF STOCK!");
    return;
  }

  const unitSelect = document.querySelector(`.unit-select[data-product-id="${id}"]`);
  const qtyInput = document.querySelector(`.qty-input[data-product-id="${id}"]`);

  const unitKey = unitSelect.value;
  const unitLabel = unitSelect.selectedOptions[0].textContent.split(" — ")[0];
  const unitPrice = Number(unitSelect.selectedOptions[0].dataset.price);
  const qty = Number(qtyInput.value);

  let existing = cart.find(
    (item) => item._id === id && item.unitKey === unitKey
  );

  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      _id: product._id,
      name: product.name,
      image: product.image,
      unitKey,
      unitLabel,
      unitPrice,
      qty
    });
  }

  // Update product stock
  product.stock -= qty;

  // Update UI
  const stockEl = document.getElementById(`stock-${product._id}`);
  if (product.stock > 20) {
    stockEl.innerHTML = `<span style="color: green; font-weight:bold;">🟢 In stock (${product.stock})</span>`;
  } else if (product.stock > 0) {
    stockEl.innerHTML = `<span style="color: orange; font-weight:bold;">🟠 Low stock (${product.stock})</span>`;
  } else {
    stockEl.innerHTML = `<span style="color: red; font-weight:bold;">🔴 Out of stock</span>`;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  showToast(product.name + " added to cart!");
}

// LOAD CART PAGE
function loadCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartDiv = document.getElementById("cart-items");
  const totalSpan = document.getElementById("total");
  if (!cartDiv) return;

  if (cart.length === 0) {
    cartDiv.innerHTML = `<h5 class="text-center text-muted">Your cart is empty.</h5>`;
    totalSpan.innerText = "0";
    return;
  }

  cartDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.unitPrice * item.qty;
    total += itemTotal;

    cartDiv.innerHTML += `
      <div class="card mb-3 p-3 shadow-sm">
        <div class="row align-items-center">
        
          <div class="col-md-2">
            <img src="${item.image}" class="img-fluid rounded">
          </div>

          <div class="col-md-4">
            <h5>${item.name}</h5>
            <p class="text-muted">${item.unitLabel} — ₹${item.unitPrice}</p>
            <p class="fw-bold">Total: ₹${itemTotal}</p>
          </div>

          <div class="col-md-4 d-flex align-items-center">
            <button class="btn btn-secondary btn-sm" onclick="decreaseQty(${index})">−</button>
            <span class="mx-2 fw-bold">${item.qty}</span>
            <button class="btn btn-secondary btn-sm" onclick="increaseQty(${index})">+</button>
          </div>

          <div class="col-md-2 text-end">
            <button class="btn btn-danger" onclick="removeItem(${index})">Remove</button>
          </div>

        </div>
      </div>
    `;
  });

  totalSpan.innerText = total;
}


// CHECKOUT PAGE
function loadCheckout() {
  if (!window.location.pathname.includes("checkout.html")) return;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const summaryDiv = document.getElementById("summary");
  const totalSpan = document.getElementById("checkoutTotal");

  if (cart.length === 0) {
    summaryDiv.innerHTML = "<p class='text-muted'>Your cart is empty.</p>";
    totalSpan.innerText = "₹0";
    return;
  }

  let total = 0;
  summaryDiv.innerHTML = "";

  cart.forEach(item => {
    const itemTotal = item.unitPrice * item.qty;
    total += itemTotal;

    summaryDiv.innerHTML += `
      <div class="d-flex justify-content-between mb-2">
        <span>${item.name} (${item.unitLabel}) x${item.qty}</span>
        <span>₹${itemTotal}</span>
      </div>
    `;
  });

  totalSpan.innerText = "₹" + total;
}

loadCheckout();

function increaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].qty += 1;

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Decrease quantity
function decreaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1); // remove item
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}

// Remove item completely
function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart.splice(index, 1); // delete item

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}
function placeOrder() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (!name || !phone || !address || !city || !pincode) {
    alert("Please fill all fields.");
    return;
  }

  const orderId = "ORD-" + Date.now();

  const itemsFormatted = cart
    .map(item => `• ${item.name} (${item.unitLabel}) x${item.qty}`)
    .join("%0A");

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const orderData = {
    id: orderId,
    name,
    phone,
    address: `${address}, ${city} - ${pincode}`,
    items: cart.map(item => ({
      productId: item._id,
      name: item.name,
      unit: item.unitLabel,
      qty: item.qty,
      price: item.unitPrice,
      total: item.unitPrice * item.qty
    })),
    total: totalAmount,
    date: new Date().toLocaleDateString(),
    status: "Pending"
  };

  console.log("Sending order:", orderData);

  // 1️⃣ SAVE ORDER TO BACKEND
  fetch("https://krishkalp-backend.onrender.com/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  })
    .then(res => res.json())
    .then(() => {

      // 2️⃣ CREATE BEAUTIFUL WHATSAPP MESSAGE
const message =
  `🛍️ *New Order Received!*%0A` +
  `──────────────────────────%0A` +
  `🆔 *Order ID:* ${orderId}%0A%0A` +
  `👤 *Customer:* ${name}%0A` +
  `📞 *Phone:* ${phone}%0A` +
  `🏠 *Address:* ${address}, ${city} - ${pincode}%0A%0A` +
  `📦 *Items Ordered:*%0A` +
  `${itemsFormatted}%0A%0A` +
  `💰 *Total Amount:* ₹${totalAmount}%0A` +
  `📅 *Date:* ${new Date().toLocaleDateString()}%0A` +
  `──────────────────────────`;


      // 3️⃣ SHOP OWNER NUMBER (CHANGE IF YOU WANT)
      const ownerPhone = "919901188531";

      // 4️⃣ OPEN WHATSAPP MESSAGE
      const whatsappURL = `https://wa.me/${ownerPhone}?text=${message}`;
      window.open(whatsappURL, "_blank");

      // 5️⃣ CLEAR CART & REDIRECT
      localStorage.removeItem("cart");
      alert("Order placed successfully!");
      window.location.href = "index.html";
    })
    .catch(err => {
      console.error("Order error:", err);
      alert("Failed to place order. Try again.");
    });
}



// TOAST
function showToast(msg) {
  const toastEl = document.getElementById("cartToast");
  if (!toastEl) return;
  toastEl.querySelector(".toast-body").innerText = msg;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

/* ===========================================================
   ADMIN DASHBOARD FUNCTIONS
   =========================================================== */

// Load Orders in Admin Panel
function loadAdminOrders() {
  if (!window.location.pathname.includes("admin.html")) return;

  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = "admin-login.html";
    return;
  }

  fetch("https://krishkalp-backend.onrender.com/api/orders", {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => {
      if (res.status === 401) throw new Error("Unauthorized");
      return res.json();
    })
    .then(orders => {
      const tableBody = document.getElementById("admin-orders");
      tableBody.innerHTML = "";

      if (!orders || orders.length === 0) {
        tableBody.innerHTML =
          `<tr><td colspan="9" class="text-center text-muted">No orders yet.</td></tr>`;
        return;
      }

      orders.forEach(order => {
        const itemsList = order.items
          .map(i => `${i.name} (${i.unit}) x${i.qty}`)
          .join(", ");

        tableBody.innerHTML += `
          <tr>
            <td>${order.id}</td>
            <td>${order.name}</td>
            <td>${order.phone}</td>
            <td>${order.address}</td>
            <td>${itemsList}</td>
            <td>₹${order.total}</td>
            <td>${order.date}</td>
            <td>
              <span class="badge ${order.status === "Delivered" ? "bg-success" :
                order.status === "Paid" ? "bg-primary" : "bg-warning text-dark"}">
                ${order.status}
              </span>
            </td>
            <td>
              <button class="btn btn-sm btn-success" onclick="markDelivered('${order.id}')">Delivered</button>
              <button class="btn btn-sm btn-primary" onclick="markPaid('${order.id}')">Paid</button>
              <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order.id}')">Delete</button>
            </td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      localStorage.removeItem("adminToken");
      window.location.href = "admin-login.html";
    });
}

loadAdminOrders();


// Update to Delivered
function markDelivered(orderId) {
  const token = localStorage.getItem("adminToken");

  fetch(`https://krishkalp-backend.onrender.com/api/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status: "Delivered" })
  })
    .then(res => res.json())
    .then(() => loadAdminOrders());
}

// Update to Paid
function markPaid(orderId) {
  const token = localStorage.getItem("adminToken");

  fetch(`https://krishkalp-backend.onrender.com/api/orders/${orderId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token
    },
    body: JSON.stringify({ status: "Paid" })
  })
    .then(res => res.json())
    .then(() => loadAdminOrders());
}

// Delete Order
function deleteOrder(orderId) {
  if (!confirm("Delete this order?")) return;

  const token = localStorage.getItem("adminToken");

  fetch(`https://krishkalp-backend.onrender.com/api/orders/${orderId}`, {
    method: "DELETE",
    headers: { "Authorization": "Bearer " + token }
  })
    .then(res => res.json())
    .then(() => loadAdminOrders());
}
document.addEventListener("DOMContentLoaded", () => {
  const cartContainer = document.getElementById("cart-items");
  if (cartContainer) {
    loadCart();
  }
});
