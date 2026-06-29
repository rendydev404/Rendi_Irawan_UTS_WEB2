

const STORAGE_KEYS = {
    USERS: 'utsmart_users',
    SESSION: 'utsmart_session',
    TOKEN: 'utsmart_token',
    CART: 'utsmart_cart',
    ORDERS: 'utsmart_orders',
    WISHLIST: 'utsmart_wishlist',
    THEME: 'utsmart_theme'
};

const Storage = {
    // Basic Get/Set
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    remove: (key) => {
        localStorage.removeItem(key);
    },

    // Initialization
    init: () => {
        if (!Storage.get(STORAGE_KEYS.USERS)) Storage.set(STORAGE_KEYS.USERS, []);
        if (!Storage.get(STORAGE_KEYS.CART)) Storage.set(STORAGE_KEYS.CART, []);
        if (!Storage.get(STORAGE_KEYS.ORDERS)) Storage.set(STORAGE_KEYS.ORDERS, []);
        if (!Storage.get(STORAGE_KEYS.WISHLIST)) Storage.set(STORAGE_KEYS.WISHLIST, []);
        if (!Storage.get(STORAGE_KEYS.THEME)) Storage.set(STORAGE_KEYS.THEME, 'dark'); // Default dark
    }
};

// Initialize on load
Storage.init();
