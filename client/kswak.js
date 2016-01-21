Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Responses = new Meteor.Collection("responses");
responsesHandle = Meteor.subscribe("responses");
AccountsTest = new Meteor.Collection("accountstest");
usersHandle = Meteor.subscribe("directory");

//GLOBAL VARIABLES
var numChoices = 5;
var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

// automatic login using certificate
Meteor.startup(function () {
  CertAuth.login();
});  


//set all questions inactive
//If an id is passed, launch its question
function launchQuestion(id){
    Meteor.call('inactivate_question');

    if (typeof id != undefined){
        Meteor.call('activate_question', id);
    }
    Router.go('/teacher');
    numChoices = 5;
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
        isTeacher: function() {
            return isTeacher(Meteor.user());
        },
        launched_question: function() {
            var b;
            (Questions.findOne({status:{$in:['active', 'frozen']}}) != undefined) ? b = true : b = false;
            return b;
        },
    });


    UI.registerHelper('getStatusColor', function() {
        return Session.get('getStatusColor');
    });

    Template.teacher_summary.helpers({
        questions: function() {
            return Questions.find({}, {sort: {date_created: -1}})
        }
    });

    Template.nav.helpers({
      describe: function(user) {
        return (user.profile && user.profile.name)
            || user.username
            || (user.emails.length > 0 ? user.emails[0].address : null)
            || "user #" + user._id;
      },
    });
    

    /*
    //Construct list of question event objects to match question buttons when they are clicked.

    /* !Helper! Function for creating an array of multiple choice answers starting from 'A'.
    *   Ex: mcID = 'mc2' -> ['A', 'B']
    * parameter - mcID:     HTML id of the multiple choice button. Must be of format 'mc' followed by a number.
    * returns:              Alphabetic array of multiple choices.
    *
    var multiChoices = function(mcID){
        //Extract the index from the ID.
        var numChoices = parseInt(mcID.substring(2));
        //var numChoices = parseInt(mcID);
        var output = [];
        var asciiValueA = 65;
        for (var i = 0; i< numChoices; i++){
            output.push(String.fromCharCode(asciiValueA + i));
        }
        return output;
    }
    var prefix = "mc";
    var max_options = 5;
    var eventObj = {};
    for (var i = 2; i <= max_options; i++){
        eventObj["click #" + prefix + i] = function(event, template){
            var date_and_time = setTime();
            var date_created = date_and_time.date;
            var time = date_and_time.time;
            var question_data = {
                title: '',
                type: String(event.currentTarget.id),
                choices: multiChoices(String(event.currentTarget.id)),
                status: 'active',
                time: time,
                date_created: date_created
            }
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });
        }
    }
    Template.new.events(eventObj);
    */
    Template.new.events({
        'click #tf': function(event, template) {
            var date_and_time = setTime();
            var date_created = date_and_time.date;
            var time = date_and_time.time;
            var question_data = {
                title: '',
                type: 'tf',
                choices: ['True','False'],
                status: 'active',
                time: time,
                date_created: date_created
            }
            Meteor.call('insert_question', question_data, function(error, data){
                launchQuestion(data);
            });

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

        'click #addAnswerChoice': function(event, template) {
            event.preventDefault();
            numChoices +=1;
            if (numChoices >= 8) {
                $('#addAnswerChoice').hide();
                $('#addAnswerChoiceText').hide();
            };
            console.log($('#input_choices'));
            $('#input_choices').append("<tr><td align='right'>"+letters[numChoices-1]+"</td><td align='left'><input class='choice' type='text'></td></tr>");

        },

        'submit form': function (event, template) {
            event.preventDefault();
            var title = template.find("input[name=title]");
            var choices = [];
            $('.choice').each(function(child, i){
                 if (this.value != ''){
                     choices.push(this.value)
                 }
             });
            var date_and_time = setTime();
            var date_created = date_and_time.date;
            var time = date_and_time.time;
            var question_data = {
                title: title.value,
                type: 'custom',
                choices: choices,
                status: 'active',
                time: time,
                date_created: date_created
            }

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
        },
        'click #exportCSV': function (event, template){
            var question_id = document.URL.split('/')[4]; //because path is https://.../teacher/question_id
            var csv = csvExport(question_id);
            console.log(question_id);
            window.open("data:text/csv;charset=utf-8," + escape(csv))
        },
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
            var choices = []
            var title = template.find("input[name=title]");
            $('.choice').each(function(child, i){
                 if (this.value != ''){
                     choices.push(this.value)
                 }
             });
            Meteor.call('update_question', question, title.value, choices)

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
            var choices = []
            var title = template.find("input[name=title]");
            $('.choice').each(function(child, i){
                 if (this.value != ''){
                     choices.push(this.value)
                 }
             });
            Meteor.call('update_question', question, title.value, choices)
            Meteor.call('activate_question', question);
            Router.go('/teacher')
        }
    })

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            event.preventDefault();
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            var choice = template.find(".clicked");
            var user_answer = choice.name;
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


