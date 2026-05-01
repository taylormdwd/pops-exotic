/* ============================================
   POP'S EXOTIC SODAS & SNACKS
   Main JavaScript - Products, Cart, UI
   ============================================ */

// ============================================
// DEMO PRODUCT DATA
// When Google Sheets is connected, this gets
// replaced with live data from the spreadsheet.
// For now, these are realistic demo products
// based on what Pop's actually carries.
// ============================================
const DEMO_PRODUCTS = [
    {
        id: "fanta-shikuwasa",
        name: "Fanta Shikuwasa",
        price: 6.00,
        category: "Exotic Sodas",
        country: "Japan",
        description: "Rare citrus flavor from Okinawa, Japan",
        image: "",
        badge: "limited",
        emoji: "\ud83c\udf4a"
    },
    {
        id: "blue-pepsi",
        name: "Blue Pepsi",
        price: 5.00,
        category: "Exotic Sodas",
        country: "Thailand",
        description: "Electric blue cola from Southeast Asia",
        image: "",
        badge: "hot",
        emoji: "\ud83e\uddca"
    },
    {
        id: "fanta-banana-trinidad",
        name: "Fanta Banana",
        price: 6.00,
        category: "Exotic Sodas",
        country: "Trinidad",
        description: "Tropical banana flavor from Trinidad",
        image: "",
        badge: "",
        emoji: "\ud83c\udf4c"
    },
    {
        id: "fanta-berries-egypt",
        name: "Fanta Berries",
        price: 6.00,
        category: "Exotic Sodas",
        country: "Egypt",
        description: "Mixed berry blast from Egypt",
        image: "",
        badge: "new",
        emoji: "\ud83c\udf53"
    },
    {
        id: "honey-chili-doritos",
        name: "Honey Chili Doritos",
        price: 8.00,
        category: "International Chips",
        country: "South Korea",
        description: "Sweet and spicy from South Korea",
        image: "",
        badge: "hot",
        emoji: "\ud83c\udf36\ufe0f"
    },
    {
        id: "squid-lays",
        name: "Squid Flavor Lay's",
        price: 7.00,
        category: "International Chips",
        country: "Thailand",
        description: "Wild seafood flavor from Thailand",
        image: "",
        badge: "",
        emoji: "\ud83e\udd91"
    },
    {
        id: "japanese-cheetos-bbq",
        name: "Japanese BBQ Cheetos",
        price: 8.00,
        category: "International Chips",
        country: "Japan",
        description: "Smoky barbecue Cheetos from Japan",
        image: "",
        badge: "",
        emoji: "\ud83c\udf56"
    },
    {
        id: "calbee-steak-chips",
        name: "Calbee Steak Chips",
        price: 7.00,
        category: "International Chips",
        country: "Japan",
        description: "Premium steak-flavored chips from Japan",
        image: "",
        badge: "new",
        emoji: "\ud83e\udd69"
    },
    {
        id: "chinese-oreo-rose",
        name: "Rose Flower Oreos",
        price: 9.00,
        category: "Sweet & Candy",
        country: "China",
        description: "Delicate rose flavor from China",
        image: "",
        badge: "limited",
        emoji: "\ud83c\udf39"
    },
    {
        id: "chinese-oreo-peach-grape",
        name: "Peach Grape Oreos",
        price: 9.00,
        category: "Sweet & Candy",
        country: "China",
        description: "Fruity combo Oreos from China",
        image: "",
        badge: "",
        emoji: "\ud83c\udf51"
    },
    {
        id: "crystal-candy",
        name: "Crystal Candy",
        price: 5.00,
        category: "Sweet & Candy",
        country: "China",
        description: "Viral clear candy with intense flavor",
        image: "",
        badge: "hot",
        emoji: "\ud83d\udc8e"
    },
    {
        id: "candy-grapes",
        name: "Candy Grapes",
        price: 12.00,
        category: "Sweet & Candy",
        country: "USA",
        description: "Sweet coated grapes — TikTok famous",
        image: "",
        badge: "hot",
        emoji: "\ud83c\udf47"
    },
    {
        id: "whole-shabang-original",
        name: "Whole Shabang Original",
        price: 8.00,
        category: "Spicy Snacks",
        country: "USA",
        description: "The legendary all-in-one flavor chip",
        image: "",
        badge: "",
        emoji: "\ud83d\udd25"
    },
    {
        id: "whole-shabang-extreme",
        name: "Whole Shabang Extreme",
        price: 8.00,
        category: "Spicy Snacks",
        country: "USA",
        description: "Extra spicy version for the brave",
        image: "",
        badge: "hot",
        emoji: "\ud83e\udde8"
    },
    {
        id: "fire-noodles",
        name: "Buldak Fire Noodles",
        price: 6.00,
        category: "Spicy Snacks",
        country: "South Korea",
        description: "Korean nuclear fire chicken ramen",
        image: "",
        badge: "",
        emoji: "\ud83c\udf5c"
    },
    {
        id: "mystery-box",
        name: "Mystery Box",
        price: 40.00,
        category: "Mystery Boxes",
        country: "International",
        description: "A surprise mix of exotic snacks & sodas. What will you get?",
        image: "",
        badge: "hot",
        emoji: "\ud83c\udf81"
    },
    {
        id: "mystery-box-mini",
        name: "Mini Mystery Box",
        price: 20.00,
        category: "Mystery Boxes",
        country: "International",
        description: "A smaller surprise box to try us out",
        image: "",
        badge: "new",
        emoji: "\ud83d\udce6"
    },
    {
        id: "dunkaroos",
        name: "Dunkaroos",
        price: 5.00,
        category: "Nostalgic Favorites",
        country: "USA",
        description: "The 90s classic cookie dip snack is back",
        image: "",
        badge: "",
        emoji: "\ud83e\udd24"
    },
    {
        id: "doritos-3d",
        name: "Doritos 3D",
        price: 6.00,
        category: "Nostalgic Favorites",
        country: "USA",
        description: "The puffy Doritos everyone missed",
        image: "",
        badge: "limited",
        emoji: "\ud83d\udd3a"
    },
    {
        id: "sixlets",
        name: "Sixlets",
        price: 3.00,
        category: "Nostalgic Favorites",
        country: "USA",
        description: "Candy-coated chocolate balls from back in the day",
        image: "",
        badge: "",
        emoji: "\ud83c\udfa8"
    }
];

