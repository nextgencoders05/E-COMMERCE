const dateText = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
function checkout() {
  if (!lines().length) {
    main.innerHTML = empty(
      "shopping-bag",
      "Your bag is empty",
      "Add products before checkout.",
    );
    return;
  }
  let step = 0,
    data = {
      name: read("profile", {}).name || "Demo Shopper",
      email: "shopper@example.com",
      address: read("address", "") || "12 Sample Street",
      city: "Chennai",
      pin: "600001",
      method: "Standard",
      payment: "UPI",
    },
    steps = [
      "Customer information",
      "Delivery address",
      "Delivery method",
      "Payment method",
      "Order review",
      "Confirmation",
    ];
  function field(k, label, type = "text", attrs = "") {
    return (
      "<label>" +
      label +
      '<input required type="' +
      type +
      '" name="' +
      k +
      '" value="' +
      esc(data[k]) +
      '" ' +
      attrs +
      "></label>"
    );
  }
  function radios(k, arr) {
    return arr
      .map(
        ([v, desc]) =>
          '<label class="choice"><input type="radio" name="' +
          k +
          '" value="' +
          v +
          '" ' +
          (data[k] === v ? "checked" : "") +
          "><span><b>" +
          v +
          "</b><small>" +
          desc +
          "</small></span></label>",
      )
      .join("");
  }
  function draw() {
    let t = totals(data.method),
      content = [
        field("name", "Demo customer name") +
          field("email", "Demo email", "email"),
        field("address", "Address line") +
          field("city", "City") +
          field(
            "pin",
            "PIN code",
            "text",
            'inputmode="numeric" pattern="[0-9]{6}"',
          ),
        radios("method", [
          ["Standard", "4–7 days · " + (t.subtotal > 999 ? "Free" : "₹79")],
          ["Express", "2–3 days · ₹149"],
        ]),
        radios("payment", [
          ["UPI", "Simulated UPI payment"],
          ["Credit Card", "Simulated credit payment"],
          ["Debit Card", "Simulated debit payment"],
          ["Cash on Delivery", "Simulated pay on delivery"],
        ]),
        "<p>" +
          esc(data.name) +
          " · " +
          esc(data.email) +
          "</p><p>" +
          esc([data.address, data.city, data.pin].join(", ")) +
          "</p><p>" +
          data.method +
          " delivery · " +
          data.payment +
          "</p>" +
          lines()
            .map(
              (l) =>
                "<p>" +
                esc(byId(l.id).name) +
                " × " +
                l.qty +
                " · " +
                money(l.qty * byId(l.id).price) +
                "</p>",
            )
            .join(""),
      ];
    main.innerHTML =
      '<div class="wrap narrow"><p class="crumb">Demo checkout · Step ' +
      (step + 1) +
      " of 6</p><h1>" +
      steps[step] +
      '</h1><progress value="' +
      (step + 1) +
      '" max="6"></progress><p class="notice">Use fictional details. All payment methods are simulated. No money is collected.</p><form id="step" class="panel stack">' +
      content[step] +
      (step === 4 ? summary(t) : "") +
      '<div class="actions">' +
      (step ? '<button id="back" type="button">Back</button>' : "") +
      '<button class="primary">' +
      (step === 4 ? "Place demonstration order" : "Continue") +
      "</button></div></form></div>";
    if ($("#back"))
      $("#back").onclick = () => {
        step--;
        draw();
      };
    $("#step").onsubmit = (e) => {
      e.preventDefault();
      Object.assign(data, Object.fromEntries(new FormData(e.target)));
      if (step < 4) {
        step++;
        draw();
        return;
      }
      if (navigator.locks) {
        navigator.locks.request("arise-checkout", finish);
      } else {
        finish();
      }
    };
  }
  function finish() {
    let fresh = read("products", products),
      a = lines(),
      stock = {};
    for (let l of a) stock[l.id] = (stock[l.id] || 0) + l.qty;
    if (
      !a.length ||
      Object.entries(stock).some(
        ([id, q]) => (fresh.find((p) => String(p.id) === id)?.stock ?? 0) < q,
      )
    ) {
      toast("Stock changed. Review your bag.");
      return;
    }
    let id = "AM-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      order = {
        id,
        name: data.name,
        date: new Date().toISOString(),
        eta: new Date(
          Date.now() + (data.method === "Express" ? 3 : 7) * 86400000,
        ).toISOString(),
        method: data.method,
        payment: data.payment,
        paymentStatus:
          data.payment === "Cash on Delivery" ? "Due on delivery" : "Demo paid",
        status: "Pending",
        items: a.map((l) => ({
          ...l,
          name: byId(l.id).name,
          price: byId(l.id).price,
        })),
        ...totals(data.method),
      };
    let next = fresh.map((p) => ({
      ...p,
      stock: p.stock - (stock[p.id] || 0),
    }));
    try {
      commit({
        orders: [order, ...read("orders", [])],
        products: next,
        cart: [],
        coupon: "",
      });
    } catch {
      toast("Storage full. Your order could not be saved.");
      return;
    }
    products = next;
    badges();
    main.innerHTML =
      '<div class="wrap narrow success"><div class="tick">' +
      icon("check") +
      "</div><h1>Order confirmed.</h1><p>Demonstration order <b>" +
      id +
      "</b></p><p>Estimated delivery · " +
      dateText(order.eta) +
      '</p><div class="panel">' +
      order.items
        .map((l) => "<p>" + esc(l.name) + " × " + l.qty + "</p>")
        .join("") +
      summary(order) +
      '</div><div class="actions"><a class="primary" href="shop.html">Continue Shopping</a><a class="outline" href="orders.html">Track order</a></div></div>';
    icons();
  }
  draw();
}
