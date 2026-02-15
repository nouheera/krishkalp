console.log("script.js loaded");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

console.log("Welcome to Krishkalp Traders!");


// ================= ENTRY ANIMATION =================

const grainContainer = document.getElementById("grainContainer");

function fillWithGrains() {
  if (!grainContainer) return; // ✅ PREVENT CRASH

  const grainCount = Math.floor(
    (window.innerWidth * window.innerHeight) / 15000
  );

  for (let i = 0; i < grainCount; i++) {
    const grain = document.createElement("div");
    grain.className = "grain";

    grain.style.left = Math.random() * window.innerWidth + "px";
    grain.style.top = Math.random() * window.innerHeight + "px";

    grainContainer.appendChild(grain);
  }
}

// run ONLY if container exists
if (grainContainer) {
  fillWithGrains();
}



document.addEventListener("DOMContentLoaded", () => {
  let currentPage = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    let linkPage = link.getAttribute("href");
    if (linkPage === currentPage) link.classList.add("active");
  });
});


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



// Product page: search by pressing Enter
document.addEventListener("keypress", function (e) {
  if (e.key === "Enter" && document.activeElement.id === "productSearch") {
    loadProducts();
  }
});

function loadProducts() {
  const list = document.getElementById("product-list");
  if (!list) return;

  list.innerHTML = "";

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  products
    .filter(p => (category ? p.category === category : true))
    .forEach(product => {

      let priceHtml = "";

      if (product.units && product.units.length > 0) {
        priceHtml = `
          <select class="form-select mb-2" id="unit-${product._id}">
            ${product.units.map(unit => `
              <option 
                value="${unit.key}" 
                data-price="${unit.price}" 
                data-label="${unit.label}">
                ${unit.label} – ₹${unit.price}
              </option>
            `).join("")}
          </select>
        `;
      }

      list.innerHTML += `
        <div class="col-md-4 mb-4">
          <div class="card product-card shadow">
            <img src="${product.image}" class="product-img">
            <div class="card-body text-center">
              <h5 class="fw-bold">${product.name}</h5>
              ${priceHtml}
              <button class="btn btn-warning mt-2" 
                onclick="addToCart('${product._id}')">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    });
}

function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);

  const badge = document.getElementById("cartCount");
  if (badge) badge.innerText = count;
}


function addToCart(id) {
  const product = products.find(p => p._id === id);
  if (!product) return;

  const select = document.getElementById(`unit-${id}`);
  if (!select) return;

  const selectedOption = select.options[select.selectedIndex];

  const unitPrice = Number(selectedOption.dataset.price);
  const unitLabel = selectedOption.dataset.label;

  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const existing = cart.find(item =>
    item.id === id && item.unitLabel === unitLabel
  );

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: id,
      name: product.name,
      image: product.image,
      qty: 1,
      unitPrice: unitPrice,
      unitLabel: unitLabel
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  updateCartCount();
  updateMobileCartCount();   // 🔥 important
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
        .map(i => `${i.name} (${i.unitLabel}) x${i.qty}`)
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
      generateAnalytics(orders);

    })
    .catch(err => {
      console.error(err);
      localStorage.removeItem("adminToken");
      updateCartCount();
      updateMobileCartCount();

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

  // CART PAGE
  if (document.getElementById("cart-items")) {
    loadCart();
  }

  // CHECKOUT PAGE
 if (document.getElementById("checkoutTotal")) {
  loadCheckout();
}

});

function goToCart() {
  window.location.href = "cart.html";
}

function updateMobileCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const count = cart.reduce((sum, item) => sum + item.qty, 0);


  const countSpan = document.getElementById("mobile-cart-count");
  if (countSpan) {
    countSpan.innerText = count;
  }
}


// Update count on page load
document.addEventListener("DOMContentLoaded", updateMobileCartCount);

function enterApp() {
  const intro = document.getElementById("introScreen");
  const app = document.getElementById("appContent");

  if (!intro || !app) return; // ✅ prevent crash

  sessionStorage.setItem("enteredApp", "yes");

  intro.style.transition = "opacity 0.6s ease";
  intro.style.opacity = "0";

  setTimeout(() => {
    intro.style.display = "none";
    app.style.display = "block";
  }, 600);
}

window.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introScreen");
  const app = document.getElementById("appContent");

  if (!intro || !app) return; // ✅ prevent crash

  if (sessionStorage.getItem("enteredApp") === "yes") {
    intro.style.display = "none";
    app.style.display = "block";
  }
});

function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const totalEl = document.getElementById("total");

  if (!container) return;

  container.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="text-center text-muted">
        <h5>Your cart is empty 🛒</h5>
      </div>
    `;
    if (totalEl) totalEl.innerText = 0;
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.unitPrice * item.qty;
    total += itemTotal;

    container.innerHTML += `
      <div class="card mb-3 p-3 shadow-sm">
        <div class="d-flex justify-content-between align-items-center">
          
          <div>
            <h5 class="fw-bold">${item.name}</h5>
            <p class="mb-1 text-muted">${item.unitLabel}</p>
            <p class="mb-1">Price: ₹${item.unitPrice}</p>
          </div>

          <div class="text-end">
            <div class="d-flex align-items-center mb-2">
              <button class="btn btn-sm btn-outline-secondary me-2"
                onclick="decreaseQty(${index})">−</button>

              <span class="fw-bold">${item.qty}</span>

              <button class="btn btn-sm btn-outline-secondary ms-2"
                onclick="increaseQty(${index})">+</button>
            </div>

            <p class="fw-bold">₹${itemTotal}</p>

            <button class="btn btn-sm btn-danger mt-2"
              onclick="removeItem(${index})">
              Remove
            </button>
          </div>

        </div>
      </div>
    `;
  });

  if (totalEl) totalEl.innerText = total;
}
function increaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].qty += 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function decreaseQty(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  
  if (cart[index].qty > 1) {
    cart[index].qty -= 1;
  } else {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}

function removeItem(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
  updateCartCount();
}
// Run page-specific functions
document.addEventListener("DOMContentLoaded", () => {

  if (document.getElementById("cart-items")) {
    loadCart();
  }

});
function loadCheckout() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const summary = document.getElementById("summary");
  const totalEl = document.getElementById("checkoutTotal");

  if (!summary) return;

  summary.innerHTML = "";
  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.unitPrice * item.qty;
    total += itemTotal;

    summary.innerHTML += `
      <div class="d-flex justify-content-between mb-2">
        <span>${item.name} (${item.unitLabel}) x ${item.qty}</span>
        <span>₹${itemTotal}</span>
      </div>
    `;
  });

  if (totalEl) totalEl.innerText = total;
}
async function placeOrder() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (!name || !phone || !address || !city || !pincode) {
    alert("Please fill all details!");
    return;
  }

  if (cart.length === 0) {
    alert("Cart is empty!");
    return;
  }

  const total = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);

  const itemsText = cart.map(item =>
    `${item.name} (${item.unitLabel}) x ${item.qty}`
  ).join(", ");

  const orderData = {
    name,
    phone,
    address: address + "\n" + city + " - " + pincode,
    items: cart,
    total
  };
  

  try {
    // ✅ 1. STORE IN BACKEND
    saveCustomerDetails();

    await fetch("https://krishkalp-backend.onrender.com/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData)
    });

    // ✅ 2. OPEN WHATSAPP WITH BILL
    const message =
      `🧾 *New Order - Krishkalp Traders* \n\n` +
      `👤 Name: ${name}\n` +
      `📞 Phone: ${phone}\n` +
      `📍 Address: ${address}, ${city} - ${pincode}\n\n` +
      `🛒 Items:\n${itemsText}\n\n` +
      `💰 Total: ₹${total}\n\n` +
      `🚚 Free Delivery`;

    const whatsappURL =
      `https://wa.me/919901188531?text=${encodeURIComponent(message)}`;

    window.open(whatsappURL, "_blank");

    // Clear cart
    localStorage.removeItem("cart");

  } catch (err) {
    console.error(err);
    alert("Something went wrong!");
  }
}
function saveCustomerDetails() {
  const customer = {
    name: document.getElementById("name").value,
    phone: document.getElementById("phone").value,
    address: document.getElementById("address").value,
    city: document.getElementById("city").value,
    pincode: document.getElementById("pincode").value
  };

  localStorage.setItem("customerDetails", JSON.stringify(customer));
}