// ============================================
// GOOGLE SHEETS INTEGRATION
// ============================================
// To connect a real Google Sheet:
// 1. Create a Google Sheet with columns: name, price, category, description, image, badge
// 2. Go to File > Share > Publish to the web > CSV
// 3. Paste the CSV URL below
// const GOOGLE_SHEET_CSV_URL = "YOUR_PUBLISHED_SHEET_CSV_URL";

// For now, we use demo data
let allProducts = [...DEMO_PRODUCTS];
let currentFilter = "All";
// Country filter — set by Shop by Origin flag tiles. null = no country filter.
// Stacks WITH the category filter as an intersection (not a replacement).
let currentCountry = null;

// ============================================
// RENDER PRODUCTS
// ============================================
// Lucide-style stroke icon paths, mapped to the demo product categories.
// Inlined since this is vanilla HTML (no lucide-react). Stroke-width 2 to match.
const CATEGORY_ICON_SVG = {
    "Exotic Sodas":         '<path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 9.978V18a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9.978a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.789V2"/><path d="M7 15a6.472 6.472 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/>',
    "International Chips":  '<path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/>',
    "Sweet & Candy":        '<path d="m9.5 7.5-2 2a4.95 4.95 0 1 0 7 7l2-2a4.95 4.95 0 1 0-7-7Z"/><path d="M14 6.5v10"/><path d="M10 7.5v10"/><path d="m16 7 1-5 1.37.68A3 3 0 0 0 19.7 3H21v1.3c0 .46.1.92.32 1.33L22 7l-5 1"/><path d="m8 17-1 5-1.37-.68A3 3 0 0 0 4.3 21H3v-1.3a3 3 0 0 0-.32-1.33L2 17l5-1"/>',
    "Spicy Snacks":         '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    "Mystery Boxes":        '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><polyline points="3.29 7 12 12 20.71 7"/><path d="m7.5 4.27 9 5.15"/>',
    "Nostalgic Favorites":  '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'
};

