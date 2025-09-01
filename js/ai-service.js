// AI service functionality
const aiService = {
    // Analyze task
    analyzeTask: function() {
        if (app.state.tasks.length === 0) {
            app.showNotification('Add some tasks first to analyze');
            return;
        }
        
        app.showNotification('AI is analyzing your tasks and will provide recommendations...');
        
        setTimeout(() => {
            app.showPage('insights');
        }, 1000);
    },
    
    // Suggest subtasks
    suggestSubtasks: function() {
        const input = document.getElementById('taskInput');
        if (input.value.trim() === '') {
            app.showNotification('Describe a task first to get subtask suggestions');
            return;
        }
        
        app.showNotification('AI suggests breaking this task into smaller subtasks for better manageability.');
        
        // Auto-populate with example subtasks
        setTimeout(() => {
            if (!input.value.includes('Subtasks:')) {
                input.value += '\n\nSubtasks:\n- Research\n- Draft outline\n- Write first section\n- Review and edit';
                app.showNotification('I\'ve added some suggested subtasks. Feel free to modify them!');
            }
        }, 800);
    },
    
    // Suggest deadline
    suggestDeadline: function() {
        const input = document.getElementById('taskInput');
        if (input.value.trim() === '') {
            app.showNotification('Describe a task first to get deadline suggestions');
            return;
        }
        
        // Suggest a deadline based on task content
        let daysToAdd = 7; // Default: 1 week
        
        if (input.value.includes('today') || input.value.includes('asap')) {
            daysToAdd = 0;
        } else if (input.value.includes('tomorrow')) {
            daysToAdd = 1;
        } else if (input.value.includes('next week')) {
            daysToAdd = 7;
        } else if (input.value.includes('month')) {
            daysToAdd = 30;
        }
        
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + daysToAdd);
        const formattedDate = deadline.toLocaleDateString();
        
        app.showNotification(`AI suggests a deadline of ${formattedDate} for this task based on your description.`);
    },
    
    // Prioritize tasks
    prioritizeTasks: function() {
        if (app.state.tasks.length === 0) {
            app.showNotification('Add some tasks first to prioritize');
            return;
        }
        
        app.showNotification('AI has reprioritized your tasks based on deadlines and importance.');
        
        // Simulate prioritization
        app.state.tasks.forEach(task => {
            // If task has "urgent" in title, make it high priority
            if (task.title.toLowerCase().includes('urgent') && task.priority !== 'high') {
                task.priority = 'high';
            }
            
            // If task is overdue, make it high priority
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            if (dueDate < now && !task.completed && task.priority !== 'high') {
                task.priority = 'high';
            }
        });
        
        app.saveTasks();
        
        if (app.state.currentPage === 'tasks') {
            app.renderAllTasks();
        } else {
            app.renderTasks();
        }
        
        app.showNotification('Tasks have been reprioritized successfully!');
    },
    
    // Suggest labels
    suggestLabels: function() {
        const input = document.getElementById('taskInput');
        if (input.value.trim() === '') {
            app.showNotification('Describe a task first to get label suggestions');
            return;
        }
        
        // Suggest labels based on content
        let labels = [];
        
        if (input.value.includes('work') || input.value.includes('office') || input.value.includes('project')) {
            labels.push('work');
        }
        
        if (input.value.includes('home') || input.value.includes('family') || input.value.includes('personal')) {
            labels.push('personal');
        }
        
        if (input.value.includes('health') || input.value.includes('exercise') || input.value.includes('doctor')) {
            labels.push('health');
        }
        
        if (input.value.includes('learn') || input.value.includes('study') || input.value.includes('read')) {
            labels.push('learning');
        }
        
        if (labels.length === 0) {
            labels = ['work', 'important'];
        }
        
        app.showNotification(`AI suggests adding labels: ${labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)).join(', ')}`);
    },
    
    // Suggest today's work
    suggestTodayWork: function() {
        if (app.state.tasks.length === 0) {
            app.showNotification('Add some tasks first to get suggestions');
            return;
        }
        
        // Find high priority tasks for today
        const today = new Date().toDateString();
        const todayTasks = app.state.tasks.filter(task => {
            const taskDate = new Date(task.dueDate).toDateString();
            return taskDate === today && !task.completed;
        });
        
        if (todayTasks.length > 0) {
            const taskList = todayTasks.map(t => t.title).join(', ');
            app.showNotification(`Based on your schedule, you should work on: ${taskList}`);
        } else {
            // Find the most urgent task
            const urgentTask = app.state.tasks.filter(t => !t.completed)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];
            
            if (urgentTask) {
                app.showNotification(`Based on your schedule, you should work on "${urgentTask.title}" first today.`);
            } else {
                app.showNotification('You have no pending tasks. Great job!');
            }
        }
    },
    
    // Generate report
    generateReport: function() {
        if (app.state.tasks.length === 0) {
            app.showNotification('Add some tasks first to generate a report');
            return;
        }
        
        app.showNotification('Generating your weekly productivity report...');
        
        setTimeout(() => {
            app.showPage('insights');
        }, 1000);
    },
    
    // Prioritize all tasks
    prioritizeAllTasks: function() {
        if (app.state.tasks.length === 0) {
            app.showNotification('Add some tasks first to prioritize');
            return;
        }
        
        app.showNotification('AI has reprioritized all your tasks based on deadlines and importance.');
        
        // Simulate intelligent prioritization
        const now = new Date();
        
        app.state.tasks.forEach(task => {
            const dueDate = new Date(task.dueDate);
            const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
            
            if (daysUntilDue < 0) {
                task.priority = 'high'; // Overdue tasks are high priority
            } else if (daysUntilDue <= 2) {
                task.priority = 'high'; // Due in 2 days
            } else if (daysUntilDue <= 7) {
                task.priority = 'medium'; // Due in a week
            } else {
                task.priority = 'low'; // Due later
            }
        });
        
        app.saveTasks();
        
        if (app.state.currentPage === 'tasks') {
            app.renderAllTasks();
        } else {
            app.renderTasks();
        }
        
        app.showNotification('All tasks have been reprioritized successfully!');
    }
};