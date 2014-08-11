Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Responses = new Meteor.Collection("responses");
AccountsTest = new Meteor.Collection("accountstest");

//if true, homepage immediately directs user to script to log in.
var automatic_signin = false; //TODO: true is currently broken, leave this false.
var user_signed_in = false; //use this for quicker updating when Meteor.user() isn't fast enough
var scriptURL = 'https://sarivera.scripts.mit.edu:444/auth.php';
var MASTER = 'asd651c8138';
var ENCRYPTION_KEY = "26bc!@!$@$^W64vc";

Responses.allow({
  insert: function (userId, doc) {
    // the user must be logged in, and the document must be owned by the user
    return (userId && doc.owner === userId);
  },
  update: function (userId, doc, fields, modifier) {
    // can only change your own documents
    return doc.owner === userId;
  }
});

//GLOBAL VARIABLES
var choices = ['choice1','choice2','choice3','choice4','choice5']
var letters = ['A', 'B', 'C', 'D', 'E']

//set all questions inactive
//If an id is passed, launch its question

function launchQuestion(id){
    if (Questions.findOne({status:{$in:['active', 'frozen']}}) != undefined) {
        Questions.update( Questions.findOne({status:{$in:['active', 'frozen']}})._id, {$set:{status:'inactive'}})
    }
    if (typeof id != undefined){
        Questions.update( id, {$set:{status:'active'}})
    }
    Router.go('/teacher/home');
}

function setTime() {
    var _time = (new Date).toTimeString().substring(0,5);
    return _time;
}

function send_to_scripts() {
    var current_url = document.URL;
    var parts = current_url.split("/");
    var query = '?' + parts[2] + '/';
    return query;
}

function getUsernameFromBase64(urlBase64String) {
    var realBase64String = urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '=');
    console.log('in the weird getUsername');
    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
    return username;
}

//Creates an account and returns the id of that account.
function createAccount(username){
    var account_data = {
        username: username,
        user_email: username+'@mit.edu',
    }
    var account_id = Accounts.insert(account_data, function(err) { /**/ });
    console.log('making account');
    return account_id;
}

