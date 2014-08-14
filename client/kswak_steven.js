Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Responses = new Meteor.Collection("responses");
responsesHandle = Meteor.subscribe("responses");
AccountsTest = new Meteor.Collection("accountstest");

//if true, homepage immediately directs user to script to log in.
var automatic_signin = false; //forces certs. do not use for debug, it's annoying.

//TODO: THIS VARIABLE NEEDS TO BE FLIPPED ON LOGOUT!!!
var scriptURL = 'https://sarivera.scripts.mit.edu:444/auth.php';
var awesomeList = ['GETTING THE AWESOME READY', 'LOGGING ON', 'HOLD ON TO YOUR PANTS, HERE COMES KSWAK', 'SO MUCH KSWAK, SO LITTLE TIME', 'ARE YOU KSWAK FOR THIS?', 'KSWAK: A WINNER\'S BREAKFAST', 'ANALYZING CERTIFICATE', 'SYNTHESIZING K\'S', 'GATHERING INGREDIENTS FOR A KSWAK', 'KSWAKIN\' ALL DAY', 'KSWAK: GOOD FOR YOUR BONES', 'PUTTING THE K IN KLICKER', 'klicker spelled with a k'];



//GLOBAL VARIABLES
var choices = ['choice1','choice2','choice3','choice4','choice5'];
var letters = ['A', 'B', 'C', 'D', 'E'];
var alert = new Audio('/sfx/alert_tone_01.mp3');

//set all questions inactive
//If an id is passed, launch its question
function launchQuestion(id){
    Meteor.call('inactivate_question');

    if (typeof id != undefined){
        Meteor.call('activate_question', id);
    }
    Router.go('/teacher/home');
}

function setTime() {
    var _time = (new Date);
    var time = '' + (_time.getMonth()+1) + '/' + _time.getDate() + ' ' + _time.getHours() + ':' + _time.getMinutes();
    return time;
}

function send_to_scripts() {
    var current_url = document.URL;
    var parts = current_url.split("/");
    var query = '?' + parts[2] + '/';
    return query;
}

