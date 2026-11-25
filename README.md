# ARISE MART

A static, responsive shopping and retail management demonstration built with HTML, CSS, vanilla JavaScript, Lucide and Chart.js. All catalog images, icons and chart scripts are packaged locally.

## Deploy on GitHub Pages

1. Extract the ZIP and open the ARISE-MART folder.
2. Create a public GitHub repository. Upload the **contents of the folder** so index.html is visible at the repository root alongside css, js, data and assets. Commit to main.
3. In repository Settings → Pages, choose **Deploy from a branch**. Select **main**, select **/(root)** and save.
4. After deployment finishes, open **Visit site** in Pages settings. Product links use product.html?id=… and work after a refresh.
5. To use a domain you own later, configure the custom domain in Pages settings and follow GitHub’s DNS instructions.

For local development, serve this directory using your editor’s static preview, or run `python3 -m http.server 8000` and open http://localhost:8000/. Opening index.html directly from a file manager can block the JSON request. The deployed project needs no server code, build step, account keys or package installation.

## Demonstrate a purchase

1. Open Shop. Filter by category, price, brand, rating or discount. Open a product or Quick view, select available variants and add it to your bag.
2. Adjust quantity and try ARISE10. The coupon takes 10% off the selling-price subtotal, rounded to the nearest rupee. Standard delivery costs ₹79 for orders up to ₹999 and is free above ₹999. Express delivery costs ₹149.
3. Complete checkout using fictional details. UPI, credit, debit and cash on delivery are simulations. No payment credentials are requested. A completed order stores its item snapshots, total, status, demonstration name and estimated date, deducts stock and clears the bag.
4. Open Demo admin in the footer. Under Orders, expand the new record and change its status. Open Track an order to see the same status.
5. Under Products or Inventory, edit an item or add one with a small local image. Changes appear in Shop in the same browser. Eight sample transactions populate the analytics dashboard alongside checkout orders.

## Project map

| Location | Responsibility |
| --- | --- |
| Root HTML files | Direct, refreshable shopping, checkout, account and admin entry points |
| css/ | Shared styling, responsive layouts and admin theme |
| js/app.js | Shared layout, local storage access, page initialization and dialogs |
| js/products.js | Catalog filters, sorting, product cards, quick view, product details and wishlist |
| js/cart.js and js/checkout.js | Variant-aware quantities, totals, stock checks and order confirmation |
| js/auth-demo.js | Device-local profile, address and order tracking |
| js/admin.js | Catalog editor, inventory, orders, coupons and analytics |
| data/products.json | Initial 40-product catalog |
| assets/images/ | Local campaign art, product art, detail crops and credits |
| assets/licenses/ | Bundled dependency licenses |

## Demo boundaries and later integration

The account and admin pages simulate workflows. Anyone who opens admin.html can use its controls. All records belong to the current browser and origin. Switching demo names does not separate orders. No data is sent to Google, a newsletter provider, Supabase or a payment processor. Social links open the platforms’ homepages. The contact address is fictional.

The storage functions in app.js provide a starting point for a future repository or API layer. Real checkout should calculate prices and inventory on the server, verify payments, and commit orders transactionally. Real authentication, admin role checks, user-specific access rules and product image storage belong in that later integration.

To reset the demo, remove the arise.store.v1 LocalStorage entry for this origin and reload. This resets shopping, account, inventory and admin records together.