//Draw chart for submissions
function drawChart(data) {
    console.log('drawing update');
    //Bar Chart
    var width = 420; //interdasting...
    var barHeight = 20;
    var scale = d3.scale.linear()
        .domain([0, 100])
        .range([0, width]);

    var bars = d3.select("#bar")
    .selectAll("div")
    .attr("id","bar")
    .data(data);

    // enter selection
    bars
        .enter().append("div");

    // update selection
    bars
        .style("width", function (d) { return scale(d.percent) + "px";})
        .attr("height", barHeight - 1)


    // exit selection
    bars
        .exit().remove();
};

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
        }
    });

    Template.home.helpers({
        questions: function() {
            return Questions.find();
        }
    });

    Template.teacher_summary.helpers({
        questions: function() {
            console.log( Questions.find() );
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
            console.log(query);
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
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
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
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
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
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
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
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
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
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
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
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
        }
  });

    Template.teacher_question_view.events({
        'click #change_mode': function (event, template){
            if ( Questions.findOne(this.question_id).status == 'active'){
                Questions.update( this.question_id, {$set:{status:'frozen'}});
            }else if( Questions.findOne(this.question_id).status == 'frozen') {
                Questions.update( this.question_id, {$set:{status:'active'}})
            }else{
                launchQuestion();
                Questions.update( this.question_id, {$set:{status:'active'}})
            }
        },

        //Any question is editable no matter if it is active or not
        'click #edit': function (event, template){
            Session.set("editing", this.question_id);
            Router.go('/teacher/edit')
        }
    })

    Template.teacher_summary.events({
        'change [name="launch"]': function (event, template){
            Questions.update({}, {$set:{status:'inactive'}});
            var selectionBox = event.target.parentElement.id;
            //selectionBox.append('<input type="radio">');
            //console.log("target", event.target.parentElement.lastChild)
            Questions.update(this._id, {$set:{status:'active'}});
        },
        'click .delete': function (event, template){
            //Remove responses of this question
            Responses.find({question:this._id}).forEach( function(response){
                Responses.remove(response._id)
            });
            //Remove this question itself
            Questions.remove(this._id);

        },
        'click #deleteAll':function (event, template){
            Questions.find({status:'inactive'}).forEach(function(question){
                Questions.remove(question._id);
                Responses.find({question:question._id}).forEach( function(response){
                    Responses.remove(response._id)
                });
            });
        },
        'click #inactivateAll': function(event, template){
            launchQuestion()
        }
    })

    Template.teacher_edit.events({
        'click #cancel': function(event, template){
            Router.go('/teacher/home')

        },
        'click #save': function(event, template){
            var question = Session.get('editing');
            //Remove responses which are already submitted for the question
            Responses.find({question:question}).forEach( function(response){
                Responses.remove(response._id)
            });

            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");
            Questions.update(question, {$set:{title:title.value,
                                              choice1:choice1.value,
                                              choice2:choice2.value,
                                              choice3:choice3.value,
                                              choice4:choice4.value,
                                              choice5:choice5.value
                                              }})
            if (question.status == 'active'){
                Router.go('/teacher/home')
            }else{
                Router.go('/teacher/summary')
            }
        },

        'click #save_launch': function(event, template){
            var question = Session.get('editing');
            //Remove responses which are already submitted for the question
            Responses.find({question:question}).forEach( function(response){
                Responses.remove(response._id)
            });
            //disable current launched question
            launchQuestion();
            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");

            Questions.update(question, {$set:{title:title.value,
                                              choice1:choice1.value,
                                              choice2:choice2.value,
                                              choice3:choice3.value,
                                              choice4:choice4.value,
                                              choice5:choice5.value,
                                              status:'active'
                                              }})
            Router.go('/teacher/home')
        }
    })

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            event.preventDefault();
            //console.log('user', Meteor.user()._id);
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            if (question.status == 'active'){
                // var choice = template.find("input[name='choice']:checked");
                var choice = template.find(".clicked");
                console.log(template.find(".clicked"));
                if (choice == null) {
                    $('#submitFeedback').html('ERROR: nothing chosen. Please choose an answer.');
                }
                else {
                    var user_answer = choice.name
                    var id = question._id;
                    var user = Meteor.user()._id;
                    var response = Responses.findOne({user:user, question:id})
                    if (response != undefined){
                        console.log('updating');
                        Responses.update(response._id, {$set: {answer: user_answer}})
                    }else{
                        console.log('inserting', user, id, user_answer);
                        Responses.insert({user:user, question:id, answer: user_answer}, function(err){console.log('failed to insert')})
                    }
                    $('#submitFeedback').html('Your submission is ' + user_answer);
                }
            } else {
                $('#submitFeedback').html('Question submission is closed')
            }
            // $('#submitFeedback').effect("shake", {times:1});
        }
    });



//    Template.teacher_question_view.rendered = function(){
//        console.log('RENDER CALLED!!')
//        var barData = []
//        var optionsLen = this.data.options.length;
//        var currentQ =this;
//        for (var kk=0; kk<optionsLen; kk++){
//            barData.push({choice:currentQ.data.options[kk].choice, percent:currentQ.data.options[kk].percent});
//        }
//        drawChart(barData);
//        //Whenever response summary changes, chart updates
//        var responseSummary = Responses.find();
//        responseSummary.observe({
//            changed: function(newResponse, oldResponse){
//                var updatedData = passData(Questions.findOne(currentQ.data.question_id));
//                var barData = [];
//                for (var kk=0; kk<optionsLen; kk++){
//                    barData.push({choice:updatedData.options[kk].choice, percent:updatedData.options[kk].percent});
//                }
//                drawChart(barData);
//            }
//        });
//        //Whenever questions(edition) change, chart updates
//        var questions = Questions.find()
//        questions.observe({
//            changed: function(newQuestion, oldQuestion){
//                var updatedData = passData(Questions.findOne(currentQ.data.question_id));
//                var barData = [];
//                for (var kk=0; kk<optionsLen; kk++){
//                    barData.push({choice:updatedData.options[kk].choice, percent:updatedData.options[kk].percent});
//                }
//                drawChart(barData);
//
//            }
//
//
//        })
//    }
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
            var numResponses = Responses.find({question: question._id , answer:letters[i]}).count();
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