if (Meteor.isClient) {
    Template.nav.helpers({
        isTeacher: function() {
            if (Meteor.user()) {
                if (Meteor.user().profile['role'] == 'teacher') {
                    return true;
                }
            }
            else {
                return false;
            }
        },
        launched_question: function() {
            var b;
            (Questions.findOne({status:{$in:['active', 'frozen']}}) != undefined) ? b = true : b = false;
            return b;
        },
    });

    Template.login.helpers({
        loggingInMessage: function() {
            var rand = Math.random();
            return awesomeList[Math.floor(rand * awesomeList.length)]
        }
    });

    Session.set('statusColor', '#ef6d86');

    UI.registerHelper('getStatusColor', function() {
        //console.log('in getStatusColor, color: ' + Session.get('statusColor'));
        return Session.get('statusColor');
    });

    Template.dev_home.helpers({
        questions: function() {
            return Questions.find();
        }
    });

    Template.teacher_summary.helpers({
        questions: function() {
            return Questions.find();
        }
    });

    Template.nav.events({
        'click .cert_link': function() {
            var query = send_to_scripts();
            window.location = scriptURL + query;
        }
    });

    Template.please_login.events({
        'click .cert_link': function() {
            var query = send_to_scripts();
            window.location = scriptURL + query;
        }
    });

    Template.new.events({
        'click #tf': function(event, template) {
            var time = setTime();
            var question_data = {
                title: '',
                type: 'tf',
                choice1: 'True',
                choice2: 'False',
                choice3: '',
                choice4: '',
                choice5: '',
                status: 'active',
                time: time
            }
            console.log('time data: ' + question_data.time)
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });

        },

        'click #mc2': function() {
            var time = setTime();
            var question_data = {
                title: '',
                type: 'mc2',
                choice1: 'A',
                choice2: 'B',
                choice3: '',
                choice4: '',
                choice5: '',
                status: 'active',
                time: time
            }
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });

        },

        'click #mc3': function() {
            var time = setTime();
            var question_data = {
                title: '',
                type: 'mc3',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: '',
                choice5: '',
                status: 'active',
                time: time
            }
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });

        },

        'click #mc4': function() {
            var time = setTime();
            var question_data = {
                title: '',
                type: 'mc4',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: 'D',
                choice5: '',
                status: 'active',
                time: time
            }
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });

        },

        'click #mc5': function() {
            var time = setTime();
            var question_data = {
                title: '',
                type: 'mc5',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: 'D',
                choice5: 'E',
                status: 'active',
                time: time,
            }
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });
        },

        'submit form': function (event, template) {
            event.preventDefault();
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");

            var time = setTime();
            var question_data = {
                title: title.value,
                type: 'custom',
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                choice5: choice5.value,
                status: 'active',
                time: time
            }


            //reset fields
            title.value = "";
            choice1.value = "";
            choice2.value = "";
            choice3.value = "";
            choice4.value = "";
            choice5.value = "";
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });

        }
  });


    Template.teacher_question_view.events({
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

        //Any question is editable no matter if it is active or not
        'click #edit': function (event, template){
            Session.set("editing", this.question_id);
            /*var question = Session.get('editing');
            if (question.status == 'active') {
                question.status = 'frozen';
            }*/
            Router.go('/teacher/edit')
        },

        'click #teacher_home_go_to_new': function (event, template) {
            Router.go('/teacher/new');
        },
        'click #viewPrivate': function (event, template){
        	Router.go('/teacher/private/' + this.question_id)
        }
    })

	Template.teacher_question_private.events({
		'click #backToProjector': function (event, template){
			Router.go('/teacher/' + this.questionData.question_id)
		}
	})

    Template.teacher_summary.events({
        'change [name="launch"]': function (event, template){
            Meteor.call('inactivate');
            var selectionBox = event.target.parentElement.id;
            Meteor.call('activate', this._id)
        },
        'click .delete': function (event, template){
        	var confirm = window.confirm("You are about to delete the question created at " + this.time + ". Do you want to continue?")
        	if (confirm){
        		//Remove responses of this question
	            Meteor.call('remove_responses', this._id)

	            //Remove this question itself
	            Meteor.call('remove_question', this._id);
        	}

        },
        'click #deleteAll':function (event, template){
            Questions.find({status:'inactive'}).forEach(function(question){
                Meteor.call('remove_question', question._id);
                Meteor.call('remove_responses', question._id);
            });
        },
        'click #inactivateAll': function(event, template){
            launchQuestion()
        },
        'click #summary_go_to_new': function(event, template) {
            Router.go('/teacher/new');
        }
    })

    Template.teacher_edit.events({
        'click #cancel': function(event, template){
            Router.go('/teacher/home')

        },
        'click #save': function(event, template){
            var question = Session.get('editing');
            //Remove responses which are already submitted for the question
            Meteor.call('remove_responses', question);

            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");

            Meteor.call('update_question', question, title.value, choice1.value,choice2.value, choice3.value, choice4.value, choice5.value)

            if (question.status == 'active'){
                Router.go('/teacher/home')
            }else{
                Router.go('/teacher/summary')
            }
        },

        'click #save_launch': function(event, template){
            var question = Session.get('editing');
            //Remove responses which are already submitted for the question
            Meteor.call('remove_responses', question)

            //disable current launched question
            launchQuestion();
            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");

            Meteor.call('update_question', question, title.value, choice1.value,choice2.value, choice3.value, choice4.value, choice5.value);
            Meteor.call('activate_question', question);
            Router.go('/teacher/home')
        }
    })

    Template.question_view.rendered = function() {
        alert.play();
    }

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            event.preventDefault();
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});

            var choice = template.find(".clicked");
            var user_answer = choice.name;
            if (question.type == 'custom') { user_answer = choice.name };
            var question_id = question._id;
            Meteor.call('submit_response', question, user_answer);

        }
    })

    Template.teacher_control.events({
        'click #add_teacher_submit': function(event, template){
            var nameString = template.find('input[name=addingTeacher]').value;
            var tempNameList = nameString.split(","); //return an array
            template.find('input[name=addingTeacher]').value = "";
            Meteor.call('add_teacher', tempNameList, Meteor.user());
        },
        'click .deleteTeacher': function(event, template){
        	var delUser = this.username;
        	var confirm = window.confirm("You are about to delete " + delUser + " from the teacher's list. Do you want to continue?");
        	if (confirm){
            	if (delUser != Meteor.user().username){
                Meteor.call('remove_teacher', delUser, Meteor.user());
            	}
        	}
        }
    })
}




if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        //certificate auth should be here eventually
    });
}


