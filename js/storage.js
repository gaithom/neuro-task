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
            {
                id: 1,
                title: "Finish quarterly financial report",
                description: "Include projections and analysis of Q3 results",
                priority: "high",
                dueDate: new Date().toISOString().split('T')[0],
                category: "work",
                completed: false
            },
            {
                id: 2,
                title: "Team meeting with design department",
                description: "Discuss new project requirements and timeline",
                priority: "medium",
                dueDate: new Date().toISOString().split('T')[0],
                category: "work",
                completed: false
            },
            {
                id: 3,
                title: "Send follow-up emails to clients",
                description: "Check in about project feedback",
                priority: "low",
                dueDate: new Date().toISOString().split('T')[0],
                category: "work",
                completed: true
            }
        ];
        storage.set('neurotask-tasks', defaultTasks);
    }
}

// Initialize default tasks when the script loads
initializeDefaultTasks();