var passData = function(question) {
    if (question != undefined) {
        if (question.status == 'active') {
            var status_comment = 'This question is live'
            var status_control = 'to freeze';
        } else if(question.status == 'frozen') {
            var status_control = 'to activate';
            var status_comment = 'This question is live and FROZEN'
        } else{
            var status_control = 'to activate';
            var status_comment = 'This question is inactive'
        }

        var question_id = question._id;
        var stats = calcPercentages(question) //returns array with total num votes at index 0 and answer choices in order from index 1 onwards
        var options = [];
        for (i in choices) {
            if (question[choices[i]] != ''){
                options.push(
                {
                    choice: question[choices[i]],
                    voters: Responses.find({question:question_id, answer:letters[i]}).count(),//question[letters[i]],
                    percent: stats[i],
                    letter: letters[i]
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
            total: stats[stats.length-1]
        }
    }
}

function getUsernameFromBase64(urlBase64String) {
    var realBase64String = Base64.decode64(urlBase64String.replace(/-/g, '+').replace(/\./g, '/').replace(/_/g, '='));
    console.log('lets go deeper');
    var username = decryptAES(realBase64String, ENCRYPTION_KEY); //read key from server, do decrypt from server.
    return username;
}

//Creates an account and returns the id of that account.
function createAccount(username){
    var loginFlag = false;
    var account_data = {
        username: username,
        user_email: username + '@mit.edu',
    };

    function callback(data) {
        if (!data) {
            var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {role: 'student'}});
            user_signed_in = true;
            var id = AccountsTest.insert(account_data, function(err) {});
            console.log('at id: ' + id);

        } else { //user does exist
            loginFlag = true;
            Meteor.loginWithPassword(username, MASTER);
        }
    }
    Meteor.call('checkUser',
               username,
               function(err, data){
                   console.log('checkUser callback')
                   console.log(data)
                   callback(data);
               });

}

//function kswak_login(encrypted_username) {
//    console.log('in kswak_login');
//    console.log('str: ' + encrypted_username);
//    var username = getUsernameFromBase64(encrypted_username);
//    console.log('finished base64: '+username);
//    var loginFlag = createAccount(username);
//    console.log('lf: ' + loginFlag);
//    return [username, loginFlag];
//    //BUGS:
//    //This method, when called, returns nothing and I need login flag
//    //Can't log in on server, need to do in client
//}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
        template: function() {
            if (automatic_signin && !user_signed_in) {
                var query = send_to_scripts();
                window.location = 'https://sarivera.scripts.mit.edu:444/auth.php?' + query;
            }
            else {
                return 'home';
            }
        }
    });

    this.route('login', {
        path: '/login/:encrypted_username',
        waitOn: function() {
            return Meteor.subscribe("accountstest")
        },
        data: function() {
            var sneakysneaky = this.params.encrypted_username;
            var usernameAndLogin = Meteor.call(kswak_login, sneakysneaky);
            var username = usernameAndLogin[0];
            var loginFlag = usernameAndLogin[1];
            console.log('behind if: ' + username);
            console.log(loginFlag);
            if (loginFlag) {
                Meteor.loginWithPassword(username, MASTER);
                user_signed_in = true;
            }
            Router.go('home');
        },
    });

    this.route('account', {
        path: '/account/:username',
        waitOn: function() {
            return Meteor.subscribe("accountstest")
        },
        data: function() {
            return this.params.username;
        },
    });

    this.route('teacher_home', {
        path: 'teacher/home',
        template: function() {
            if (Questions.findOne({status:{$in:['active', 'frozen']}}) == undefined){
                return 'new'
            }else{
                return 'teacher_question_view'}
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
                if (Questions.findOne({status: 'active'})) {
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
            return passData(question);}
    });

    this.route('teacher_new', {
        path: '/teacher/new',
        template: 'new',
    });

    this.route('teacher_edit',{
        path:'/teacher/edit',
        data: function() {
            var question = Questions.findOne(Session.get('editing'));
            //console.log('q', question);
            var options =[];
            for (var i=0; i<choices.length; i++){
                options.push({letter:letters[i],choice:choices[i], option:question[choices[i]]});
                //console.log('hereCont', i);
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
    });
});
