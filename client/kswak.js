Questions = new Meteor.Collection("questions");
Responses = new Meteor.Collection("responses");

// everybody might as well subscribe to the questions
Meteor.subscribe("questions");

// FIX: only the teacher should subscribe to the responses
Meteor.subscribe("responses");

//GLOBAL VARIABLES
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// automatic login using certificate
Meteor.startup(function () {
  CertAuth.login();
});  


function activeQuestion() {
    return Questions.findOne({status:{$in:['active', 'frozen']}});
}

Session.set("showingAnswers", false);

//set all questions inactive
//If an id is passed, launch its question
function launchQuestion(id){
    Meteor.call('inactivate_question');
    Session.set("showingAnswers", false);

    if (id !== undefined) {
        Meteor.call('activate_question', id);
    }
}

//TO DO: FIGURE OUT HOW TO USE DATE.PARSE AND SORT BASED ON THAT
function setTime() {
    var _time = (new Date);
    var dateStr = _time.toDateString()
    var date = Date.parse(dateStr) + (_time.getHours() * 3600) + (_time.getMinutes() * 60) + _time.getSeconds();
    var minutes = _time.getMinutes();
    if (minutes < 10) { minutes = '0' + minutes; }
    var time = '' + (_time.getMonth()+1) + '/' + _time.getDate() + ' ' + _time.getHours() + ':' + minutes;
    return {'date': date, 'time': time};
}

Template.nav.helpers({
  describe: function(user) {
    return (user.profile && user.profile.name)
        || user.username
        || (user.emails.length > 0 ? user.emails[0].address : null)
        || "user #" + user._id;
  },
});

Template.question_view.events({
    'submit #student_question': function (event, template) {
        event.preventDefault();
        var question = activeQuestion();
        var choice = template.find(".clicked");
        var user_answer = choice.name;
        var question_id = question._id;
        Meteor.call('submit_response', question, user_answer);

    },

    'click #mc2': function() {
        var date_and_time = setTime();
        var date_created = date_and_time.date;
        var time = date_and_time.time;
        var question_data = {
            title: '',
            type: 'mc2',
            choices: ['A','B'],
            status: 'active',
            time: time,
            date_created: date_created
        }
        Meteor.call('insert_question', question_data, function(error, data){
            launchQuestion(data);
        });

    },

    'click #mc3': function() {
        var date_and_time = setTime();
        var date_created = date_and_time.date;
        var time = date_and_time.time;
        var question_data = {
            title: '',
            type: 'mc3',
            choices: ['A','B','C'],
            status: 'active',
            time: time,
            date_created: date_created
        }
        Meteor.call('insert_question', question_data, function(error, data){
            launchQuestion(data);
        });

    },

    'click #mc4': function() {
        var date_and_time = setTime();
        var date_created = date_and_time.date;
        var time = date_and_time.time;
        var question_data = {
            title: '',
            type: 'mc4',
            choices: ['A','B','C','D'],
            status: 'active',
            time: time,
            date_created: date_created
        }
        Meteor.call('insert_question', question_data, function(error, data){
            launchQuestion(data);
        });

    },

    'click #mc5': function() {
        var date_and_time = setTime();
        var date_created = date_and_time.date;
        var time = date_and_time.time;
        var question_data = {
            title: '',
            type: 'mc5',
            choices: ['A','B','C','D','E'],
            status: 'active',
            time: time,
            date_created: date_created
        }
        Meteor.call('insert_question', question_data, function(error, data){
            launchQuestion(data);
        });
    },

    'click #closeQuestion': function (event, template){
        Meteor.call('freeze_question', activeQuestion()._id);
    },

    'click #reopenQuestion': function (event, template){
        Meteor.call('activate_question', activeQuestion()._id);
    },

    'click #showAnswers': function (event, template){
        Session.set("showingAnswers", true);
    },

    'click #hideAnswers': function (event, template){
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
        var numResponses = Responses.find({question:question._id, answer:letters[i]}).count();
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
    if (question && user) {
        var question_id = question._id;

        var student_response = Responses.findOne({question:question_id, user:user._id});
        if (student_response) {
            var feedback = 'Your submission is: ' + student_response.answer;
        } else {
            var feedback = "Please submit your response!";
        }

        var stats = isTeacher(user) ? calcPercentages(question) : undefined;

        var options = [];
        for (i in question.choices) {
            var color = '#e5e2e2'
            //for use of identifying chosen answer
            if (student_response) {
                if (student_response.answer == [letters[i]]){
                    color = 'steelblue';
                }
            }
            var option = {
                choice: question.choices[i],
                letter: letters[i],
                color: color
            };

            if (isTeacher(user)) {
                option.voters = Responses.find({question: question_id, answer: letters[i]}).count();
                option.percent = stats[i];                
            }

            options.push(option);
        }
        return {
            isTeacher: isTeacher(user),
            question_id: question_id,
            isOpen: question.status == 'active',
            showingAnswers: Session.get("showingAnswers"),
            options: options,
            title: question.title,
            time: question.time,
            student_response: student_response,
            feedback:feedback,
            total: stats ? stats[stats.length-1] : 0,
        }
    }
}

Router.configure({
    notFoundTemplate: "restricted"
});

Router.map(function () {
    this.route('question_view', {
        path: '/',
        template: function() {
            if (!Meteor.user()) return 'not_logged_in';
            else if (!activeQuestion()) return 'no_launched_question';
            else return 'question_view';
        },
        data: function() {
            return passData(activeQuestion(), Meteor.user());}
        }
    );

});
