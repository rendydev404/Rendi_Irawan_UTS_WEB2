
const Products = {
    allProducts: [],
    
    // Config for pagination
    perPage: 8,

    init: async () => {
        await Products.fetchProducts();
    },

    /**
     * Fetch products from JSON file
     */
    fetchProducts: async () => {
        try {
            const response = await fetch('data/products.json');
            if (!response.ok) throw new Error('Failed to load products');
            
            const data = await response.json();
            Products.allProducts = data;
            
            // Dispatch event when products are ready
            window.dispatchEvent(new Event('products-loaded'));
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            if (typeof Toast !== 'undefined') {
                Toast.show('Error loading products data', 'error');
            }
            return [];
        }
    },

    /**
     * Get single product by ID
     */
    getById: (id) => {
        return Products.allProducts.find(p => p.id === parseInt(id));
    },

    /**
     * Get products by category
     */
    getByCategory: (category, limit = null) => {
        const filtered = Products.allProducts.filter(p => p.category === category);
        return limit ? filtered.slice(0, limit) : filtered;
    },

    /**
     * Get featured/best selling products
     */
    getFeatured: (limit = 4) => {
        return Products.allProducts
            .filter(p => p.badge === 'Best Seller' || p.badge === 'New' || p.discount > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    },

    /**
     * Filter and sort products based on criteria
     */
    filter: (criteria) => {
        let results = [...Products.allProducts];

        // Search by name
        if (criteria.search) {
            const query = criteria.search.toLowerCase();
            results = results.filter(p => p.name.toLowerCase().includes(query));
        }

        // Filter by category
        if (criteria.categories && criteria.categories.length > 0) {
            results = results.filter(p => criteria.categories.includes(p.category));
        }

        // Filter by price range
        if (criteria.priceRange) {
            results = results.filter(p => p.price >= criteria.priceRange.min && p.price <= criteria.priceRange.max);
        }

        // Sort
        if (criteria.sortBy) {
            switch (criteria.sortBy) {
                case 'price-low':
                    results.sort((a, b) => a.price - b.price);
                    break;
                case 'price-high':
                    results.sort((a, b) => b.price - a.price);
                    break;
                case 'rating':
                    results.sort((a, b) => b.rating - a.rating);
                    break;
                case 'newest':
                    results = results.filter(p => p.badge === 'New').concat(results.filter(p => p.badge !== 'New'));
                    break;
            }
        }

        return results;
    },

    /**
     * Helper to generate HTML for product card
     */
    generateCardHTML: (product) => {
        const hasDiscount = product.discount > 0;
        const discountedPrice = hasDiscount ? product.price - (product.price * (product.discount / 100)) : product.price;
        
        let badgeHtml = '';
        if (product.badge) {
            const badgeClass = product.badge === 'Best Seller' ? 'bg-warning text-black' : 'bg-blue-500 text-white';
            badgeHtml = `<span class="badge absolute top-3 left-3 ${badgeClass} z-10">${product.badge}</span>`;
        } else if (hasDiscount) {
            badgeHtml = `<span class="badge absolute top-3 left-3 bg-danger text-white z-10">${product.discount}% OFF</span>`;
        }

        return `
            <div class="product-card bg-bg-secondary rounded-2xl border border-border overflow-hidden flex flex-col relative group">
                ${badgeHtml}
                
                <!-- Wishlist Button -->
                <button onclick="event.preventDefault(); window.dispatchEvent(new CustomEvent('toggle-wishlist', {detail: ${product.id}}))" 
                        class="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-white hover:text-danger transition-colors wishlist-btn" 
                        data-id="${product.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="heart-icon"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>

                <a href="product-detail.html?id=${product.id}" class="block aspect-square overflow-hidden bg-white product-image relative">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover mix-blend-multiply" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400?text=No+Image'">
                </a>
                
                <div class="p-3 sm:p-5 flex flex-col flex-grow">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-[10px] sm:text-xs text-text-secondary uppercase tracking-wider font-semibold truncate mr-2">${product.category}</span>
                        <div class="flex items-center text-star text-[10px] sm:text-xs flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none" class="mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            ${product.rating}
                        </div>
                    </div>
                    <a href="product-detail.html?id=${product.id}" class="text-sm sm:text-lg font-bold mb-1 hover:text-accent transition-colors line-clamp-1">${product.name}</a>
                    
                    <div class="mt-auto pt-3 flex items-end justify-between">
                        <div>
                            ${hasDiscount ? `
                                <div class="text-[10px] sm:text-xs text-text-secondary line-through mb-0.5">${Cart.formatCurrency(product.price)}</div>
                                <div class="text-base sm:text-xl font-bold text-danger">${Cart.formatCurrency(discountedPrice)}</div>
                            ` : `
                                <div class="text-base sm:text-xl font-bold">${Cart.formatCurrency(product.price)}</div>
                            `}
                        </div>
                        <button onclick="event.preventDefault(); Cart.add(Products.getById(${product.id}))" 
                                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-text-primary text-bg-primary flex items-center justify-center hover:scale-110 transition-transform shadow-lg add-to-cart-btn" aria-label="Add to cart"
                                ${product.stock <= 0 ? 'disabled class="opacity-50 cursor-not-allowed"' : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="sm:w-5 sm:h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
};

// Start fetching immediately
Products.init();
