Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Responses = new Meteor.Collection("responses");
AccountsTest = new Meteor.Collection("accountstest");


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
var choices = ['choice1','choice2','choice3','choice4','choice5','choice6']
var letters = ['A', 'B', 'C', 'D', 'E', 'F']
var MASTER = 'asd651c8138';
var ENCRYPTION_KEY = "26bc!@!$@$^W64vc";

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

if (Meteor.isClient) {
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


    Template.new.events({
        'click #tf': function(event, template) {
            var question_data = {
                title: 'True/False',
                type: 'tf',
                choice1: 'True',
                choice2: 'False',
                choice3: '',
                choice4: '',
                choice5: '',
                choice6: '',
                status: 'active',
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
            }
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
        },

        'click #mc2': function() {
            var question_data = {
                title: 'MC (2 choice)',
                type: 'mc2',
                choice1: 'A',
                choice2: 'B',
                choice3: '',
                choice4: '',
                choice5: '',
                choice6: '',
                status: 'active',
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
            }
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
        },

        'click #mc3': function() {
            var question_data = {
                title: 'MC (3 choice)',
                type: 'mc3',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: '',
                choice5: '',
                choice6: '',
                status: 'active',
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
            }
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
        },

        'click #mc4': function() {
            var question_data = {
                title: 'MC (4 choice)',
                type: 'mc4',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: 'D',
                choice5: '',
                choice6: '',
                status: 'active',
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
            }
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
        },

        'click #mc5': function() {
            var question_data = {
                title: 'MC (5 choice)',
                type: 'mc5',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: 'D',
                choice5: 'E',
                choice6: '',
                status: 'active',
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
            }
            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
        },

        'click #mc6': function() {
            var question_data = {
                title: 'MC (6 choice)',
                type: 'mc6',
                choice1: 'A',
                choice2: 'B',
                choice3: 'C',
                choice4: 'D',
                choice5: 'E',
                choice6: 'F',
                status: 'active',
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
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
            var correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D
            if (correct == null){
                console.log('ERROR: nothing chosen. Please choose a correct answer.')
                $('#publishFeedback').html('ERROR: nothing chosen. Please choose a correct answer.');
            }

            var question_data = {
                title: title.value,
                type: 'custom',
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                choice5: '',
                choice6: '',
                correct: correct,
                status: 'active', //active, frozen, inactive - not being launched
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                F: 0
            }


            //reset fields
            title.value = "";
            choice1.value = "";
            choice2.value = "";
            choice3.value = "";
            choice4.value = "";
            $('input[name="correct"]').each(function() {
                this.checked = false;
            });

            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
            launchQuestion();
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
            Questions.remove(this._id)
        },
        'click #deleteAll':function (event, template){
            Questions.find({status:'inactive'}).forEach(function(question){
                Questions.remove(question._id);
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
            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");
            var choice6 = template.find("input[name=choice6]");
            var correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D
            if (correct == null){
                console.log('ERROR: nothing chosen. Please choose a correct answer.')
                $('#publishFeedback').html('ERROR: nothing chosen. Please choose a correct answer.');
            }
            Questions.update(question, {$set:{title:title.value,
                                              choice1:choice1.value,
                                              choice2:choice2.value,
                                              choice3:choice3.value,
                                              choice4:choice4.value,
                                              choice5:choice5.value,
                                              choice6:choice6.value,
                                              correct:correct,
                                              }})
            if (question.status == 'active'){
                Router.go('/teacher/home')
            }else{
                Router.go('/teacher/summary')
            }
        },

        'click #save_launch': function(event, template){
            var question = Session.get('editing');
            //disable current launched question
            launchQuestion();
            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice1]");
            var choice2 = template.find("input[name=choice2]");
            var choice3 = template.find("input[name=choice3]");
            var choice4 = template.find("input[name=choice4]");
            var choice5 = template.find("input[name=choice5]");
            var choice6 = template.find("input[name=choice6]");
            var correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D
            if (correct == null){
                console.log('ERROR: nothing chosen. Please choose a correct answer.')
                $('#publishFeedback').html('ERROR: nothing chosen. Please choose a correct answer.');
            }
            Questions.update(question, {$set:{title:title.value,
                                              choice1:choice1.value,
                                              choice2:choice2.value,
                                              choice3:choice3.value,
                                              choice4:choice4.value,
                                              choice5:choice5.value,
                                              choice6:choice6.value,
                                              correct:correct,
                                              status:'active'
                                              }})
            Router.go('/teacher/home')
        }
    })

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            event.preventDefault();
            console.log('user', Meteor.user()._id);
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            if (question.status == 'active'){
                var choice = template.find("input[name='choice']:checked");
                if (choice == null) {
                    $('#submitFeedback').html('ERROR: nothing chosen. Please choose an answer.');
                }
                else {
                    //var user_answer = choice.html();
                    var user_answer = choice.value;
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

                    switch (user_answer) { /* add E, T, F */
                        case 'A':
                            Questions.update(id, {$inc: {A: 1}});
                            break;
                        case 'B':
                            Questions.update(id, {$inc: {B: 1}});
                            break;
                        case 'C':
                            Questions.update(id, {$inc: {C: 1}});
                            break;
                        case 'D':
                            Questions.update(id, {$inc: {D: 1}});
                            break;
                        case 'E':
                            Questions.update(id, {$inc: {E: 1}});
                            break;
                        case 'F':
                            Questions.update(id, {$inc: {F: 1}});
                            break;
                    }
                    $('#submitFeedback').html('Your submission is ' + user_answer);
                }
            } else {
                $('#submitFeedback').html('Question submission is closed')
            }
            // $('#submitFeedback').effect("shake", {times:1});
        }
    });

    Template.teacher_question_view.rendered = function(){
        var percentages = [];
        var choicesList = [];
        var tempOb = []
        var total = 0;
        var optionsLen = this.data.options.length;
        for (var kk=0; kk<optionsLen; kk++){
            choicesList.push(this.data.options[kk].choice);
        }
        console.log(this);
        console.log(choicesList);

        var qs = Questions.find();
        qs.observe({

            changed: function(newQuestion, oldQuestion){
                console.log(newQuestion);
                optionsLen = newQuestion.type[2];
                $('#bar').empty();
                tempOb = [];


                counts = [newQuestion.A, newQuestion.B, newQuestion.C, newQuestion.D, newQuestion.E, newQuestion.F];
                counts = counts.slice(0,optionsLen);
                console.log(counts);

                total = 0;
                for (var jj=0; jj<counts.length; jj++){
                    total = total + counts[jj];
                }
                console.log(total);

                percentages = [];
                for (var ii=0; ii<counts.length; ii++){
                    percentages.push((counts[ii] * 100 / total).toFixed(0));
                    tempOb.push({thing:choicesList[ii], percent: 1*(counts[ii] * 100 / total).toFixed(0)})
                    // tempOb[(choicesList[ii])] = (counts[ii] * 100 / total).toFixed(0)
                }

                console.log(tempOb)
                console.log(percentages);
                console.log(choicesList);

                //Bar Chart
                var width = 420;
                var barHeight = 20;
                var x = d3.scale.linear()
                    .domain([0, d3.max(percentages)])
                    .range([0, width]);
                var chart = d3.select("#bar")
                    .attr("width", width+80)
                    .attr("height", barHeight * optionsLen);
                var bar = chart.selectAll("g")
                    // .data(percentages)
                    .data(tempOb, function(d){return d.thing;})
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
                bar.append("rect")
                    // .attr("width", x)
                    .attr("width", function(d){return x(d.percent)*.9;})
                    .attr("height", barHeight - 1);
                bar.append("text")
                    .attr("x", function(d) { return x(d.percent)*.9 + 10; })
                    .attr("y", barHeight / 2)
                    .attr("dy", ".35em")

                    .text(function(d) { return d.percent + "%"; });
                 bar.append("text")
                     .attr("x", 0)
                     .attr("y", barHeight / 2)
                     .attr("dy", ".35em")
                     .text(function(d) {return d.thing;})
                     .attr("fill","grey")

            }
        })
    }

}


