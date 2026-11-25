function loginAs(name) {
  write("profile", { name });
  location.href = "profile.html";
}
function account() {
  let profile = read("profile", null);
  if (page === "profile" && profile) {
    main.innerHTML =
      '<div class="wrap narrow"><p class="eyeline">Customer account · Demo</p><h1>Hello, ' +
      esc(profile.name) +
      '</h1><div class="panel stack"><div class="actions"><a class="outline" href="orders.html">My Orders & Tracking</a><a class="outline" href="wishlist.html">Wishlist</a></div><form id="settings" class="stack"><h2>Account settings</h2><label>Profile name<input name="name" required value="' +
      esc(profile.name) +
      '"></label><label>Saved delivery address (fictional)<textarea name="address">' +
      esc(read("address", "")) +
      '</textarea></label><button>Save changes</button></form><button id="logout">Logout</button></div></div>';
    $("#settings").onsubmit = (e) => {
      e.preventDefault();
      write("address", e.target.address.value);
      write("profile", {
        name: e.target.elements.name.value.trim() || "Demo Shopper",
      });
      account();
      toast("Profile saved");
    };
    $("#logout").onclick = () => {
      write("profile", null);
      location.href = "login.html";
    };
    return;
  }
  let reg = page === "register";
  main.innerHTML =
    '<div class="wrap narrow"><div class="eyeline">ARISE MART ACCOUNT</div><h1>' +
    (reg ? "Create account" : "Welcome back") +
    '</h1><p class="notice">Demo sign-in on this device. Use a fictional name. No password or Google connection is required.</p><form id="auth" class="panel stack"><label>Display name<input name="display" required placeholder="Demo Shopper"></label><button class="primary">' +
    (reg ? "Create demo account" : "Sign in to demo") +
    '</button><button type="button" id="google">Continue with Google · Demo</button><button type="button" id="forgot">Forgot password?</button><a class="under" href="' +
    (reg ? "login" : "register") +
    '.html">' +
    (reg ? "Already have an account? Sign in" : "Create an account") +
    "</a></form></div>";
  $("#auth").onsubmit = (e) => {
    e.preventDefault();
    loginAs(e.target.display.value.trim() || "Demo Shopper");
  };
  $("#google").onclick = () => loginAs("Google Demo Shopper");
  $("#forgot").onclick = () =>
    modal(
      "<h2>Password recovery</h2><p>Demo profiles use a display name. Enter a name on the sign-in screen to continue. No reset email is sent.</p>",
    );
}
function orders() {
  let a = read("orders", []);
  main.innerHTML =
    '<div class="wrap narrow"><h1>My orders</h1><p>Demonstration orders on this device.</p>' +
    (a.length
      ? a
          .map(
            (o) =>
              '<details class="panel"><summary><b>' +
              esc(o.id) +
              "</b> · " +
              esc(o.status) +
              " · " +
              money(o.total) +
              "</summary><p>" +
              dateText(o.date) +
              " · " +
              esc(o.payment) +
              "</p>" +
              o.items
                .map((l) => "<p>" + esc(l.name) + " × " + l.qty + "</p>")
                .join("") +
              "<h3>Order tracking</h3><p>" +
              esc(o.status) +
              " · Estimated delivery " +
              dateText(o.eta) +
              "</p>" +
              summary(o) +
              "</details>",
          )
          .join("")
      : empty(
          "package",
          "No orders yet",
          "Complete a demo checkout to see your order here.",
        )) +
    "</div>";
  icons();
}
