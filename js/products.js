const editNames = {
  trending: "Trending Products",
  bestsellers: "Best Sellers",
  new: "New Arrivals",
  deals: "Exclusive Deals",
  recommended: "Recommended Products",
};
function edited(list, edit) {
  let a = [...list];
  if (edit === "deals") a = a.filter((p) => p.discount >= 20);
  return a.sort((a, b) =>
    edit === "new"
      ? String(b.createdAt).localeCompare(String(a.createdAt))
      : edit === "deals"
        ? b.discount - a.discount
        : edit === "recommended"
          ? b.rating - a.rating
          : edit === "trending"
            ? b.rating * b.popularity - a.rating * a.popularity
            : b.popularity - a.popularity,
  );
}
function heart(p) {
  let on = read("wish", []).includes(String(p.id));
  return (
    '<button class="heart ' +
    (on ? "liked" : "") +
    '" data-wish="' +
    esc(p.id) +
    '" aria-pressed="' +
    on +
    '" aria-label="Wishlist ' +
    esc(p.name) +
    '">' +
    icon("heart") +
    "</button>"
  );
}
function card(p) {
  return (
    '<article class="card"><div class="photo"><a href="' +
    productUrl(p) +
    '"><img loading="lazy" src="' +
    img(p) +
    '" alt="' +
    esc(p.name) +
    '"></a><span class="discount">' +
    p.discount +
    "% off</span>" +
    heart(p) +
    '<button class="quick" data-quick="' +
    esc(p.id) +
    '">Quick view</button></div><div class="meta">' +
    esc(p.brand) +
    "<span>★ " +
    p.rating +
    '</span></div><h3><a href="' +
    productUrl(p) +
    '">' +
    esc(p.name) +
    '</a></h3><div class="price">' +
    money(p.price) +
    " <del>" +
    money(p.originalPrice) +
    '</del><button aria-label="Add ' +
    esc(p.name) +
    ' to cart" data-add="' +
    esc(p.id) +
    '">' +
    icon("shopping-bag") +
    "</button></div></article>"
  );
}
const sectionHead = (h, u) =>
  '<div class="sectionhead"><h2>' +
  esc(h) +
  '</h2><a href="' +
  u +
  '">View all ' +
  icon("arrow-up-right") +
  "</a></div>";
const slides = [
  [
    "The Everyday Edit",
    "Everyday essentials,",
    "exceptionally chosen.",
    "Discover considered pieces for your wardrobe, home and everything in between.",
    "Accessories",
  ],
  [
    "The Home Edit",
    "Make room for",
    "a slower day.",
    "Bring soft textures and thoughtful details into your space.",
    "Home and Living",
  ],
  [
    "The Style Edit",
    "A fresh look",
    "for every day.",
    "Find the finishing touches that make a look your own.",
    "Footwear",
  ],
];
function home() {
  main.innerHTML =
    '<div class="wrap home"><section class="hero" aria-label="Featured collections"><img id="heroimg" alt=""><div class="herocopy"><div class="eyeline"><i></i><span id="hedit"></span></div><h1 id="htitle"></h1><p id="hdesc"></p><div class="actions"><a class="primary" href="shop.html">Shop Now ' +
    icon("shopping-bag") +
    '</a><a class="outline" id="explore">Explore Collection</a></div></div><div class="heroctrl"><button aria-label="Previous banner" id="prev">' +
    icon("chevron-left") +
    '</button><span id="dots"></span><button aria-label="Next banner" id="next">' +
    icon("chevron-right") +
    '</button><button id="pause" aria-label="Pause banners">' +
    icon("pause") +
    '</button></div></section><div class="service">' +
    [
      ["truck", "Complimentary delivery", "On orders over ₹999"],
      ["rotate-ccw", "Easy returns", "Within 7 days"],
      ["shield-check", "Demo checkout", "Explore payment options"],
      ["headset", "Customer care", "Here to help"],
    ]
      .map(
        ([i, t, s]) =>
          "<div>" +
          icon(i) +
          "<span><b>" +
          t +
          "</b><small>" +
          s +
          "</small></span></div>",
      )
      .join("") +
    '</div><section id="categories">' +
    sectionHead("Shop by Category", "shop.html") +
    '<div class="categories">' +
    cats
      .map(
        (c, i) =>
          '<a href="shop.html?category=' +
          enc(c) +
          '"><div>' +
          icon(catIcons[i]) +
          "</div><b>" +
          esc(c) +
          "</b></a>",
      )
      .join("") +
    "</div></section>" +
    Object.entries(editNames)
      .map(
        ([k, n], i) =>
          (i === 2
            ? '<aside class="offer"><div><small>LIMITED-TIME OFFER</small><h2>A little extra, on us.</h2><p>Enjoy 10% off your cart with code <b>ARISE10</b>.</p></div><a class="light" href="shop.html?edit=deals">Explore deals</a></aside>'
            : "") +
          "<section>" +
          sectionHead(n, "shop.html?edit=" + k) +
          '<div class="grid">' +
          edited(products, k).slice(0, 4).map(card).join("") +
          "</div></section>",
      )
      .join("") +
    '<section><h2>Featured brands</h2><div class="brands">' +
    [...new Set(products.map((p) => p.brand))]
      .slice(0, 5)
      .map((b) => '<a href="shop.html?brand=' + enc(b) + '">' + esc(b) + "</a>")
      .join("") +
    '</div></section><section><h2>Customer notes</h2><div class="reviews"><blockquote>“The size and colour choices made it easy to find my everyday bag.”<cite>Meera · Sample testimonial</cite></blockquote><blockquote>“I saved my favourites and came back to finish my order.”<cite>Arjun · Sample testimonial</cite></blockquote></div></section><section class="newsletter"><div><h2>Letters from ARISE MART</h2><p>Seasonal edits and new arrivals.</p></div><form id="news"><input required type="email" placeholder="Email address" aria-label="Newsletter email"><button class="primary">Subscribe</button></form></section></div>';
  let i = 0,
    interval,
    paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function show(n) {
    i = (n + 3) % 3;
    let [e, a, b, d, c] = slides[i];
    $("#heroimg").src = "./assets/images/hero-" + (i + 1) + ".webp";
    $("#hedit").textContent = e;
    $("#htitle").innerHTML = a + "<br><em>" + b + "</em>";
    $("#hdesc").textContent = d;
    $("#explore").href = "shop.html?category=" + enc(c);
    $("#dots").innerHTML = slides
      .map(
        (_, j) =>
          '<button aria-label="Banner ' +
          (j + 1) +
          '" class="' +
          (i === j ? "sel" : "") +
          '" data-slide="' +
          j +
          '"></button>',
      )
      .join("");
  }
  function cycle() {
    clearInterval(interval);
    if (!paused)
      interval = setInterval(() => {
        if (!document.hidden && !$(".hero").matches(":focus-within,:hover"))
          show(i + 1);
      }, 8000);
    $("#pause").innerHTML = icon(paused ? "play" : "pause");
    $("#pause").ariaLabel = paused ? "Play banners" : "Pause banners";
    icons();
  }
  show(0);
  cycle();
  $("#prev").onclick = () => show(i - 1);
  $("#next").onclick = () => show(i + 1);
  $("#dots").onclick = (e) => {
    if (e.target.dataset.slide) show(+e.target.dataset.slide);
  };
  $("#pause").onclick = () => {
    paused = !paused;
    cycle();
  };
  $("#news").onsubmit = (e) => {
    e.preventDefault();
    write("newsletter", true);
    e.target.reset();
    toast("Demo subscription saved on this device");
  };
}
const opts = (arr, v = "") =>
  arr
    .map(
      (x) =>
        "<option " + (x === v ? "selected" : "") + ">" + esc(x) + "</option>",
    )
    .join("");