var passData_student = function(question, user) {
    if (question != undefined) {
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
        if (student_response != undefined){
            var feedback = 'Your submission is: ' + student_response.answer;
        } else {
            var feedback = "Please submit your response!";
        }
        var options = [];
        for (i in question.choices) {
            var color = '#e5e2e2'
            //for use of identifying chosen answer
            if (student_response != undefined){
                if (student_response.answer == [letters[i]]){
                    color = 'steelblue';
                }
            }
            options.push(
            {
                choice: question.choices[i],
                letter: letters[i],
                color: color
            })

        }
        return {
            question_id: question_id,
            status_comment: status_comment,
            statusColor: statusColor,
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
            var status_comment = 'This question is live';
            var statusColor = 'green';
            var status_control = 'To Freeze';
        } else if(question.status == 'frozen') {
            var status_control = 'To Activate';
            var status_comment = 'This question is live and FROZEN';
            var statusColor = '#ef6d86';
        } else{
            var status_control = 'to activate';
            var status_comment = 'This question is inactive';
            var statusColor = '#ef6d86'
        }

        var stats = calcPercentages(question);
        var options = [];
        for (i in question.choices) {
            options.push(
            {
                choice: question.choices[i],
                voters: Responses.find({question: question_id, answer: letters[i]}).count(),
                percent: stats[i],
            })

        }
        return {
            question_id: question_id,
            status_comment: status_comment,
            statusColor: statusColor,
            status_control: status_control,
            options: options,
            title: question.title,
            time: question.time,
            total: stats[stats.length-1],
        }
    }
}

Router.configure({
    notFoundTemplate: "restricted"
});

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                Router.go('teacher_home');
            }
            else {
                Router.go('question_view'); //this redirects to a sign in page
            }
        }
    });

    this.route('teacher_home', {
        path: 'teacher',
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                if (Questions.findOne({status:{$in:['active', 'frozen']}}) == undefined) {
                    return 'teacher_summary'
                }
                else {
                    return 'teacher_question_view'
                }
            }
            else {
                return 'restricted';
            }
        },
        waitOn: function() {
            return Meteor.subscribe("questions")
        },
        data: function() {
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            return passData(question);
        },

    });

    this.route('teacher_summary', {
        path: 'teacher/summary',
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                return 'teacher_summary'
            }
            else {
                return 'restricted';
            }
        },
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
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                return 'new'
            }
            else {
                return 'restricted';
            }
        },
        data: function() {
            var options = [];
            for (var i=0; i<numChoices; i++) {
                options.push({letter: letters[i]});
            }
            return { options: options }
        }
    });

    this.route('teacher_edit',{
        path:'/teacher/edit',
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                return 'teacher_edit'
            }
            else {
                return 'restricted';
            }
        },
        data: function() {
            var question = Questions.findOne(Session.get('editing'));
			console.log('edit', question);
            var options =[];
            for (var i=0; i<question.choices.length; i++){
                options.push({letter:letters[i], option:question.choices[i]});
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
        },
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                return 'teacher_question_view';
            }
            else {
                return 'restricted';
            }
        },
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
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                return 'teacher_question_private';
            }
            else {
                return 'restricted';
            }
        },
        data: function() {
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
        path: 'admin',
        waitOn: function(){
            return Meteor.subscribe("directory", "responses");
        },
        template: function() {
            if (Meteor.user() && isTeacher(Meteor.user())) {
                return 'teacher_control'
            }
            else {
                return 'restricted';
            }
        },
        data: function(){
            var people = [];
            var teachers = Meteor.users.find({"profile.isTeacher" : true}).fetch();
            for (var ll = 0; ll < teachers.length; ll++){
                people.push({username: teachers[ll].username, role:"teacher", isTeacher:true, isStudent:false})
            }
            /*for (var ll=0; ll<Meteor.users.find().fetch().length; ll++){
                if (Meteor.users.find().fetch()[ll].profile != undefined){
                    var tempRole = Meteor.users.find().fetch()[ll].profile.role;
                    if (tempRole == "teacher"){
                        //If the user's role is teacher, then add it to the list of people, making sure to set role as teacher to 'true.'
                        people.push({username: Meteor.users.find().fetch()[ll].username, role:tempRole, isTeacher:true, isStudent:false})
                    }
                    /* This line is commented out because when there are too many students in the database, it can cause KSWAK to crash.
                    *else{
                        //Else, the user is a student, so add it to the list of people, making sure to set its role as student to 'true'.
                        people.push({username: Meteor.users.find().fetch()[ll].username, role:tempRole, isTeacher:false, isStudent:true})
                    }*
                }
                *This line is commented out because when there are too many students in the database, it can cause KSWAK to crash.
                else{
                    //Else, the role is undefined, so set it to 'student' by default, and add it to the list of people.
                    people.push({username: Meteor.users.find().fetch()[ll].username, role:"student", isTeacher:false, isStudent:true})
                }*
            }*/
            var responses = [];
            /*for (var mm=0; mm<Responses.find().fetch().length; mm++){
                var userId = Responses.find().fetch()[mm].user;
                var questionId = Responses.find().fetch()[mm].question;
                var answer = Responses.find().fetch()[mm].answer;
                var studentUser = Meteor.users.findOne({_id:userId}).username;
                var questionTime = Questions.findOne({_id:questionId}).time;
                responses.push({question:questionTime, user:studentUser, response: answer})
            }*/
            return{
                people: people,
                responses: responses
            }

        }
    });
});
