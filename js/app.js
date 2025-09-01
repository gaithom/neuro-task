// Main application controller
const app = {
    // Application state
    state: {
        tasks: [],
        currentPage: 'dashboard',
        currentFilter: 'all'
    },

    // Initialize the application
    init: function() {
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
        this.updateStats();
        
        // Set today's date as default for due date
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        document.getElementById('task-due-date').value = `${yyyy}-${mm}-${dd}`;
        
        console.log('NeuroTask initialized');
    },

    // Set up event listeners
    setupEventListeners: function() {
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuButton) {
            mobileMenuButton.addEventListener('click', function() {
                mobileMenu.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (mobileMenu && !mobileMenu.contains(e.target) && e.target !== mobileMenuButton) {
                mobileMenu.classList.remove('active');
            }
        });
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                const taskInput = document.getElementById('taskInput');
                if (taskInput) taskInput.focus();
            }
            
            if (e.key === 'Escape') {
                app.showPage('dashboard');
            }
        });
    },

    // Show the specified page
    showPage: function(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active-page');
        });
        
        // Show the requested page
        const pageElement = document.getElementById(pageId);
        if (pageElement) {
            pageElement.classList.add('active-page');
            this.state.currentPage = pageId;
            
            // Update navigation highlights
            document.querySelectorAll('.nav-active').forEach(item => {
                item.classList.remove('nav-active');
            });
            
            document.querySelectorAll(`[onclick="app.showPage('${pageId}')"]`).forEach(el => {
                el.classList.add('nav-active');
            });
            
            // Page-specific initialization
            if (pageId === 'tasks') {
                this.renderAllTasks();
            }
            
            if (pageId === 'insights') {
                this.generateFocusChart();
                this.updateAIRecommendations();
            }
        }
        
        // Close mobile menu if open
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenu) mobileMenu.classList.remove('active');
        
        // Scroll to top
        window.scrollTo(0, 0);
    },

    // Load tasks from localStorage
    loadTasks: function() {
        const savedTasks = localStorage.getItem('neurotask-tasks');
        this.state.tasks = savedTasks ? JSON.parse(savedTasks) : [];
    },

    // Save tasks to localStorage
    saveTasks: function() {
        localStorage.setItem('neurotask-tasks', JSON.stringify(this.state.tasks));
    },

    // Render tasks for the dashboard
    renderTasks: function() {
        const container = document.getElementById('tasks-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.state.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks yet. Add a task to get started!</p>
                </div>
            `;
            return;
        }
        
        // Filter tasks for today or overdue
        const today = new Date().toDateString();
        const todayTasks = this.state.tasks.filter(task => {
            const taskDate = new Date(task.dueDate).toDateString();
            return taskDate === today || !task.completed;
        }).slice(0, 5); // Show only 5 most relevant tasks
        
        if (todayTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>All tasks completed! Great job!</p>
                </div>
            `;
            return;
        }
        
        todayTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            container.appendChild(taskElement);
        });
    },

    // Render all tasks for the tasks page
    renderAllTasks: function() {
        const container = document.getElementById('all-tasks-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.state.tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-tasks"></i>
                    <p>No tasks yet. Add a task to get started!</p>
                </div>
            `;
            return;
        }
        
        let tasksToRender = this.state.tasks;
        
        // Apply filters
        if (this.state.currentFilter === 'active') {
            tasksToRender = this.state.tasks.filter(task => !task.completed);
        } else if (this.state.currentFilter === 'completed') {
            tasksToRender = this.state.tasks.filter(task => task.completed);
        } else if (this.state.currentFilter === 'high') {
            tasksToRender = this.state.tasks.filter(task => task.priority === 'high');
        } else if (this.state.currentFilter === 'today') {
            const today = new Date().toDateString();
            tasksToRender = this.state.tasks.filter(task => {
                const taskDate = new Date(task.dueDate).toDateString();
                return taskDate === today;
            });
        }
        
        if (tasksToRender.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No tasks match your filter criteria.</p>
                </div>
            `;
            return;
        }
        
        tasksToRender.forEach(task => {
            const taskElement = this.createTaskElement(task, true);
            container.appendChild(taskElement);
        });
    },

    // Create a DOM element for a task
    createTaskElement: function(task, showActions = true) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item priority-${task.priority}`;
        taskDiv.dataset.id = task.id;
        
        const priorityClass = task.priority === 'high' ? 'priority-high' : 
                            task.priority === 'medium' ? 'priority-medium' : 
                            'priority-low';
        
        const priorityText = task.priority === 'high' ? 'High Priority' : 
                           task.priority === 'medium' ? 'Medium Priority' : 
                           'Low Priority';
        
        // Format due date
        const dueDate = new Date(task.dueDate);
        const now = new Date();
        const isOverdue = dueDate < now && !task.completed;
        const isToday = dueDate.toDateString() === now.toDateString();
        
        let dueText = '';
        if (isOverdue) {
            dueText = `Overdue: ${dueDate.toLocaleDateString()}`;
        } else if (isToday) {
            dueText = 'Today';
        } else {
            dueText = dueDate.toLocaleDateString();
        }
        
        taskDiv.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="app.toggleTask(${task.id})">
            <div class="task-content">
                <div class="task-title ${task.completed ? 'completed' : ''}">${task.title}</div>
                <div class="task-description">${task.description}</div>
                <div class="task-meta">
                    <span class="task-priority ${priorityClass}">${priorityText}</span>
                    <span class="task-due ${isOverdue ? 'overdue' : ''}">
                        <i class="far fa-clock"></i> ${dueText}
                    </span>
                    <span class="task-category">${task.category}</span>
                </div>
            </div>
        `;
        
        if (showActions) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';
            actionsDiv.innerHTML = `
                <button onclick="app.editTask(${task.id})">
                    <i class="fas fa-pencil-alt"></i>
                </button>
                <button class="delete" onclick="app.deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            taskDiv.appendChild(actionsDiv);
        }
        
        return taskDiv;
    },

    // Toggle task completion status
    toggleTask: function(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            
            if (this.state.currentPage === 'tasks') {
                this.renderAllTasks();
            } else {
                this.renderTasks();
            }
            this.updateStats();
        }
    },

    // Delete a task
    deleteTask: function(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            
            if (this.state.currentPage === 'tasks') {
                this.renderAllTasks();
            } else {
                this.renderTasks();
            }
            this.updateStats();
            
            this.showNotification('Task deleted successfully');
        }
    },

    // Edit a task
    editTask: function(taskId) {
        const task = this.state.tasks.find(t => t.id === taskId);
        if (task) {
            // Populate the form
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description;
            document.getElementById('task-due-date').value = task.dueDate;
            document.getElementById('task-priority').value = task.priority;
            document.getElementById('task-category').value = task.category;
            
            // Remove the task from the list
            this.state.tasks = this.state.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            
            // Show the add task page
            this.showPage('add-task');
            
            this.showNotification('Edit your task below');
        }
    },

    // Update statistics
    updateStats: function() {
        const completedCount = this.state.tasks.filter(t => t.completed).length;
        const totalCount = this.state.tasks.length;
        const productivityScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const focusTime = Math.round(completedCount * 0.5 * 10) / 10;
        
        const completedElement = document.getElementById('completed-count');
        const scoreElement = document.getElementById('productivity-score');
        const timeElement = document.getElementById('focus-time');
        
        if (completedElement) completedElement.textContent = completedCount;
        if (scoreElement) scoreElement.textContent = `${productivityScore}%`;
        if (timeElement) timeElement.textContent = `${focusTime}h`;
        
        // Update completion bar
        const completionBar = document.getElementById('completion-bar');
        const completionText = document.getElementById('completion-text');
        if (completionBar && completionText) {
            completionBar.style.width = `${productivityScore}%`;
            completionText.textContent = `You complete ${productivityScore}% of tasks on time`;
        }
        
        // Update AI analysis
        const analysisElement = document.getElementById('ai-analysis');
        if (analysisElement) {
            if (totalCount === 0) {
                analysisElement.textContent = 'You have no tasks yet. Add some tasks to get AI insights!';
            } else if (completedCount === 0) {
                analysisElement.textContent = 'You have tasks to complete. Try focusing on one task at a time for better productivity.';
            } else if (productivityScore < 50) {
                analysisElement.textContent = 'You\'ve completed some tasks. Try using time blocking to improve your focus.';
            } else if (productivityScore < 80) {
                analysisElement.textContent = 'Good progress! You\'re more than halfway through your tasks.';
            } else {
                analysisElement.textContent = 'Great job! You\'ve been productive. Keep up the good work!';
            }
        }
    },

    // Generate focus time chart
    generateFocusChart: function() {
        const chart = document.getElementById('focus-chart');
        if (!chart) return;
        
        chart.innerHTML = '';
        
        // Generate random focus data for the week
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 0; i < 7; i++) {
            const height = Math.floor(Math.random() * 120) + 60; // Between 60 and 180
            
            const barContainer = document.createElement('div');
            barContainer.className = 'chart-bar';
            
            const barValue = document.createElement('div');
            barValue.className = 'chart-bar-value';
            barValue.style.height = `${height}px`;
            
            const barLabel = document.createElement('div');
            barLabel.className = 'chart-bar-label';
            barLabel.textContent = days[i];
            
            barContainer.appendChild(barValue);
            barContainer.appendChild(barLabel);
            
            chart.appendChild(barContainer);
        }
    },

    // Update AI recommendations
    updateAIRecommendations: function() {
        const container = document.getElementById('ai-recommendations');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (this.state.tasks.length === 0) {
            container.innerHTML = `
                <div class="recommendation-item">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="recommendation-content">
                        <h4>Add tasks to get personalized recommendations</h4>
                        <p>I can help you prioritize and schedule your tasks once you add them.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        // Count tasks by priority
        const highPriorityCount = this.state.tasks.filter(t => t.priority === 'high' && !t.completed).length;
        const mediumPriorityCount = this.state.tasks.filter(t => t.priority === 'medium' && !t.completed).length;
        const lowPriorityCount = this.state.tasks.filter(t => t.priority === 'low' && !t.completed).length;
        
        // Check for overdue tasks
        const now = new Date();
        const overdueTasks = this.state.tasks.filter(task => {
            const dueDate = new Date(task.dueDate);
            return dueDate < now && !task.completed;
        });
        
        // Generate recommendations based on task state
        const recommendations = [];
        
        if (overdueTasks.length > 0) {
            recommendations.push({
                title: "Address overdue tasks",
                content: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider completing these first.`
            });
        }
        
        if (highPriorityCount > 0) {
            recommendations.push({
                title: "Focus on high-priority tasks",
                content: `You have ${highPriorityCount} high-priority task${highPriorityCount > 1 ? 's' : ''}. Schedule time for these important tasks.`
            });
        }
        
        if (mediumPriorityCount > 3) {
            recommendations.push({
                title: "Break down medium-priority tasks",
                content: "You have several medium-priority tasks. Consider breaking them into smaller subtasks."
            });
        }
        
        if (lowPriorityCount > 5) {
            recommendations.push({
                title: "Review low-priority tasks",
                content: "You have many low-priority tasks. Consider delegating or removing some if they're not essential."
            });
        }
        
        // Default recommendation if no specific ones
        if (recommendations.length === 0) {
            recommendations.push({
                title: "Maintain your productivity",
                content: "Your task load looks manageable. Keep up the good work and focus on one task at a time."
            });
        }
        
        // Add time management recommendation
        const completedCount = this.state.tasks.filter(t => t.completed).length;
        const totalCount = this.state.tasks.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        if (completionRate < 50) {
            recommendations.push({
                title: "Improve your completion rate",
                content: "Try using the Pomodoro technique (25 minutes focused work, 5 minutes break) to boost productivity."
            });
        }
        
        // Render recommendations
        recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            recElement.innerHTML = `
                <div class="ai-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.content}</p>
                </div>
            `;
            
            container.appendChild(recElement);
        });
    },

    // Show a notification
    showNotification: function(message) {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(el => el.remove());
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    },

    // Filter tasks
    showAllTasks: function() {
        this.state.currentFilter = 'all';
        this.renderAllTasks();
    },
    
    filterTasksByStatus: function(status) {
        this.state.currentFilter = status;
        this.renderAllTasks();
    },
    
    filterTasksByPriority: function(priority) {
        this.state.currentFilter = priority;
        this.renderAllTasks();
    },
    
    filterTasksByDate: function(date) {
        this.state.currentFilter = date;
        this.renderAllTasks();
    }
};

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    app.init();
});