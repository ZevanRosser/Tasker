$(function() {

  var doc = $(document),
      win = $(window),
      messages = {
        clearAll: "Are you sure you want to clear all your task lists?",
        removeTaskList: "Are you sure you want to remove this task list?",
        removeTask: "Are you sure you want to remove this task?"
      },
      tasker = new Tasker();

  win.on("resize arrange", function() {
    var taskLists = $("#task-container .task-list"),
        size = taskLists.eq(0).outerWidth() + 5,
        num = taskLists.length,
        winWidth = win.width(),
        cols = Math.floor(winWidth / size),
        margin = 5,
        top = 20;
    
    taskLists.css({
      left: margin,
      top: top
    });
    
    for (var i = 1; i < num; i++) {
      var pre = taskLists.eq(i - 1);
      var curr = taskLists.eq(i);
      var prePos = pre.position();
      curr.css({
        top: top,
        left: prePos.left + pre.outerWidth() + margin
      });

      if (i >= cols) {
        var above = taskLists.eq(i - cols);
        var abovePos = above.position();
        curr.css({
          left: abovePos.left,
          top: abovePos.top + above.outerHeight() + margin
        });
      }
    }
  }).trigger("arrange");

  function Tasker() {
    var self = this;
    self.elem = $("#main-ui").selectAll(self).appendTo("body");

    if (localStorage.tasker) {
      self.taskContainer.html(localStorage.tasker);
    }
    
    self.updateClearAll = function() {
      if (self.taskContainer.html() == "") {
        self.clearAll.prop("disabled", true);
      } else {
        self.clearAll.prop("disabled", false);
      }
    };
    self.updateClearAll();

    self.update = function() {
      win.trigger("arrange");
      self.updateClearAll();
    };

    self.update();

    self.save = function() {
      self.update();
      localStorage.tasker = self.taskContainer.html();
    };

    self.clearAll.click(function() {
      if (confirm(messages.clearAll)) {
        localStorage.tasker = "";
        self.taskContainer.html("");
        self.update();
      }
    });

    self.addForm.submit(function(e) {
      e.preventDefault();
      var value = $.trim(self.title.val());
      if (value.length == 0) return;
      var taskList = new TaskList(value);
      self.title.val("");
      taskList.elem.prependTo(self.taskContainer);
      win.trigger("arrange");
      self.save();
      taskList.newTask.focus();
    });
  };

  function TaskList(title) {
    this.elem = $("#task-list").selectAll(this);
    this.title.text(title);
  };
  doc.on("submit", ".add-form", function(e) {
    e.preventDefault();
    var curr = $(this),
        parent = curr.parent(),
        container = parent.find(".tasks"),
        text = curr.find(".new-task"),
        value = $.trim(text.val());
    if (value.length == 0) return;

    var task = new Task(value);
    task.elem.appendTo(container);
    task.check.trigger("evalchecks");
    text.val("");
    parent.removeClass("complete");
    tasker.save();
  }).on("click", ".close", function() {
    if (confirm(messages.removeTaskList)) {
      $(this).parent().remove();
      tasker.save();
    }
  });

  function Task(text) {
    this.elem = $("#task").selectAll(this);
    this.text.text(text);
  };
  doc.on("click evalchecks", ".check", function() {
    var curr = $(this),
        parent = curr.parent().parent(),
        taskList = parent.parent(),
        feedback = taskList.find(".feedback"),
        checks = parent.find(".check"),
        checkNum = checks.length,
        checked = 0;
    taskList.removeClass("complete");
    checks.each(function() {
      var check = $(this);
      if (check.prop("checked")) {
        checked++;
        check.attr("checked", true);
      } else {
        check.attr("checked", false);
      }
      if (checked == checkNum) {
        taskList.addClass("complete");
      }
    });
    feedback.text(checked + "/" + checkNum + " completed");
    tasker.save();
  }).on("click", ".little-btn", function() {
    if (confirm(messages.removeTask)) {
      $(this).parent().remove();
      tasker.save();
    }
  });

});