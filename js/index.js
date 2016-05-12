'use strict';

$(document).ready(function() {

    // Create todo storage array
    var todoStorage = {
        "todoList": []
    };

    var todoContainer = $("#todo-container");

    // Initialize and populate system
    initializePopulate();

    $("#submit").click(function(e) {
        var content = $("#newTodoContent");
        storeTodo(new Todo(content.val()));
        content.val("");
    });

    $("#cancel").click(function(e) {
        $("#newTodoContent").val("");
    });


    // Initializes and populates the system
    function initializePopulate() {
        // If storage exists, assign it to "todoList" array; if it doesn't, create it
        var storage = window.localStorage.getItem("todoStorage");
        if (storage === null) {
            setStorage();
        } else {
            todoStorage = JSON.parse(storage);
            todoStorage.todoList.forEach(function(todo, idx, arr) {
                 arr[idx] = new Todo(todo.content);
            });
            renderTodos();
        }
    }

    // Render todos to page
    function renderTodos() {
        todoContainer.empty();
        todoStorage.todoList.forEach(function(todo){
           todoContainer
                .append(
                    $(todo.render()).swipeToDismissCard(
                            {"onRemoved": function(el) {removeTodo(new Todo(el.text()));}}
                    )
                );
        });
    }

    // Store Todos
    function storeTodo(newTodo) {
        // Add new todo to storage, set localStorage, and rerender todo list
        newTodo.addToStorage();
        setStorage();
        renderTodos();
    }

    // Remove Todos
    function removeTodo(removeTodo) {
        // Remove todo to storage, set localStorage, and rerender todo list
        removeTodo.removeFromStorage();
        setStorage();
        renderTodos();
    }

    // Set storage convenience function
    function setStorage() {
        window.localStorage.setItem("todoStorage", JSON.stringify(todoStorage));
    }

    // Todo Object
    function Todo(content) {
        this.content = content;
        // Renders todo's content into an HTML div
        this.render = function() {
            return "<div class=\"todo\">" + this.content + "</div>";
        };
        // Adds todo to storage object
        this.addToStorage = function() {
            todoStorage.todoList.push(this);
        };
        // Removes todo from storage object
        this.removeFromStorage = function() {
            var self = this;
            var todoList = todoStorage.todoList.filter(function (todo) {
                return todo.content != self.content;
            });
            todoStorage.todoList = todoList;
        };
    }
});