var calcPercentages =function(question){
    normalizedList = [];
    var total = 0;
    for ( var i =0; i< choices.length; i++){
        if (question[choices[i]] != ''){
            var numResponses = Responses.find({question:question._id, answer:letters[i]}).count();
            normalizedList.push(numResponses);
            total +=numResponses;
        }else{
            normalizedList.push(0);
        }
    }
    if (total != 0){
        normalizedList = normalizedList.map(function(x) { return (100*(x/total)).toFixed(0); })
    }
    normalizedList.push(total)
    return normalizedList;
}


var passData_student = function(question, user) {
    if (question != undefined) {
        var question_id = question._id;
        if (question.status == 'active') {
            var status_comment = 'Submission is open';
            var overlay = "overlay closed";
        } else {
            var status_comment = 'Submission is closed';
            var overlay = "overlay open";
        }

        if (status_comment == 'Submission is open') {
            Session.set('statusColor', 'green');
        } else if (status_comment == 'Submission is closed') {
            Session.set('statusColor', '#ef6d86');
        }

        var student_response =  Responses.findOne({question:question_id, user:user._id});
        if (student_response != undefined){
            var feedback = 'Your submission is: ' + student_response.answer;
        } else {
            var feedback = "Please submit your response!";
        }
        var options = [];
        for (i in choices) {
            var color = '#e5e2e2'
            //for use of identifing chosen answer
            if (student_response != undefined){
                if (student_response.answer == [letters[i]]){
                    color = 'steelblue';
                }
            }
            if (question[choices[i]] != ''){
                options.push(
                {
                    choice: question[choices[i]],
                    letter: letters[i],
                    color: color
                })
            }
        }
        return {
            question_id: question_id,
            status_comment: status_comment,
            options: options,
            title: question.title,
            time: question.time,
            student_response: student_response,
            feedback:feedback,
            overlay_option: overlay
        }
    }
}