function renderProducts(products) {
    const grid = document.getElementById("productsGrid");
    const loading = document.getElementById("productsLoading");
    const empty = document.getElementById("productsEmpty");

    // Hide loading
    if (loading) loading.style.display = "none";

    // Check if empty — if a country filter is active, render the structured
    // "No drops here yet" empty state (with PackageSearch icon + clear CTA).
    if (products.length === 0) {
        grid.innerHTML = "";
        if (empty) {
            empty.style.display = "block";
            if (currentCountry) {
                const countryLabel = escapeAttr(currentCountry);
                empty.innerHTML = `
                    <svg class="empty-icon" viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0"/>
                        <path d="m7.5 4.27 9 5.15"/>
                        <polyline points="3.29 7 12 12 20.71 7"/>
                        <path d="M12 22V12"/>
                        <circle cx="18.5" cy="15.5" r="2.5"/>
                        <path d="M20.27 17.27 22 19"/>
                    </svg>
                    <h3 class="empty-heading">No drops here yet</h3>
                    <p class="empty-body">We're sourcing more from ${countryLabel}. Check back next Friday.</p>
                    <button class="empty-clear-btn" type="button" data-clear-country>Clear filter</button>
                `;
            } else {
                empty.innerHTML = `<p>No products in this category right now. Check back soon!</p>`;
            }
        }
        return;
    }

    if (empty) empty.style.display = "none";

    grid.innerHTML = products.map(product => {
        const iconPaths = CATEGORY_ICON_SVG[product.category] || CATEGORY_ICON_SVG["Mystery Boxes"];
        return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image-wrapper">
                ${product.image
                    ? `<img src="${product.image}" alt="${product.name}" loading="lazy">`
                    : `<div class="product-placeholder-tile" aria-hidden="true">
                           <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${iconPaths}</svg>
                           <span class="placeholder-name">${product.name}</span>
                       </div>`
                }
                ${product.badge
                    ? `<span class="product-badge badge-${product.badge}">${product.badge}</span>`
                    : ''
                }
            </div>
            <div class="product-info">
                <span class="product-category-label">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-bottom">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button
                        class="add-to-cart-btn"
                        data-add-cart
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price.toFixed(2)}"
                        data-category="${product.category}"
                        ${product.image ? `data-image="${product.image}"` : ''}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    }).join("");
}

// ============================================
// FILTER PRODUCTS
// ============================================
// Tiny escape helper for values dropped into innerHTML/attributes
function escapeAttr(str) {
    return String(str).replace(/[&<>"']/g, c => ({
        '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
}

// Apply both filters as an intersection. This is the single source of truth
// for what the Shop grid renders.
function applyFilters() {
    let filtered = allProducts;
    if (currentFilter && currentFilter !== "All") {
        filtered = filtered.filter(p => p.category === currentFilter);
    }
    if (currentCountry) {
        filtered = filtered.filter(p => p.country === currentCountry);
    }
    renderProducts(filtered);
    renderCountryBadge();
}

// Sync the active state on the category pill row to currentFilter.
function syncCategoryPills() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        const label = btn.textContent.trim();
        const isActive =
            (currentFilter === "All" && label === "All") ||
            (currentFilter === "Exotic Sodas" && label === "Sodas") ||
            (currentFilter === "International Chips" && label === "Chips") ||
            (currentFilter === "Sweet & Candy" && label === "Candy") ||
            (currentFilter === "Spicy Snacks" && label === "Spicy") ||
            (currentFilter === "Mystery Boxes" && label === "Mystery") ||
            (currentFilter === "Nostalgic Favorites" && label === "Nostalgic");
        btn.classList.toggle("active", !!isActive);
    });
}

// Render (or hide) the "Filtered: [Country]" badge above the grid.
function renderCountryBadge() {
    const badge = document.getElementById("countryFilterBadge");
    const label = document.getElementById("countryFilterBadgeLabel");
    if (!badge || !label) return;
    if (currentCountry) {
        label.textContent = "Filtered: " + currentCountry;
        badge.style.display = "inline-flex";
    } else {
        badge.style.display = "none";
    }
}

