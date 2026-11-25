"use strict";
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  main = $("#main"),
  page = document.body.dataset.page,
  query = new URLSearchParams(location.search);
const cats = [
  "Electronics",
  "Men's Fashion",
  "Women's Fashion",
  "Footwear",
  "Watches",
  "Beauty Products",
  "Home and Living",
  "Accessories",
];
const catIcons = [
  "headphones",
  "shirt",
  "shopping-bag",
  "footprints",
  "watch",
  "sparkles",
  "armchair",
  "glasses",
];
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const enc = encodeURIComponent,
  money = (v) => "₹" + Number(v).toLocaleString("en-IN"),
  icon = (n) => '<i data-lucide="' + n + '"></i>',
  icons = () => window.lucide?.createIcons();
// Commit related cart, inventory and order changes with a single storage write.
const stateKey = "arise.store.v1";
function state() {
  return JSON.parse(localStorage.getItem(stateKey) || "{}");
}
function read(key, fallback) {
  return state()[key] ?? fallback;
}
function commit(changes) {
  localStorage.setItem(stateKey, JSON.stringify({ ...state(), ...changes }));
}
function write(key, value) {
  commit({ [key]: value });
}
let products = [],
  renderPage = () => {},
  timer;
const byId = (id) => products.find((p) => String(p.id) === String(id)),
  img = (p) => esc(p.images[0]),
  productUrl = (p) => "product.html?id=" + enc(p.id);
const logo =
  '<a class="logo" href="index.html"><img src="./assets/logo/mark.svg" alt="">ARISE <b>MART</b></a>';
function toast(t) {
  $("#toast").textContent = t;
  $("#toast").classList.add("on");
  clearTimeout(timer);
  timer = setTimeout(() => $("#toast").classList.remove("on"), 2400);
}
function modal(html) {
  $("#dialogBody").innerHTML = html;
  if (!$("#dialog").open) $("#dialog").showModal();
  icons();
}
function closeModal() {
  $("#dialog").close();
}
function ask(t, fn) {
  modal(
    "<h2>" +
      esc(t) +
      '</h2><div class="actions"><button id="yes" class="primary">Confirm</button><button id="no">Cancel</button></div>',
  );
  $("#yes").onclick = () => {
    closeModal();
    fn();
  };
  $("#no").onclick = closeModal;
}
function shell() {
  $("#header").innerHTML =
    '<div class="announce">Complimentary delivery on orders over ₹999 <span>✦</span> Enjoy 10% off with ARISE10</div><div class="nav wrap">' +
    logo +
    "<nav>" +
    [
      ["Home", "index.html"],
      ["Shop", "shop.html"],
      ["Categories", "index.html#categories"],
      ["Offers", "shop.html?edit=deals"],
    ]
      .map(
        ([n, u]) =>
          '<a class="' +
          (u === page + ".html" ? "active" : "") +
          '" href="' +
          u +
          '">' +
          n +
          "</a>",
      )
      .join("") +
    '</nav><form action="shop.html" class="search">' +
    icon("search") +
    '<input name="q" aria-label="Search products" placeholder="Search products…"></form><div class="tools">' +
    [
      ["heart", "wishlist", "Wishlist"],
      ["shopping-bag", "cart", "Shopping cart"],
      ["user-round", "profile", "Profile"],
    ]
      .map(
        ([i, u, n]) =>
          '<a aria-label="' +
          n +
          '" href="' +
          u +
          '.html">' +
          icon(i) +
          (u === "cart" ? '<small id="count"></small>' : "") +
          "</a>",
      )
      .join("") +
    "</div></div>";
  $("#bottom").innerHTML = [
    ["house", "Home", "index.html"],
    ["layout-grid", "Categories", "index.html#categories"],
    ["heart", "Wishlist", "wishlist.html"],
    ["shopping-bag", "Cart", "cart.html"],
    ["user-round", "Profile", "profile.html"],
  ]
    .map(([i, n, u]) => '<a href="' + u + '">' + icon(i) + n + "</a>")
    .join("");
  $("#footer").innerHTML =
    '<div class="wrap foot">' +
    logo +
    '<div><b>Explore</b><a href="shop.html">Shop collection</a><a href="orders.html">Track an order</a><a href="admin.html">Demo admin</a></div><div><b>Customer care</b>' +
    ["Contact", "Privacy Policy", "Terms and Conditions", "Return Policy"]
      .map((n) => '<button data-policy="' + n + '">' + n + "</button>")
      .join("") +
    '</div><div><b>Social</b><a href="https://www.instagram.com/">Instagram</a><a href="https://www.pinterest.com/">Pinterest</a><small>Platform links · demo store</small></div></div><div class="wrap copyright">© ARISE MART · College project storefront</div>';
  badges();
  icons();
}
function badges() {
  if ($("#count"))
    $("#count").textContent = read("cart", []).reduce((n, l) => n + l.qty, 0);
}
const empty = (i, h, body) =>
  '<div class="empty">' +
  icon(i) +
  "<h2>" +
  h +
  "</h2><p>" +
  body +
  '</p><a class="primary" href="shop.html">Explore the shop</a></div>';