var passData = function(question, user) {
    if (question != undefined) {
        var question_id = question._id;
        if (question.status == 'active') {
            var status_comment = 'This question is live'
            var status_control = 'To Freeze';
        } else if(question.status == 'frozen') {
            var status_control = 'To Activate';
            var status_comment = 'This question is live and FROZEN'
        } else{
            var status_control = 'to activate';
            var status_comment = 'This question is inactive'
        }

        if (status_comment == 'This question is live') {
            Session.set('statusColor', 'green');
        } else if (status_comment == 'This question is live and FROZEN') {
            Session.set('statusColor', '#ef6d86');
        } else {
            Session.set('statusColor', '#ef6d86');
        }

        var stats = calcPercentages(question) //returns array with total num votes at index 0 and answer choices in order from index 1 onwards
        var options = [];
        for (i in choices) {
            if (question[choices[i]] != ''){
                options.push(
                {
                    choice: question[choices[i]],
                    voters: Responses.find({question: question_id, answer: letters[i]}).count(),
                    percent: stats[i],
                })
            }
        }
        return {
            question_id: question_id,
            status_comment: status_comment,
            status_control: status_control,
            options: options,
            title: question.title,
            time: question.time,
            total: stats[stats.length-1],
        }
    }
}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
        template: function() {
            if (automatic_signin && !Meteor.user()) {
                var query = send_to_scripts();
                console.log(query);
                window.location = scriptURL + query;
            }
            else if (Meteor.user()) {
                if (Meteor.user().profile.role == 'student') {
                    Router.go('question_view');
                }
                else if (Meteor.user().profile.role == 'teacher') {
                    Router.go('teacher_home');
                }
            }
            else {
                Router.go('question_view'); //this redirects to a sign in page
            }
        }
    });

    this.route('dev_home', {
        path: '/dev_home',
    });

    this.route('login', {
        path: '/login/:encrypted_info',
        waitOn: function() {
            return Meteor.subscribe("accountstest")
        },
        data: function() {
            var password = '';

            function callback(dataz) {
                var username = dataz[0];
                var password = dataz[1];
                Meteor.loginWithPassword(username, password);
                user_signed_in = true;
                setTimeout(function() { $('.loading').fadeOut(500, function() { Router.go('home'); })}, 500);
            }

            var sneakysneaky = this.params.encrypted_info;
            var vals = sneakysneaky.split('&');
            var encrypted_username = vals[0];
            password = vals[1];
            var usernameAndLogin = Meteor.call('kswak_login', encrypted_username, password,
                                                                   function(err, data) {
                                                                       callback(data);
                                                                   });
        },
    });

    this.route('teacher_home', {
        path: 'teacher/home',
        template: function() {
//            if (Questions.findOne({status:{$in:['active', 'frozen']}}) == undefined){
//                return 'new'
//            }
//            else{
//                return 'teacher_question_view'
//            }
            return 'teacher_question_view'
        },
        waitOn: function() {
            return Meteor.subscribe("questions")
        },
        data: function() {
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            return passData(question); },

    });

    this.route('teacher_summary', {
        path: 'teacher/summary',
        waitOn: function(){
            return Meteor.subscribe("questions")
        }
    });

    this.route('question_view', {
        path: '/student',  //overrides the default '/home'
        template: function() {
            if (Meteor.user()) {
                if (Questions.findOne({status:{$in:['active', 'frozen']}})) {
                    return 'question_view';
                } else {
                    return 'no_launched_question';
                }
            }
            else {
                return 'please_login';
            }
        },
        data: function() {
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            return passData_student(question, Meteor.user());}
    });

    this.route('teacher_new', {
        path: '/teacher/new',
        template: 'new',
    });

    this.route('teacher_edit',{
        path:'/teacher/edit',
        data: function() {
            var question = Questions.findOne(Session.get('editing'));
            var options =[];
            for (var i=0; i<choices.length; i++){
                options.push({letter:letters[i],choice:choices[i], option:question[choices[i]]});
            }
            return {
                options: options,
                title: question.title
            }
        }
    })

    this.route('teacher_question_view', {
        path: '/teacher/:_id',
        waitOn: function() {
            return Meteor.subscribe("questions")
        }
        ,
        template: 'teacher_question_view',
        data: function() {
            var question = Questions.findOne(this.params._id);
            return passData(question);},
        action: function(){
            if (this.ready()){
                this.render()
            }
        }
    })

    this.route('teacher_question_private', {
        path: '/teacher/private/:_id',
        waitOn: function() {
            return [Meteor.subscribe("questions"), Meteor.subscribe("responses")] //, Meteor.subscribe("userData"), Meteor.subscribe("responses")]
        }
        ,
        template: 'teacher_question_private',
        data: function() {
        	console.log(this.params._id)
            var question = Questions.findOne(this.params._id);
            var questionId = this.params._id;
            var responses = []
            for (var mm=0; mm<Responses.find().fetch().length; mm++){
            	if (Responses.find().fetch()[mm].question == questionId){
            		var userId = Responses.find().fetch()[mm].user;
            		var answer = Responses.find().fetch()[mm].answer;
            		var studentUser = Meteor.users.findOne({_id:userId}).username;
            		responses.push({user:studentUser, response: answer})
            	}
            }
            return {
            	responses: responses,
            	questionData: passData(question)
            }
        },
        action: function(){
            if (this.ready()){
                this.render()
            }
        }
    })


    //temporary trying to make a teacher page so they can see the students and what not
    this.route('teacher_control',{
        path:'/control',
        waitOn: function(){
            return Meteor.subscribe("userData", "responses");
        },
        template: 'teacher_control',
        data: function(){
            var people = [];
            for (var ll=0; ll<Meteor.users.find().fetch().length; ll++){
                if (Meteor.users.find().fetch()[ll].profile != undefined){
                    var tempRole = Meteor.users.find().fetch()[ll].profile.role;
                    if (tempRole == "student"){
                        people.push({username: Meteor.users.find().fetch()[ll].username, role:tempRole, isTeacher:false, isStudent:true})
                    }
                    else{
                        people.push({username: Meteor.users.find().fetch()[ll].username, role:tempRole, isTeacher:true, isStudent:false})
                    }
                }
                else{
                    people.push({username: Meteor.users.find().fetch()[ll].username, role:"student", isTeacher:false, isStudent:true})
                }
            }
            var responses = []
            for (var mm=0; mm<Responses.find().fetch().length; mm++){
                var userId = Responses.find().fetch()[mm].user;
                var questionId = Responses.find().fetch()[mm].question;
                var answer = Responses.find().fetch()[mm].answer;
                var studentUser = Meteor.users.findOne({_id:userId}).username;
                var questionTime = Questions.findOne({_id:questionId}).time;
                responses.push({question:questionTime, user:studentUser, response: answer})
            }
            return{
                people: people,
                responses: responses
            }

        }
    });
});
