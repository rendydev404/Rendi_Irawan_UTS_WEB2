/**
 * UTSmart - Wishlist Logic
 */

const Wishlist = {
    init: () => {
        // Initialization
    },

    getItems: () => {
        const itemIds = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        // Map IDs to actual product objects from Products module
        if (typeof Products !== 'undefined' && Products.allProducts.length > 0) {
            return itemIds.map(id => Products.getById(id)).filter(p => p !== undefined);
        }
        return [];
    },

    remove: (productId) => {
        let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        wishlist = wishlist.filter(id => id !== productId);
        Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
        window.dispatchEvent(new Event('wishlist-updated'));
    }
};

window.addEventListener('toggle-wishlist', (e) => {
    // Basic implementation is in app.js, this is just for the specific wishlist page to re-render
    setTimeout(() => {
        window.dispatchEvent(new Event('wishlist-updated'));
    }, 100);
});
