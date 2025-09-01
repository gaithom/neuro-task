// Storage service for handling localStorage operations
const storage = {
    // Get item from localStorage
    get: function(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error getting data from localStorage:', error);
            return null;
        }
    },

    // Set item in localStorage
    set: function(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving data to localStorage:', error);
            return false;
        }
    },

    // Remove item from localStorage
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing data from localStorage:', error);
            return false;
        }
    },

    // Clear all items from localStorage
    clear: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Initialize default tasks if none exist
function initializeDefaultTasks() {
    const existingTasks = storage.get('neurotask-tasks');
    if (!existingTasks || existingTasks.length === 0) {
        const defaultTasks = [
           
        ];
        storage.set('neurotask-tasks', defaultTasks);
    }
}

// Initialize default tasks when the script loads
initializeDefaultTasks();