Questions = new Meteor.Collection("questions");
Responses = new Meteor.Collection("responses");

Meteor.subscribe("questions");
Meteor.subscribe("responses");

// automatic login using certificate
Meteor.startup(function () {
  CertAuth.login();
});  


function activeQuestion() {
    return Questions.findOne({isActive: true});
}


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
        var choices = $(event.target).text().split("");
        Meteor.call('newQuestion', choices);
        Session.set("showingAnswers", false);
        $(".closeReopenQuestion").focus();
    },

    'click .studentChoice': function (event) {
        var answer = $(event.target).text().trim();
        Meteor.call('studentAnswer', activeQuestion()._id, answer);
    },

    'click .closeReopenQuestion': function (){
        var question = activeQuestion();
        Meteor.call('closeOrOpenQuestion', question._id, !question.isOpen);
        Session.set("showingAnswers", false);
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
            var choice = key - 65;
            $(".studentChoice").eq(choice).click();
            handled = true;
        }

        if (handled) {
            event.stopPropagation();
            event.preventDefault();
        }
    },

});

Template.main.onRendered(function() {
    // give the first new-question button the keyboard focus, to support keyboard shortcuts
    $(".newQuestion").eq(0).focus();
});

//calculates response percentages for each answer choice
//returns array of percentages, one for each answer choice
//last index of returned array contains total number of voters
function calcPercentages(question){
    normalizedList = [];
    var total = 0;
    for ( var i =0; i< question.choices.length; i++){
        var numResponses = Responses.find({question:question._id, answer:question.choices[i]}).count();
        normalizedList.push(numResponses);
        total +=numResponses;
    }
    if (total != 0){
        normalizedList = normalizedList.map(function(x) { return (100*(x/total)).toFixed(0); })
    }
    normalizedList.push(total)
    return normalizedList;
}


function passData(question, user) {
    var data = {};

    var question = activeQuestion();
    var user = Meteor.user();
    if (!question || !user) {
        data.isOpen = false;
        return data;
    }

    data.isOpen = question.isOpen;

    var student_response = Responses.findOne({question:question._id, username:user.username});
    if (student_response) {
        data.feedback = 'Your submission is: ' + student_response.answer;
    } else {
        data.feedback = "Please submit your response!";
    }

    var stats = isTeacher(user) ? calcPercentages(question) : undefined;
    data.total = stats ? stats[stats.length-1] : 0;

    data.options = [];
    for (i in question.choices) {
        var option = {
            choice: question.choices[i],
            wasChosen: student_response && student_response.answer == [question.choices[i]],
        };

        if (isTeacher(user)) {
            option.voters = Responses.find({question: question._id, answer: question.choices[i]}).count();
            option.percent = stats[i];                
        }

        data.options.push(option);
    }

    return data;
}

Router.configure({
    notFoundTemplate: "restricted"
});

Router.map(function () {
    this.route('main', {
        path: '/',
        template: function() {
            if (!Meteor.user()) return 'not_logged_in';
            else return 'main';
        },
        data: passData
    });

});
