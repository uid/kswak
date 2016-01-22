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
    },

    'click .studentChoice': function (event) {
        var answer = $(event.target).text().trim();
        Meteor.call('studentAnswer', activeQuestion()._id, answer);
    },

    'click #closeQuestion': function (){
        Meteor.call('closeOrOpenQuestion', activeQuestion()._id, false);
    },

    'click #reopenQuestion': function (){
        Meteor.call('closeOrOpenQuestion', activeQuestion()._id, true);
        Session.set("showingAnswers", false);
    },

    'click #showAnswers': function (){
        Session.set("showingAnswers", true);
    },

    'click #hideAnswers': function (){
        Session.set("showingAnswers", false);
    },

})

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