function loadCustomerDetails() {
  const saved = JSON.parse(localStorage.getItem("customerDetails"));
  if (!saved) return;

  document.getElementById("name").value = saved.name || "";
  document.getElementById("phone").value = saved.phone || "";
  document.getElementById("address").value = saved.address || "";
  document.getElementById("city").value = saved.city || "";
  document.getElementById("pincode").value = saved.pincode || "";
}

function generateAnalytics(orders) {
  if (!orders || orders.length === 0) return;

  const customerMap = {};
  const revenueMap = {};

  orders.forEach(order => {
    revenueMap[order.date] =
      (revenueMap[order.date] || 0) + order.total;

    customerMap[order.name] =
      (customerMap[order.name] || 0) + order.total;
  });

  if (window.revenueChartInstance) {
    window.revenueChartInstance.destroy();
  }

  if (window.customerChartInstance) {
    window.customerChartInstance.destroy();
  }

  window.revenueChartInstance = new Chart(
    document.getElementById("revenueChart"),
    {
      type: "line",
      data: {
        labels: Object.keys(revenueMap),
        datasets: [{
          label: "Revenue",
          data: Object.values(revenueMap)
        }]
      }
    }
  );

  window.customerChartInstance = new Chart(
    document.getElementById("productChart"),
    {
      type: "bar",
      data: {
        labels: Object.keys(customerMap),
        datasets: [{
          label: "Customer Spending",
          data: Object.values(customerMap)
        }]
      }
    }
  );
}

