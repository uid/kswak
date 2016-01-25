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
        var numResponses = Responses.find({answer:question.choices[i]}).count();
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

    var question = Question.findOne();
    var user = Meteor.user();
    if (!question || !user) {
        data.isOpen = false;
        return data;
    }

    data.isOpen = question.isOpen;

    data.feedback = "Please submit your response!";
    var myResponse = Responses.findOne({username:user.username});
    var myAnswer;
    if (!myResponse) {
        Meteor.call("studentViewing", question._id);
    } else if ("answer" in myResponse) {
        myAnswer = myResponse.answer;
        data.feedback = 'Your submission is: ' + myAnswer;
    }

    function toPercent(n, d) {
        return (n*100/d).toFixed(0);
    }

    var stats = isTeacher(user) ? calcPercentages(question) : undefined;
    data.numStudents = Responses.find({}).count();
    data.numNoAnswer = Responses.find({answer:{$exists: false}}).count();
    data.percentNoAnswer = toPercent(data.numNoAnswer, data.numStudents);

    data.options = [];
    for (var i in question.choices) {
        var option = {
            choice: question.choices[i],
            wasChosen: myAnswer == [question.choices[i]],
        };

        if (isTeacher(user)) {
            option.num = Responses.find({answer: question.choices[i]}).count();
            option.percent = toPercent(option.num, data.numStudents);                
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