function wishlist(id) {
  let w = read("wish", []),
    on = !w.includes(id);
  write("wish", on ? [...w, id] : w.filter((v) => v !== id));
  $$("[data-wish]")
    .filter((b) => b.dataset.wish === id)
    .forEach((b) => {
      b.classList.toggle("liked", on);
      b.setAttribute("aria-pressed", on);
    });
  if (page === "wishlist") renderPage();
  toast(on ? "Saved to your wishlist" : "Removed from wishlist");
}
document.addEventListener("click", (e) => {
  let b = e.target.closest("button");
  if (!b) return;
  if (b.classList.contains("close")) closeModal();
  if (b.dataset.wish) wishlist(b.dataset.wish);
  if (b.dataset.quick) quick(byId(b.dataset.quick));
  if (b.dataset.add) {
    let p = byId(b.dataset.add);
    if (p.sizes?.length || p.colors?.length > 1) quick(p);
    else addItem(p);
  }
  if (b.dataset.policy) {
    const msg = {
      Contact: "Demo contact: hello@arisemart.example · Chennai, India.",
      "Privacy Policy":
        "Shopping activity stays in this browser. Use fictional customer details. Clear site data to remove your saved records.",
      "Terms and Conditions":
        "This college project simulates purchases. Orders and payments are demonstrations.",
      "Return Policy":
        "Demo orders do not ship. For a simulated cancellation, change the order status in Demo admin.",
    };
    modal(
      "<h2>" + b.dataset.policy + "</h2><p>" + msg[b.dataset.policy] + "</p>",
    );
  }
});
$("#dialog").addEventListener("click", (e) => {
  if (e.target === $("#dialog")) closeModal();
});
document.addEventListener("DOMContentLoaded", async () => {
  shell();
  try {
    let saved = read("products", null);
    products =
      saved ??
      (await fetch("./data/products.json").then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      }));
    let routes = {
      index: home,
      shop: shop,
      product: detail,
      cart: cart,
      wishlist: wishes,
      checkout: checkout,
      profile: account,
      login: account,
      register: account,
      orders: orders,
      admin: window.adminPage,
      404: () =>
        (main.innerHTML = empty(
          "compass",
          "Page not found",
          "Find your way back to the collection.",
        )),
    };
    renderPage = routes[page];
    renderPage();
    icons();
    if (location.hash === "#categories") $("#categories")?.scrollIntoView();
  } catch (e) {
    main.innerHTML =
      '<section class="wrap"><h1>Store unavailable</h1><p>Open this project through GitHub Pages or a static web server, then refresh.</p></section>';
    console.error(e);
  }
});