if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        //certificate auth should be here eventually
    });
}

//var calcPercentages = function(question) {
//    normalizedList = [];
//    var total = 0;
//    for ( var i =0; i< choices.length; i++){
//        if (question[choices[i]] != ''){
//            normalizedList.push( (question[letters[i]]))
//            total +=question[letters[i]];
//        }else{
//            normalizedList.push(0);
//        }
//    }
//    if (total != 0){
//        normalizedList = normalizedList.map(function(x) { return (100*(x/total)).toFixed(0); })
//    }
//    normalizedList.push(total)
//    return normalizedList;
//}

var calcPercentages =function(question){
    normalizedList = [];
    var total = 0;
    for ( var i =0; i< choices.length; i++){
        if (question[choices[i]] != ''){
            var numResponses = Responses.find({question: question._id , answer:letters[i]}).count();
            console.log("num",numResponses);
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
        }else if(question.status == 'frozen') {
            var status_control = 'to activate';
            var status_comment = 'This question is shown and FROZEN'
        }else{
            var status_control = 'to activate';
            var status_comment = 'This question is not presented'
        }

        var question_id = question._id;
        var stats = calcPercentages(question) //returns array with total num votes at index 0 and answer choices in order from index 1 onwards
        var options = [];
        for (i in choices) {
            if (question[choices[i]] != ''){
                options.push(
                {
                    option: '',
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
            correct: question.correct,
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
//    var user = Meteor.call('checkUser', username, function(err, data){ return data; });
    var user = AccountsTest.findOne({username: username});
    console.log(user);
    if (user == null) {
        var account_id = Accounts.createUser({username: username, email: account_data['user_email'], password: MASTER, profile: {}});
        var hack_data = {
            username: username,
            email: account_data['user_email'],
        }

        var id = AccountsTest.insert(hack_data, function(err) {});
        console.log('at id: ' + id);

    } else { //user does exist
        loginFlag = true;
        Meteor.loginWithPassword(user.username, MASTER);
    }
    return loginFlag;
}

function kswak_login(encrypted_username) {
    console.log('in kswak_login');
    console.log('str: ' + encrypted_username);
    var username = getUsernameFromBase64(encrypted_username);
    console.log(username);
    var loginFlag = createAccount(username);
    console.log('lf: ' + loginFlag);
    return [username, loginFlag];
    //BUGS:
    //This method, when called, returns nothing and I need login flag
    //Can't log in on server, need to do in client
}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
    });

    this.route('login', {
        path: '/login/:encrypted_username',
        data: function() {
            var sneakysneaky = this.params.encrypted_username;
            var usernameAndLogin = kswak_login(sneakysneaky);
            var username = usernameAndLogin[0];
            var loginFlag = usernameAndLogin[1];
            console.log('behind if: ' + username);
            console.log(loginFlag);
            if (loginFlag) { Meteor.loginWithPassword(username, MASTER); }
            Router.go('account', {username: username});
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
        template: 'question_view',
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
