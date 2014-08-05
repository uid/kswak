Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Answers = new Meteor.Collection("answers");


//set all questions inactive
//If an id is passed, launch its question
function launchQuestion(id){
    if (Questions.findOne({status:{$in:['active', 'frozen']}}) != undefined) {
        Questions.update( Questions.findOne({status:{$in:['active', 'frozen']}})._id, {$set:{status:'inactive'}})
    }
    if (typeof id != undefined){
        Questions.update( id, {$set:{status:'active'}})
    }
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

        /* Add click events for new buttons */

        /* Consider moving custom question form to a new template */

        /* check for question type (t/f, mc2, mc3, etc. and create question_data based on that */

        'click .tf': function(event, template) {
            console.log('t/f click');

            var question_data = {
                title: 'True/False',
                choice1: 'T',
                choice2: 'F',
                status: 'active',
                T: 0,
                F: 0
            }

            launchQuestion();
            var question_id = Questions.insert(question_data, function(err) { /* handle error */ });


            Router.go('/teacher/home');
        },

        'click #mc2': function() {

        },

        'click #mc3': function() {

        },

        'click #mc4': function() {

        },

        'click #mc5': function() {

        },

        'submit form': function (event, template) {
            event.preventDefault();
            //disable current launched question
            launchQuestion();
            //create new question and launch it
            var title = template.find("input[name=title]");
            var choice1 = template.find("input[name=choice_1]");
            var choice2 = template.find("input[name=choice_2]");
            var choice3 = template.find("input[name=choice_3]");
            var choice4 = template.find("input[name=choice_4]");
            var correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D
            if (correct == null){
                console.log('ERROR: nothing chosen. Please choose a correct answer.')
                $('#publishFeedback').html('ERROR: nothing chosen. Please choose a correct answer.');
            }

            var question_data = {
                title: title.value,
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                correct: correct,
                status: 'active', //active, frozen, inactive - not being launched
                A: 0,
                B: 0,
                C: 0,
                D: 0,
                E: 0,
                T: 0,
                F: 0
            };

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
            console.log("new end");
            Router.go('/teacher/home');
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

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            console.log(this, 'student');
            event.preventDefault();
            console.log(this.status)
            if (this.status == 'active'){
                var choice = template.find("input[name='choice']:checked");
                if (choice == null) {
                    console.log('ERROR: nothing chosen. Please choose an answer.')
                    $('#submitFeedback').html('ERROR: nothing chosen. Please choose an answer.');
                }
                else {
                    var user_answer = choice.value;
                    var id = this._id;
                    console.log('id ' + id)
                    var question = Questions.findOne(id);
                    var answer_data = {
                        question_id: id,
                        answer: user_answer,
                        user: Meteor.userId()
                    };

                    var answer_id = Answers.insert(answer_data, function(err) { /* handle error */ });

                    switch (user_answer) { /* add E, T, F */
                        case 'A':
                            Questions.update(id, { $inc: {A: 1} });
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
                    }
                    $('#submitFeedback').html('Your submission is '+user_answer);
                }
            }else{
                $('#submitFeedback').html('Question submission is closed')
            }
    }

    });


    Template.teacher_question_view.rendered = function(){
        var percentages = [];
        var choicesList = [];
        var optionsLen = 7;
        var qs = Questions.find();
        qs.observe({

            changed: function(newQuestion, oldQuestion){
                console.log("new relply")
                $('#bar').empty();

                percentages = [newQuestion.A, newQuestion.B, newQuestion.C, newQuestion.D, newQuestion.E, newQuestion.T, newQuestion.F];
                choicesList = ["A", "B", "C", "D", "E", "T", "F"];
                // for (var jj=0; jj < optionsLen; jj++){
                //     percentages.push(1*tThis.data.options[jj].percent);
                //     choicesList.push(tThis.data.options[jj].choice);
                // }

                console.log(percentages);
                console.log(choicesList);

                //percentages = [29, 39]
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
                    .data(percentages)
                    .enter().append("g")
                    .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
                bar.append("rect")
                    .attr("width", x)
                    .attr("height", barHeight - 1);
                bar.append("text")
                    .attr("x", function(d) { return x(d) + 10; })
                    .attr("y", barHeight / 2)
                    .attr("dy", ".35em")
                    .text(function(d) { return d; });


            }
        })

        //Bar Chart
        // var width = 420;
        // var barHeight = 20;
        // var x = d3.scale.linear()
        //     .domain([0, d3.max(percentages)])
        //     .range([0, width]);
        // var chart = d3.select("#bar")
        //     .attr("width", width+80)
        //     .attr("height", barHeight * optionsLen);
        // var bar = chart.selectAll("g")
        //     .data(percentages)
        //     .enter().append("g")
        //     .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
        // bar.append("rect")
        //     .attr("width", x)
        //     .attr("height", barHeight - 1);
        // bar.append("text")
        //     .attr("x", function(d) { return x(d) + 10; })
        //     .attr("y", barHeight / 2)
        //     .attr("dy", ".35em")
        //     .text(function(d) { return d; });



    }

}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        //certificate auth should be here eventually
    });
}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
    });

    this.route('teacher_home', {
        path: '/teacher/home',
        template: function() {
            if (Questions.findOne({status:{$in:['active', 'frozen']}}) == undefined){
                return 'new'
            }else{
                return 'teacher_question_view'}
            },
        waitOn: function(){
            return Meteor.subscribe("questions")
        },
        data: function() {
            var question = Questions.findOne({status:{$in:['active', 'frozen']}});
            if (question != undefined){
                var question_id = question._id;
                if (question.status == 'active'){
                    var status_control = 'to freeze';
                }else{
                    var status_control = 'to activate';
                }
                var answers = Answers.find().fetch();
                console.log("teach home", question)
                console.log('userID: ' + Meteor.userId());
                var total = question.A + question.B + question.C + question.D;
                var percentA = 0;
                var percentB = 0;
                var percentC = 0;
                var percentD = 0;

                if (total != 0) {
                    percentA = 100.0*(question.A / total);
                    percentB = 100.0*(question.B / total);
                    percentC = 100.0*(question.C / total);
                    percentD = 100.0*(question.D / total);
                }

                var options = []
                options.push(
                    {
                        option: "A",
                        choice: question.choice1,
                        voters: question.A,
                        percent: percentA.toFixed(0)
                    },
                    {
                        option: "B",
                        choice: question.choice2,
                        voters: question.B,
                        percent: percentB.toFixed(0)
                    },
                    {
                        option: "C",
                        choice: question.choice3,
                        voters: question.C,
                        percent: percentC.toFixed(0)
                    },
                    {
                        option: "D",
                        choice: question.choice4,
                        voters: question.D,
                        percent: percentD.toFixed(0)
                    }
                );

                return {
                    question_id: question_id,
                    status_control:status_control,
                    options: options,
                    title: question.title,
                    correct: question.correct,
                    total: total
                }
            }
            return null;
        }
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
            return Questions.findOne({status:{$in:['active', 'frozen']}}); }
    });

    this.route('teacher_new', {
        path: '/teacher/new',
        template: 'new',
    });
    this.route('teacher_question_view', {
        path: '/teacher/:_id',
        waitOn: function(){
            return Meteor.subscribe("questions")
        }
        ,
        template: 'teacher_question_view',
        data: function() {
            var question_id = this.params._id;
            var question = Questions.findOne(question_id);
            if (question.status == 'active'){
                var status_control = 'to freeze';
            }else if(question.status == 'frozen'){
                var status_control = 'to activate';
            }else{
                var status_control = 'launch the question';
            }

            var answers = Answers.find().fetch();
            console.log('userID: ' + Meteor.userId());
            var total = question.A + question.B + question.C + question.D;
            var percentA = 0;
            var percentB = 0;
            var percentC = 0;
            var percentD = 0;

            if (total != 0) {
                percentA = 100.0*(question.A / total);
                percentB = 100.0*(question.B / total);
                percentC = 100.0*(question.C / total);
                percentD = 100.0*(question.D / total);
            }

            var options = []
            options.push(
                {
                    option: "A",
                    choice: question.choice1,
                    voters: question.A,
                    percent: percentA.toFixed(0)
                },
                {
                    option: "B",
                    choice: question.choice2,
                    voters: question.B,
                    percent: percentB.toFixed(0)
                },
                {
                    option: "C",
                    choice: question.choice3,
                    voters: question.C,
                    percent: percentC.toFixed(0)
                },
                {
                    option: "D",
                    choice: question.choice4,
                    voters: question.D,
                    percent: percentD.toFixed(0)
                }
            );

            return {
                question_id: question_id,
                status_control: status_control,
                options: options,
                title: question.title,
                correct: question.correct,
                total: total
            }
        },
        action: function(){
            if (this.ready()){
                this.render()
            }
        }
    });
});
