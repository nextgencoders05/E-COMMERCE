function lines() {
  return read("cart", []).filter((l) => byId(l.id) && l.qty > 0);
}
function addItem(p, color, size, qty = 1) {
  let a = lines(),
    id = String(p.id);
  if (
    !Number.isInteger(qty) ||
    qty < 1 ||
    a.filter((l) => l.id === id).reduce((s, l) => s + l.qty, qty) > p.stock
  ) {
    toast("Quantity exceeds available stock");
    return false;
  }
  color = color || p.colors?.[0] || "";
  size = size || p.sizes?.[0] || "";
  let line = a.find((l) => l.id === id && l.color === color && l.size === size);
  if (line) line.qty += qty;
  else a.push({ id, color, size, qty });
  write("cart", a);
  badges();
  toast("Added to your shopping bag");
  return true;
}
function totals(method = "Standard") {
  let a = lines(),
    subtotal = a.reduce((s, l) => s + byId(l.id).price * l.qty, 0),
    coupon = read("coupon", ""),
    rate = read("discounts", { ARISE10: 10 })[coupon] || 0,
    discount = Math.round((subtotal * rate) / 100),
    delivery = subtotal
      ? method === "Express"
        ? 149
        : subtotal > 999
          ? 0
          : 79
      : 0;
  return {
    subtotal,
    discount,
    delivery,
    total: subtotal - discount + delivery,
  };
}
function summary(t) {
  return (
    '<div class="summary">' +
    [
      ["Subtotal", money(t.subtotal)],
      ["Coupon discount", "−" + money(t.discount)],
      ["Delivery", t.delivery ? money(t.delivery) : "Free"],
      ["Total", money(t.total)],
    ]
      .map(([k, v]) => "<div><span>" + k + "</span><b>" + v + "</b></div>")
      .join("") +
    "</div>"
  );
}
function cart() {
  let a = lines();
  main.innerHTML =
    '<div class="wrap"><h1>Your shopping bag</h1>' +
    (a.length
      ? '<div class="split"><div>' +
        a
          .map((l, i) => {
            let p = byId(l.id);
            return (
              '<article class="rowitem"><img src="' +
              img(p) +
              '" alt=""><div><small>' +
              esc(p.brand) +
              '</small><h3><a href="' +
              productUrl(p) +
              '">' +
              esc(p.name) +
              "</a></h3><p>" +
              esc([l.color, l.size].filter(Boolean).join(" / ")) +
              '</p><div class="qty"><button data-minus="' +
              i +
              '" aria-label="Decrease quantity">−</button>' +
              l.qty +
              '<button data-plus="' +
              i +
              '" aria-label="Increase quantity">+</button></div></div><div><b>' +
              money(p.price * l.qty) +
              '</b><button data-save="' +
              i +
              '">Save for later</button><button data-remove="' +
              i +
              '">Remove</button></div></article>'
            );
          })
          .join("") +
        '</div><aside class="panel"><h2>Order summary</h2><form id="coupon"><label>Coupon code<input name="code" placeholder="ARISE10" value="' +
        esc(read("coupon", "")) +
        '"></label><button>Apply coupon</button></form>' +
        summary(totals()) +
        '<a class="primary wide" href="checkout.html">Proceed to Checkout</a></aside></div>'
      : empty(
          "shopping-bag",
          "Your bag is empty",
          "Explore the collection to find your first piece.",
        )) +
    "</div>";
  icons();
  function save() {
    write("cart", a);
    badges();
    cart();
  }
  main.onclick = (e) => {
    let b = e.target.closest("button");
    if (!b) return;
    for (let op of ["minus", "plus", "remove", "save"])
      if (b.dataset[op] !== undefined) {
        let i = +b.dataset[op],
          l = a[i];
        if (op === "remove") {
          ask("Remove this item?", () => {
            a.splice(i, 1);
            save();
          });
          return;
        }
        if (op === "minus" && l.qty > 1) l.qty--;
        if (op === "plus") {
          if (
            a.filter((x) => x.id === l.id).reduce((s, x) => s + x.qty, 0) >=
            byId(l.id).stock
          )
            return toast("Stock limit reached");
          l.qty++;
        }
        if (op === "save") {
          write("wish", [...new Set([...read("wish", []), l.id])]);
          a.splice(i, 1);
          toast("Saved to wishlist");
        }
        save();
      }
  };
  if ($("#coupon"))
    $("#coupon").onsubmit = (e) => {
      e.preventDefault();
      let code = e.target.code.value.trim().toUpperCase();
      if (code && !Object.hasOwn(read("discounts", { ARISE10: 10 }), code))
        return toast("Coupon not found");
      write("coupon", code);
      cart();
      toast(code ? "Coupon applied" : "Coupon removed");
    };
}
