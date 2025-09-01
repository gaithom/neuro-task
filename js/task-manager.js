// Task management functionality
const taskManager = {
    // Process a new task from natural language input
    processTask: function() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();
        
        if (text === '') {
            alert('Please describe your task');
            return;
        }
        
        // Simulate AI processing
        const submitButton = document.querySelector('.input-with-button button');
        const originalHtml = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>';
        submitButton.classList.add('ai-thinking');
        
        setTimeout(() => {
            // Parse natural language (simulated)
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            
            // Extract priority based on keywords
            let priority = 'medium';
            if (text.includes('urgent') || text.includes('asap') || text.includes('important')) {
                priority = 'high';
            } else if (text.includes('when you have time') || text.includes('not important')) {
                priority = 'low';
            }
            
            // Extract category based on keywords
            let category = 'work';
            if (text.includes('personal') || text.includes('family') || text.includes('home')) {
                category = 'personal';
            } else if (text.includes('exercise') || text.includes('health') || text.includes('doctor')) {
                category = 'health';
            } else if (text.includes('learn') || text.includes('study') || text.includes('read')) {
                category = 'learning';
            }
            
            // Create a new task
            const newTask = {
                id: app.state.tasks.length > 0 ? Math.max(...app.state.tasks.map(t => t.id)) + 1 : 1,
                title: text.length > 40 ? text.substring(0, 40) + '...' : text,
                description: text,
                priority: priority,
                dueDate: tomorrow.toISOString().split('T')[0],
                category: category,
                completed: false
            };
            
            app.state.tasks.push(newTask);
            app.saveTasks();
            app.renderTasks();
            app.updateStats();
            
            // Reset UI
            input.value = '';
            submitButton.innerHTML = originalHtml;
            submitButton.classList.remove('ai-thinking');
            
            // Show confirmation
            app.showNotification('Task added successfully! AI has parsed your input and set appropriate parameters.');
        }, 1500);
    },

    // Add a manual task from the form
    addManualTask: function() {
        const title = document.getElementById('task-title').value.trim();
        const description = document.getElementById('task-description').value.trim();
        const dueDate = document.getElementById('task-due-date').value;
        const priority = document.getElementById('task-priority').value;
        const category = document.getElementById('task-category').value;
        
        if (title === '') {
            alert('Please enter a task title');
            return;
        }
        
        const newTask = {
            id: app.state.tasks.length > 0 ? Math.max(...app.state.tasks.map(t => t.id)) + 1 : 1,
            title: title,
            description: description,
            priority: priority,
            dueDate: dueDate,
            category: category,
            completed: false
        };
        
        app.state.tasks.push(newTask);
        app.saveTasks();
        
        // Clear the form
        document.getElementById('task-title').value = '';
        document.getElementById('task-description').value = '';
        
        // Set tomorrow's date as default
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const yyyy = tomorrow.getFullYear();
        const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
        const dd = String(tomorrow.getDate()).padStart(2, '0');
        document.getElementById('task-due-date').value = `${yyyy}-${mm}-${dd}`;
        
        // Show dashboard
        app.showPage('dashboard');
        app.renderTasks();
        app.updateStats();
        
        app.showNotification('Task added successfully!');
    },

    // Filter tasks
    filterTasks: function() {
        app.showNotification('Open the Tasks page to filter your tasks');
        app.showPage('tasks');
    },

    // Sort tasks
    sortTasks: function() {
        // Sort tasks by due date and priority
        app.state.tasks.sort((a, b) => {
            // First, sort by completion status
            if (a.completed !== b.completed) {
                return a.completed ? 1 : -1;
            }
            
            // Then, sort by priority (high first)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            // Finally, sort by due date (earliest first)
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        app.saveTasks();
        
        if (app.state.currentPage === 'tasks') {
            app.renderAllTasks();
        } else {
            app.renderTasks();
        }
        
        app.showNotification('Tasks sorted by priority and due date.');
    }
};