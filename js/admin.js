const tabs = [
    "Overview",
    "Products",
    "Categories",
    "Inventory",
    "Orders",
    "Customers",
    "Discounts",
    "Sales Analytics",
    "Settings",
  ],
  statuses = [
    "Pending",
    "Confirmed",
    "Packed",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];
const seedOrders = () =>
  ["Meera", "Arun", "Ananya", "Kavin", "Tara", "Dev", "Ira", "Ravi"].map(
    (name, i) => {
      let p = products[i % products.length],
        date = new Date();
      date.setMonth(date.getMonth() - Math.floor(i / 2));
      date.setDate(Math.max(1, date.getDate() - i));
      return {
        id: "SAMPLE-" + (1008 - i),
        name,
        date: date.toISOString(),
        status: statuses[i % 5],
        payment: "UPI",
        paymentStatus: "Demo paid",
        items: p ? [{ name: p.name, qty: 1, price: p.price }] : [],
        total: p?.price || 0,
      };
    },
  );
function adminPage() {
  let tab = tabs.includes(location.hash.slice(1))
      ? location.hash.slice(1)
      : "Overview",
    charts = [];
  let seeds = read("sampleOrders", null);
  if (!seeds) {
    seeds = seedOrders();
    write("sampleOrders", seeds);
  }
  function allOrders() {
    return [...read("orders", []), ...read("sampleOrders", [])];
  }
  function layout() {
    charts.forEach((c) => c.destroy());
    charts = [];
    main.innerHTML =
      '<div class="admin"><aside><h3>Store management</h3>' +
      tabs
        .map(
          (t, i) =>
            '<button class="' +
            (tab === t ? "chosen" : "") +
            '" data-tab="' +
            t +
            '">' +
            icon(
              [
                "layout-dashboard",
                "package",
                "layers",
                "warehouse",
                "shopping-bag",
                "users",
                "ticket",
                "chart-column",
                "settings",
              ][i],
            ) +
            t +
            "</button>",
        )
        .join("") +
      '<button id="exit">' +
      icon("log-out") +
      'Logout</button></aside><div class="adminbody"><p class="eyeline">ARISE MART / DEMO ADMIN</p><h1>' +
      tab +
      '</h1><p class="notice">Public frontend demonstration · Sample records and changes are local to this browser.</p><div id="workspace"></div></div></div>';
    let w = $("#workspace"),
      a = allOrders();
    $("#exit").onclick = () => (location.href = "index.html");
    $$("[data-tab]").forEach(
      (b) =>
        (b.onclick = () => {
          tab = b.dataset.tab;
          history.replaceState(null, "", "#" + tab);
          layout();
        }),
    );
    if (["Overview", "Sales Analytics"].includes(tab)) {
      let active = a.filter((o) => o.status !== "Cancelled");
      w.innerHTML =
        '<div class="stats">' +
        [
          ["Total revenue", money(active.reduce((s, o) => s + o.total, 0))],
          ["Total orders", a.length],
          ["Total customers", new Set(a.map((o) => o.name)).size],
          ["Total products", products.length],
          ["Pending orders", a.filter((o) => o.status === "Pending").length],
          ["Low stock", products.filter((p) => p.stock <= 5).length],
        ]
          .map(
            ([n, v]) =>
              '<div class="panel"><small>' +
              n +
              "</small><strong>" +
              v +
              "</strong></div>",
          )
          .join("") +
        '</div><div class="charts">' +
        ["Monthly revenue", "Weekly sales", "Sales by category", "Order status"]
          .map(
            (n, i) =>
              '<div class="panel"><h3>' +
              n +
              '</h3><div class="plot"><canvas aria-label="' +
              n +
              '" role="img" id="chart' +
              i +
              '"></canvas></div></div>',
          )
          .join("") +
        '</div><h2>Best-selling products</h2><div id="best"></div><h2>Recent transactions</h2>' +
        orderList(a.slice(0, 5), false);
      let best = {},
        cat = {};
      active.forEach((o) =>
        o.items.forEach((l) => {
          best[l.name] = (best[l.name] || 0) + l.qty;
          let k =
            products.find((p) => p.name === l.name)?.category || "Archived";
          cat[k] = (cat[k] || 0) + l.qty * l.price;
        }),
      );
      $("#best").innerHTML = Object.entries(best)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(
          ([n, v]) =>
            '<div class="spec">' + esc(n) + "<b>" + v + " sold</b></div>",
        )
        .join("");
      let now = new Date(),
        months = Array.from(
          { length: 6 },
          (_, i) => new Date(now.getFullYear(), now.getMonth() - 5 + i, 1),
        ),
        days = Array.from(
          { length: 7 },
          (_, i) =>
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + i),
        ),
        sum = (fn) =>
          active
            .filter((o) => fn(new Date(o.date)))
            .reduce((s, o) => s + o.total, 0),
        sets = [
          [
            "line",
            months.map((d) => d.toLocaleString("en", { month: "short" })),
            months.map((d) =>
              sum(
                (x) =>
                  x.getMonth() === d.getMonth() &&
                  x.getFullYear() === d.getFullYear(),
              ),
            ),
          ],
          [
            "bar",
            days.map((d) => d.toLocaleString("en", { weekday: "short" })),
            days.map((d) => sum((x) => x.toDateString() === d.toDateString())),
          ],
          ["doughnut", Object.keys(cat), Object.values(cat)],
          [
            "doughnut",
            statuses,
            statuses.map((s) => a.filter((o) => o.status === s).length),
          ],
        ];
      sets.forEach(([type, labels, data], i) =>
        charts.push(
          new Chart($("#chart" + i), {
            type,
            data: {
              labels,
              datasets: [
                {
                  label: i < 3 ? "Sales (₹)" : "Orders",
                  data,
                  borderColor: "#386450",
                  backgroundColor:
                    i < 2
                      ? "#74947e"
                      : [
                          "#285842",
                          "#b99468",
                          "#99af98",
                          "#c9bb9c",
                          "#6c7b85",
                          "#b4847b",
                          "#d9cda9",
                          "#587385",
                        ],
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              animation: !matchMedia("(prefers-reduced-motion: reduce)")
                .matches,
              plugins: { legend: { display: i >= 2, position: "bottom" } },
            },
          }),
        ),
      );
    }
    if (tab === "Products" || tab === "Inventory") {
      w.innerHTML =
        '<div class="toolbar"><input id="findproduct" aria-label="Search products" placeholder="Search products"><button class="primary" id="newproduct">Add product</button></div><div id="plist"></div>';
      function list() {
        let term = $("#findproduct").value.toLowerCase();
        $("#plist").innerHTML = products
          .filter((p) => (p.name + p.brand).toLowerCase().includes(term))
          .map(
            (p) =>
              '<div class="adminrow"><img src="' +
              img(p) +
              '" alt=""><div><b>' +
              esc(p.name) +
              "</b><small>" +
              esc(p.category) +
              " · " +
              money(p.price) +
              " · Stock " +
              p.stock +
              '</small></div><button data-edit="' +
              esc(p.id) +
              '">Edit</button><button data-delete="' +
              esc(p.id) +
              '">Delete</button></div>',
          )
          .join("");
      }
      list();
      $("#findproduct").oninput = list;
      $("#newproduct").onclick = () => editProduct(null, layout);
      $("#plist").onclick = (e) => {
        let b = e.target.closest("button");
        if (b?.dataset.edit) editProduct(byId(b.dataset.edit), layout);
        if (b?.dataset.delete)
          ask("Delete this product?", () => {
            products = products.filter(
              (p) => String(p.id) !== b.dataset.delete,
            );
            write("products", products);
            write("cart", lines());
            badges();
            layout();
          });
      };
    }
    if (tab === "Orders") {
      w.innerHTML = orderList(a, true);
      $$("[data-order]").forEach(
        (s) =>
          (s.onchange = () => {
            let k = s.dataset.order.startsWith("SAMPLE-")
                ? "sampleOrders"
                : "orders",
              list = read(k, []);
            list.find((o) => o.id === s.dataset.order).status = s.value;
            write(k, list);
            toast("Order status updated");
          }),
      );
    }
    if (tab === "Customers")
      w.innerHTML = [...new Set(a.map((o) => o.name))]
        .map(
          (n) =>
            '<div class="spec"><b>' +
            esc(n) +
            "</b>" +
            a.filter((o) => o.name === n).length +
            " orders</div>",
        )
        .join("");
    if (tab === "Categories")
      w.innerHTML = cats
        .map(
          (c) =>
            '<a class="spec" href="shop.html?category=' +
            enc(c) +
            '"><b>' +
            esc(c) +
            "</b>" +
            products.filter((p) => p.category === c).length +
            " products</a>",
        )
        .join("");
    if (tab === "Discounts") {
      let codes = read("discounts", { ARISE10: 10 });
      w.innerHTML =
        '<form id="discountForm" class="panel stack"><label>Coupon code<input required name="code" pattern="[A-Za-z0-9]{3,20}"></label><label>Discount percentage<input required type="number" name="rate" min="1" max="90"></label><button class="primary">Save coupon</button></form>' +
        Object.entries(codes)
          .map(
            ([k, v]) =>
              '<div class="spec">' + esc(k) + "<b>" + v + "% off</b></div>",
          )
          .join("");
      $("#discountForm").onsubmit = (e) => {
        e.preventDefault();
        codes[e.target.code.value.toUpperCase()] = +e.target.rate.value;
        write("discounts", codes);
        layout();
      };
    }
    if (tab === "Settings") {
      w.innerHTML =
        '<form id="settingsForm" class="panel stack"><label>Store manager display name<input required name="manager" value="' +
        esc(read("manager", "Store manager")) +
        '"></label><button>Save settings</button></form>';
      $("#settingsForm").onsubmit = (e) => {
        e.preventDefault();
        write("manager", e.target.manager.value);
        toast("Settings saved");
      };
    }
    icons();
  }
  layout();
}
function orderList(a, edit) {
  return a
    .map(
      (o) =>
        '<details class="panel"><summary><b>' +
        esc(o.id) +
        "</b> · " +
        esc(o.name) +
        " · " +
        money(o.total) +
        "</summary><p>" +
        dateText(o.date) +
        " · " +
        esc(o.paymentStatus) +
        " · " +
        esc(o.status) +
        "</p>" +
        o.items
          .map((l) => "<p>" + esc(l.name) + " × " + l.qty + "</p>")
          .join("") +
        (edit
          ? '<label>Order status<select data-order="' +
            esc(o.id) +
            '">' +
            opts(statuses, o.status) +
            "</select></label>"
          : "") +
        "</details>",
    )
    .join("");
}
function editProduct(p, done) {
  let original = p,
    pic = p?.images[0] || "assets/images/product-01.webp";
  p = p || {
    id: "AM-" + crypto.randomUUID().slice(0, 8),
    name: "",
    brand: "",
    category: cats[0],
    price: 100,
    originalPrice: 100,
    discount: 0,
    stock: 10,
    rating: 4,
    description: "",
    colors: [],
    sizes: [],
    specifications: {},
    popularity: 0,
    createdAt: new Date().toISOString(),
  };
  modal(
    "<h2>" +
      (original ? "Edit" : "Add") +
      ' product</h2><form id="editor" class="stack"><img class="preview" src="' +
      esc(pic) +
      '" alt="Product preview"><label>Product image<input type="file" accept="image/png,image/jpeg,image/webp" id="upload"></label>' +
      [
        ["name", "Product name"],
        ["brand", "Brand"],
        ["originalPrice", "Original price (₹)"],
        ["discount", "Discount (%)"],
        ["stock", "Stock"],
      ]
        .map(
          ([k, n], i) =>
            "<label>" +
            n +
            '<input name="' +
            k +
            '" required ' +
            (i >= 2
              ? 'type="number" min="' +
                (i === 2 ? 1 : 0) +
                '" ' +
                (i === 3 ? 'max="99"' : "")
              : "") +
            ' value="' +
            esc(p[k]) +
            '"></label>',
        )
        .join("") +
      '<label>Category<select name="category">' +
      opts(cats, p.category) +
      '</select></label><label>Description<textarea required name="description">' +
      esc(p.description) +
      '</textarea></label><button class="primary">Save product</button></form>',
  );
  $("#upload").onchange = async (e) => {
    let f = e.target.files[0];
    if (!f) return;
    if (
      !["image/webp", "image/png", "image/jpeg"].includes(f.type) ||
      f.size > 300000
    ) {
      e.target.value = "";
      return toast("Choose a PNG, JPEG or WebP under 300 KB");
    }
    let reader = new FileReader();
    reader.onload = () => {
      pic = reader.result;
      $(".preview").src = pic;
    };
    reader.readAsDataURL(f);
  };
  $("#editor").onsubmit = (e) => {
    e.preventDefault();
    let d = Object.fromEntries(new FormData(e.target)),
      n = {
        ...p,
        ...d,
        discount: +d.discount,
        originalPrice: +d.originalPrice,
        stock: +d.stock,
        price:
          original &&
          +d.originalPrice === p.originalPrice &&
          +d.discount === p.discount
            ? p.price
            : Math.round(d.originalPrice * (1 - d.discount / 100)),
        images: pic === p.images?.[0] ? p.images : [pic],
      },
      next = original
        ? products.map((x) => (x.id === p.id ? n : x))
        : [n, ...products];
    try {
      write("products", next);
      products = next;
      closeModal();
      done();
      toast("Product saved");
    } catch {
      toast("Device storage full. Choose a smaller image.");
    }
  };
}
