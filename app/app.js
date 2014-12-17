'use strict';

// Declare app level module which depends on views, and components
angular.module('todoApp', [
  'ui.router',
  'templates-app',
  'ngAria',
  'angularMoment',
  'ngSanitize'
])

    .controller("ToDoController", function ToDoController(){
      var toDoCtrl = this;

      var model = {
        user: "Adam",
        items: [{ action: "Buy Flowers", done: false },
          { action: "Get Shoes", done: false },
          { action: "Collect Tickets", done: true },
          { action: "Call Joe", done: false }]
      };

      toDoCtrl.todo = model;
    })

;