function shop() {
  main.innerHTML =
    '<div class="wrap"><p class="crumb"><a href="index.html">Home</a> / Shop</p><h1>' +
    esc(editNames[query.get("edit")] || "Shop the collection") +
    '</h1><div class="browse"><aside class="panel filters"><h3>Filters</h3><label>Search<input id="term" placeholder="Product or brand" value="' +
    esc(query.get("q")) +
    '"></label><label>Category<select id="category"><option value="">All categories</option>' +
    opts(cats, query.get("category")) +
    '</select></label><label>Brand<select id="brand"><option value="">All brands</option>' +
    opts([...new Set(products.map((p) => p.brand))], query.get("brand")) +
    '</select></label><label>Maximum price <output id="amount"></output><input id="maxprice" type="range" min="0" max="' +
    Math.max(1, ...products.map((p) => p.price)) +
    '" value="' +
    Math.max(1, ...products.map((p) => p.price)) +
    '"></label><label>Minimum rating<select id="rating"><option value="0">Any rating</option><option value="4">4 stars</option><option value="4.5">4.5 stars</option></select></label><label>Minimum discount<select id="disc"><option value="0">Any discount</option>' +
    [10, 20, 30, 40]
      .map((n) => '<option value="' + n + '">' + n + "%</option>")
      .join("") +
    '</select></label><button id="clear">Clear filters</button></aside><section><div class="toolbar"><b id="results"></b><select id="sort" aria-label="Sort products"><option value="">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="popular">Popularity</option><option value="new">Newest</option></select><button id="view" aria-label="Toggle list view">' +
    icon("list") +
    '</button></div><div class="grid catalog" id="listing"></div></section></div></div>';
  function update() {
    let t = $("#term").value.trim().toLowerCase(),
      a = edited(products, query.get("edit")).filter(
        (p) =>
          (p.name + " " + p.brand).toLowerCase().includes(t) &&
          (!$("#category").value || p.category === $("#category").value) &&
          (!$("#brand").value || p.brand === $("#brand").value) &&
          p.price <= +$("#maxprice").value &&
          p.rating >= +$("#rating").value &&
          p.discount >= +$("#disc").value,
      );
    let f = {
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      popular: (a, b) => b.popularity - a.popularity,
      new: (a, b) => String(b.createdAt).localeCompare(String(a.createdAt)),
    }[$("#sort").value];
    if (f) a.sort(f);
    $("#results").textContent = a.length + " products";
    $("#amount").textContent = money($("#maxprice").value);
    $("#listing").innerHTML =
      a.map(card).join("") || "<p>No products match these filters.</p>";
    icons();
  }
  main.oninput = update;
  $("#clear").onclick = () => location.assign("shop.html");
  $("#view").onclick = () => $("#listing").classList.toggle("list");
  update();
}
function options(p) {
  return (
    '<div class="options">' +
    [
      ["Color", p.colors],
      ["Size", p.sizes],
    ]
      .filter(([, a]) => a?.length)
      .map(
        ([n, a]) =>
          "<label>" +
          n +
          '<select name="' +
          n.toLowerCase() +
          '">' +
          opts(a) +
          "</select></label>",
      )
      .join("") +
    '<label>Quantity<input type="number" name="qty" min="1" max="' +
    p.stock +
    '" value="1" required></label></div>'
  );
}
function purchase(p) {
  return (
    '<form class="purchase"><span class="eyeline">' +
    esc(p.brand) +
    "</span><h1>" +
    esc(p.name) +
    '</h1><p class="stars">★ ' +
    p.rating +
    ' <span> / 5 · Customer rating</span></p><div class="bigprice">' +
    money(p.price) +
    " <del>" +
    money(p.originalPrice) +
    "</del> <small>" +
    p.discount +
    "% off</small></div><p>" +
    esc(p.description) +
    "</p><b>" +
    (p.stock ? p.stock + " available" : "Out of stock") +
    "</b>" +
    options(p) +
    '<div class="actions"><button class="primary" ' +
    (!p.stock ? "disabled" : "") +
    ">" +
    icon("shopping-bag") +
    ' Add to Cart</button><button name="buy" ' +
    (!p.stock ? "disabled" : "") +
    ">Buy Now</button>" +
    heart(p).replace("<button ", '<button type="button" ') +
    '</div><p class="muted">' +
    icon("truck") +
    " Estimated delivery in 4–7 days</p></form>"
  );
}
function bindPurchase(p, scope) {
  let form = scope.querySelector(".purchase");
  form.onsubmit = (e) => {
    e.preventDefault();
    let d = new FormData(form);
    if (addItem(p, d.get("color"), d.get("size"), Number(d.get("qty")))) {
      if ($("#dialog").open) closeModal();
      if (e.submitter?.name === "buy") location.href = "checkout.html";
    }
  };
}
function quick(p) {
  modal(
    '<div class="detail quickdetail"><img src="' +
      img(p) +
      '" alt="' +
      esc(p.name) +
      '"><div>' +
      purchase(p) +
      '<a class="under" href="' +
      productUrl(p) +
      '">View full details</a></div></div>',
  );
  bindPurchase(p, $("#dialog"));
}
function detail() {
  let p = byId(query.get("id"));
  if (!p) {
    main.innerHTML = empty(
      "search",
      "Product unavailable",
      "Browse the current collection.",
    );
    return;
  }
  main.innerHTML =
    '<div class="wrap"><p class="crumb"><a href="shop.html">Shop</a> / ' +
    esc(p.category) +
    '</p><div class="detail"><div><button class="zoom" aria-label="Zoom product image"><img id="large" src="' +
    img(p) +
    '" alt="' +
    esc(p.name) +
    '"></button><div class="thumbs">' +
    p.images
      .map(
        (s, i) =>
          '<button aria-label="Image ' +
          (i + 1) +
          '"><img src="' +
          esc(s) +
          '" alt=""></button>',
      )
      .join("") +
    "</div></div>" +
    purchase(p) +
    "</div><section><h2>Product specifications</h2>" +
    Object.entries(p.specifications || {})
      .map(
        ([k, v]) => '<p class="spec"><b>' + esc(k) + "</b>" + esc(v) + "</p>",
      )
      .join("") +
    "</section><section><h2>Customer reviews</h2><blockquote>“The finish feels carefully considered.”<cite>Sample review · " +
    p.rating +
    ' stars</cite></blockquote></section><section><h2>Related products</h2><div class="grid">' +
    products
      .filter((q) => q.category === p.category && q.id !== p.id)
      .slice(0, 4)
      .map(card)
      .join("") +
    "</div></section></div>";
  bindPurchase(p, main);
  $$(".thumbs button").forEach(
    (b) => (b.onclick = () => ($("#large").src = b.firstChild.src)),
  );
  $(".zoom").onclick = () =>
    modal(
      '<img class="zoomed" src="' +
        esc($("#large").src) +
        '" alt="' +
        esc(p.name) +
        '">',
    );
}
function wishes() {
  let a = read("wish", []).map(byId).filter(Boolean);
  main.innerHTML =
    '<div class="wrap"><h1>Your wishlist</h1>' +
    (a.length
      ? '<div class="grid">' + a.map(card).join("") + "</div>"
      : empty(
          "heart",
          "Save something you love",
          "Tap a heart on any product to keep it here.",
        )) +
    "</div>";
  icons();
}
