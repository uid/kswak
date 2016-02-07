Question = new Meteor.Collection("question");
Responses = new Meteor.Collection("responses");

Meteor.subscribe("question");
Meteor.subscribe("responses");

// automatic login using certificate
Meteor.startup(function () {
  CertAuth.login();
});  


Template.main.helpers({
  isTeacher: function() {
    return isTeacher(Meteor.user());
  },
  showingAnswers: function() {
    return Session.get("showingAnswers");
  },
});

Template.main.events({

    'click .newQuestion': function(event) {
        var choices = $(event.target).text();
        Meteor.call('newQuestion', choices);
        Session.set("showingAnswers", false);
        $(".closeReopenQuestion").focus();
    },

    'click .studentChoice': function (event) {
        var answer = $(event.target).text().trim();
        Meteor.call('studentAnswer', Question.findOne()._id, answer);
    },

    'click .closeReopenQuestion': function (){
        var question = Question.findOne();
        if (!question.isOpen) {
            // reopening question should hide the answers first
            Session.set("showingAnswers", false);
        }
        Meteor.call('closeOrOpenQuestion', question._id, !question.isOpen);
        $(".showHideAnswers").focus();
    },

    'click .showHideAnswers': function (){
        Session.set("showingAnswers", !Session.get("showingAnswers"));
    },

    // keyboard shortcuts:
    //    2-9: start new quiz with that number of choices (if that ABC... button exists)
    //    A-I: choose an answer to the active quiz (if that letter button exists)
    'keydown': function(event) {
        var handled = false;
        var key = event.keyCode;
        var noModifiers = !event.altKey && !event.ctrlKey && !event.metaKey;
        if ((key >= 50 && key < 58) && noModifiers)  {
            // number key: 2 through 9
            var numberOfChoices = key - 48;
            $(".newQuestion").eq(numberOfChoices-2).click();
            handled = true;
        } else if ((key >= 65 && key < 74) && noModifiers) {
            // letter key: A through G
            var choice = key - 65;
            $(".studentChoice").eq(choice).click();
            handled = true;
        } else if ((key >= 37 && key <= 40) && noModifiers) {
            // arrow key: move the keyboard focus by simulating Tab or ShiftTab
            var direction = (key == 39 || key == 40) ? 1 : -1;
            var buttons = $(":button");
            var nextButtonIndex = buttons.index(event.target) + direction;
            if (nextButtonIndex < 0) nextButtonIndex = buttons.length-1;
            else if (nextButtonIndex >= buttons.length) nextButtonIndex = 0;
            buttons.eq(nextButtonIndex).focus();
        }

        if (handled) {
            event.stopPropagation();
            event.preventDefault();
        }
    },

});

Template.main.onRendered(function() {
    // give the main body the keyboard focus, to support shortcuts
    $(".main").eq(0).focus();
});

Router.map(function () {
    this.route('main', {
        path: '/',
        template: 'main',
        data: function() {
            var result = {};

            var user = Meteor.user();
            if (!user) return {};

            result.question = Question.findOne();
            if (!result.question) return result;

            var myResponse = Responses.findOne({username:user.username});
            if (!myResponse && !isTeacher(user)) {
                // tell the server that I'm looking at the question,
                // so that it will create a Response doc for my answer
                Meteor.call("studentViewing", result.question._id);
            }
            result.myAnswer = (myResponse && myResponse["answer"]);

            function toPercent(n, d) {
                return (n*100/d).toFixed(0);
            }

            result.numStudents = Responses.find({}).count();
            result.numAnswers = Responses.find({answer:{$exists: true}}).count();

            result.options = [];
            for (var i in result.question.choices) {
                var choice = result.question.choices[i];

                var option = {
                    choice: result.question.choices[i],
                    wasChosen: result.myAnswer == choice,
                };

                if (isTeacher(user)) {
                    option.num = Responses.find({answer: choice}).count();
                    option.percent = toPercent(option.num, result.numStudents);                
                }

                result.options.push(option);
            }

            return result;
        },
    });

});