// Public: category filter (called from .filter-btn onclick handlers in HTML).
function filterProducts(category) {
    currentFilter = category;
    syncCategoryPills();
    applyFilters();
    // Scroll to shop section if clicking from categories
    const shopSection = document.getElementById("shop");
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// Public: country filter (called from Shop by Origin flag tiles).
// Does NOT change activeCategory.
function filterByCountry(country) {
    currentCountry = country || null;
    applyFilters();
    const shopSection = document.getElementById("shop");
    if (shopSection) {
        shopSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// Public: clear country filter (called from badge X and empty-state CTA).
function clearCountryFilter() {
    currentCountry = null;
    applyFilters();
}

// Wire Shop by Origin flag tiles + badge X + empty-state Clear button via
// event delegation. Single document-level listener; cheap.
document.addEventListener("click", function (e) {
    // Flag tile click → filter by its data-country, scroll to shop.
    const tile = e.target.closest(".t-origin-card[data-country]");
    if (tile) {
        e.preventDefault();
        filterByCountry(tile.getAttribute("data-country"));
        return;
    }
    // Badge X
    if (e.target.closest("[data-clear-country]")) {
        e.preventDefault();
        clearCountryFilter();
        return;
    }
});

// ============================================
// GOOGLE SHEETS LOADER (for future use)
// ============================================
async function loadFromGoogleSheets(csvUrl) {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        const rows = csvText.split("\n").slice(1); // Skip header row

        allProducts = rows
            .filter(row => row.trim() !== "")
            .map((row, index) => {
                const cols = parseCSVRow(row);
                return {
                    id: `product-${index}`,
                    name: cols[0] || "Unknown Product",
                    price: parseFloat(cols[1]) || 0,
                    category: cols[2] || "Uncategorized",
                    description: cols[3] || "",
                    image: cols[4] || "",
                    badge: cols[5] || "",
                    emoji: cols[6] || "\ud83c\udf6c"
                };
            })
            .filter(p => p.name !== "Unknown Product" && p.price > 0);

        renderProducts(allProducts);
    } catch (error) {
        console.error("Failed to load from Google Sheets:", error);
        // Fall back to demo data
        allProducts = [...DEMO_PRODUCTS];
        renderProducts(allProducts);
    }
}

// Simple CSV row parser (handles quoted fields)
function parseCSVRow(row) {
    const result = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const menuBtn = document.getElementById("mobileMenuBtn");
    const overlay = document.getElementById("mobileMenuOverlay");
    const closeBtn = document.getElementById("mobileCloseBtn");
    const links = document.querySelectorAll(".mobile-link");

    if (menuBtn && overlay) {
        menuBtn.addEventListener("click", () => {
            overlay.classList.add("active");
            document.body.style.overflow = "hidden";
        });

        const closeMenu = () => {
            overlay.classList.remove("active");
            document.body.style.overflow = "";
        };

        if (closeBtn) closeBtn.addEventListener("click", closeMenu);

        links.forEach(link => {
            link.addEventListener("click", closeMenu);
        });
    }
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function initNavbarScroll() {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.style.background = "rgba(18, 18, 18, 0.98)";
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
        } else {
            navbar.style.background = "rgba(18, 18, 18, 0.9)";
            navbar.style.boxShadow = "none";
        }
    });
}

// ============================================
// SMOOTH SCROLL FOR NAV LINKS
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener("click", (e) => {
            const href = link.getAttribute("href");
            if (href === "#") return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });
}

// ============================================
// INTERSECTION OBSERVER (fade-in animations)
// ============================================
function initAnimations() {
    // Animations disabled for now — all sections visible by default.
    // Can re-enable later once images and content are finalized.
}

// ============================================
// INIT
// ============================================
document.addEventListener("DOMContentLoaded", () => {
    // Render demo products
    renderProducts(allProducts);

    // Init UI
    initMobileMenu();
    initNavbarScroll();
    initSmoothScroll();

    // Delay animations so products render first
    setTimeout(initAnimations, 100);

    // If you have a Google Sheet CSV URL, uncomment this:
    // loadFromGoogleSheets(GOOGLE_SHEET_CSV_URL);
});
