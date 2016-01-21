Questions = new Meteor.Collection("questions");
Responses = new Meteor.Collection("responses");

// everybody might as well subscribe to the questions
Meteor.subscribe("questions");

// FIX: only the teacher should subscribe to the responses
Meteor.subscribe("responses");

//GLOBAL VARIABLES
var numChoices = 5;
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// automatic login using certificate
Meteor.startup(function () {
  CertAuth.login();
});  

function activeQuestion() {
    return Questions.findOne({status:{$in:['active', 'frozen']}});
}

//set all questions inactive
//If an id is passed, launch its question
function launchQuestion(id){
    Meteor.call('inactivate_question');

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

function csvExport(questionId) {
    var responses = [];
    for (var mm=0; mm<Responses.find().fetch().length; mm++){
        if (Responses.find().fetch()[mm].question == questionId){
            var userId = Responses.find().fetch()[mm].user;
            var answer = Responses.find().fetch()[mm].answer;
            var studentUser = Meteor.users.findOne({_id:userId}).username;
            responses.push({user:studentUser, response: answer})
        }
    }
    var csv_response = JSON2CSV(responses);
    return csv_response;
}

function JSON2CSV(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;

    var str = '';
    var line = '';

    if ($("#labels").is(':checked')) {
        var head = array[0];
        if ($("#quote").is(':checked')) {
            for (var index in array[0]) {
                var value = index + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[0]) {
                line += index + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }

    for (var i = 0; i < array.length; i++) {
        var line = '';

        if ($("#quote").is(':checked')) {
            for (var index in array[i]) {
                var value = array[i][index] + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[i]) {
                line += array[i][index] + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;
    
}

if (Meteor.isClient) {
    Template.nav.helpers({
        launched_question: function() {
            var b;
            activeQuestion() ? b = true : b = false;
            return b;
        },
    });

    Template.question_view.helpers({
        isTeacher: function() {
            return isTeacher(Meteor.user());
        },
    });

    UI.registerHelper('getStatusColor', function() {
        return Session.get('getStatusColor');
    });

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

        'click #change_mode': function (event, template){
            var status = Questions.findOne(this.question_id).status;
            if ( status == 'active'){
                Meteor.call('freeze_question', this.question_id);
            }else if( status == 'frozen') {
                Meteor.call('activate_question',this.question_id)
            }else{
                launchQuestion();
                Meteor.call('activate_question',this.question_id);
            }
        },



    })

}

//calculates response percentages for each answer choice
//returns array of percentages, one for each answer choice
//last index of returned array contains total number of voters
var calcPercentages =function(question){
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


var passData = function(question, user) {
    if (question && user) {
        var question_id = question._id;
        if (question.status == 'active') {
            var status_comment = 'Submission is open';
            var statusColor = 'green';
            var overlay = "overlay closed";
        } else {
            var status_comment = 'Submission is closed';
            var statusColor = '#ef6d86';
            var overlay = "overlay open";
        }

        var student_response =  Responses.findOne({question:question_id, user:user._id});
        if (student_response) {
            var feedback = 'Your submission is: ' + student_response.answer;
        } else if (!isTeacher(user)) {
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
            options: options,
            title: question.title,
            time: question.time,
            student_response: student_response,
            feedback:feedback,
            overlay_option: overlay,
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
            if (Meteor.user()) {
                if (activeQuestion()) {
                    return 'question_view';
                } else {
                    return 'no_launched_question';
                }
            }
            else {
                return 'not_logged_in';
            }
        },
        data: function() {
            return passData(activeQuestion(), Meteor.user());}
        }
    );

});
