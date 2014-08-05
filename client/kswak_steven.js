Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
//Responses = new Meteor.Collection("responses");


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
			var question_data = {
				title: 'True/False',
				type: 'tf',
				choice1: 'True',
				choice2: 'False',
				status: 'active',
				A: 0,
				B: 0
			}
			launchQuestion();
			var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
            Router.go('/teacher/home');
        },

        'click #mc3': function() {
			var question_data = {
				title: 'MC (3 choice)',
				type: 'mc3',
				choice1: 'A',
				choice2: 'B',
				choice3: 'C',
				status: 'active',
				A: 0, 
				B: 0,
				C: 0
			}
			launchQuestion();
			var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
			Router.go('/teacher/home');
        },

        'click #mc4': function() {
			var question_data = {
				title: 'MC (4 choice)',
				type: 'mc4',
				choice1: 'A',
				choice2: 'B',
				choice3: 'C',
				choice4: 'D',
				status: 'active',
				A: 0, 
				B: 0,
				C: 0,
				D: 0
			}
			launchQuestion();
			var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
			Router.go('/teacher/home');
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
				status: 'active',
				A: 0, 
				B: 0,
				C: 0,
				D: 0,
				E: 0
			}
			launchQuestion();
			var question_id = Questions.insert(question_data, function(err) { /* handle error */ });
			Router.go('/teacher/home');
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
				type: 'custom',
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
			}
			
			
			/*console.log('options: ' + question_data.options);
			var a = question_data.options[0];
			console.log('test: ' + a + question_data.a);*/

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
			console.log(this);
			if ( Questions.findOne(this.question_id).status == 'active'){
				Questions.update( this.question_id, {$set:{status:'frozen'}});
			} else if ( Questions.findOne(this.question_id).status == 'frozen') {
				Questions.update( this.question_id, {$set:{status:'active'}})
			} else {
				launchQuestion();
				Questions.update( this.question_id, {$set:{status:'active'}})
			}
		}
	});

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
    });

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
					//var user_answer = choice.html();
					var user_answer = choice.value;
					console.log('choice.value: ' + user_answer)
					var id = this._id;
					console.log('id ' + id)
					var question = Questions.findOne(id);

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
						case 'T':
							Questions.update(id, {$inc: {True: 1}});
							break;
						case 'F':
							Questions.update(id, {$inc: {False: 1}});
							break;
					}
					$('#submitFeedback').html('Your submission is '+user_answer);
				}
			} else {
				$('#submitFeedback').html('Question submission is closed')
			}
		}
	});

    Template.teacher_question_view.rendered = function(){
        var percentages = [];
        var choicesList = [];
        var optionsLen = 7;
        var qs = Questions.find();
        var total = 0;
        qs.observe({

            changed: function(newQuestion, oldQuestion){
                console.log("new relply")
                $('#bar').empty();
                counts = [newQuestion.A, newQuestion.B, newQuestion.C, newQuestion.D, newQuestion.E, newQuestion.T, newQuestion.F];
                choicesList = ["A", "B", "C", "D", "E", "T", "F"];
                total = 0;   
                for (var jj=0; jj<counts.length; jj++){
                    total = total + counts[jj];
                }
                console.log(total);

                percentages = [];
                for (var ii=0; ii<counts.length; ii++){
                    percentages.push((counts[ii] * 100 / total).toFixed(0))
                }

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

                    .text(function(d) { return d + "%"; });


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

/*
arg question = question data object
arg question_type = string -- 'tf' = true/false, 'mc2' = MC (2 choice), 'mc3' = MC (3 choice), etc.
*/
var calcPercentages = function(question, question_type) {
	var total = 0;
	var a = 0;
	var b = 0;
	var c = 0;
	var d = 0;
	var e = 0
	var tr = 0;
	var fal = 0;
	switch (question_type) {
		case 'tf':
			total = question.A + question.B;
			if (total != 0) {
				tr = 100.0*(question.A / total);
				fal = 100.0*(question.B / total);
			}
			return [total, tr.toFixed(0), fal.toFixed(0)];
		case 'custom':
			total = question.A + question.B + question.C + question.D;
			if (total != 0) {
				a = 100.0*(question.A / total);
				b = 100.0*(question.B / total);
				c = 100.0*(question.C / total);
				d = 100.0*(question.D / total);
			}
			return [total, a.toFixed(0), b.toFixed(0), c.toFixed(0), d.toFixed(0)];
		case 'mc3':
			total = question.A + question.B + question.C;
			if (total != 0) {
				a = 100.0*(question.A / total);
				b = 100.0*(question.B / total);
				c = 100.0*(question.C / total); 	
			}
			return [total, a.toFixed(0), b.toFixed(0), c.toFixed(0)];
		case 'mc4':
			total = question.A + question.B + question.C + question.D;
			if (total != 0) {
				a = 100.0*(question.A / total);
				b = 100.0*(question.B / total);
				c = 100.0*(question.C / total);
				d = 100.0*(question.D / total);
			}
			return [total, a.toFixed(0), b.toFixed(0), c.toFixed(0), d.toFixed(0)];
		case 'mc5':
			total = question.A + question.B + question.C + question.D + question.E;
			if (total != 0) {
				a = 100.0*(question.A / total);
				b = 100.0*(question.B / total);
				c = 100.0*(question.C / total);
				d = 100.0*(question.D / total);
				e = 100.0*(question.E / total);
			}
			return [total, a.toFixed(0), b.toFixed(0), c.toFixed(0), d.toFixed(0), e.toFixed(0)];
	}
}

var passData = function() {
	var question = Questions.findOne({status:{$in:['active', 'frozen']}});
	console.log('question: ' + question)
	
	if (question != undefined) {
		console.log('question not undefined')
		console.log('question type: ' + question.type)
		var question_id = question._id;
		//var options_list = question.options;

		if (question.status == 'active') {
			var status_control = 'to freeze';	
		} else {
			var status_control = 'to activate';	
		}

		var stats = calcPercentages(question, question.type) //returns array with total num votes at index 0 and answer choices in order from index 1 onwards
		var options = [];
		if (question.type == 'tf') {
			options.push(
				{
					option: '',
					choice: question.choice1,
					voters: question.A,
					percent: stats[1]
				},
				{
					option: '',
					choice: question.choice2,
					voters: question.B,
					percent: stats[2]
				}
			);
		} else if (question.type == 'custom') {
			options.push(
				{
					option: 'A',
					choice: question.choice1,
					voters: question.A,
					percent: stats[1]
				},
				{
					option: 'B',
					choice: question.choice2,
					voters: question.B,
					percent: stats[2]
				},
				{
					option: 'C',
					choice: question.choice3,
					voters: question.C,
					percent: stats[3]
				},
				{
					option: 'D',
					choice: question.choice4,
					voters: question.D,
					percent: stats[4]
				}
			);
		} else if (question.type == 'mc3') {
			options.push(
				{
					option: '',
					choice: question.choice1,
					voters: question.A,
					percent: stats[1]
				},
				{
					option: '',
					choice: question.choice2,
					voters: question.B,
					percent: stats[2]
				},
				{
					option: '',
					choice: question.choice3,
					voters: question.C,
					percent: stats[3]
				}
			);
		} else if (question.type == 'mc4') {
			options.push(
				{
					option: '',
					choice: question.choice1,
					voters: question.A,
					percent: stats[1]
				},
				{
					option: '',
					choice: question.choice2,
					voters: question.B,
					percent: stats[2]
				},
				{
					option: '',
					choice: question.choice3,
					voters: question.C,
					percent: stats[3]
				},
				{
					option: '',
					choice: question.choice4,
					voters: question.D,
					percent: stats[4]	
				}
			);	
		} else if (question.type == 'mc5') {
			options.push(
				{
					option: '',
					choice: question.choice1,
					voters: question.A,
					percent: stats[1]
				},
				{
					option: '',
					choice: question.choice2,
					voters: question.B,
					percent: stats[2]
				},
				{
					option: '',
					choice: question.choice3,
					voters: question.C,
					percent: stats[3]
				},
				{
					option: '',
					choice: question.choice4,
					voters: question.D,
					percent: stats[4]	
				},
				{
					option: '',
					choice: question.choice5,
					voters: question.E,
					percent: stats[5]
				}
			);	
		}

		return {
			question_id: question_id,
			status_control:status_control,
			options: options,
			title: question.title,
			correct: question.correct,
			total: stats[0]
		}
	}
}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('home', {
        path: '/',
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
		data: function() { return passData(); },

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
			return Questions.findOne({status:{$in:['active', 'frozen']}}); 
		}
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
		data: function() { passData(); },
        action: function(){
            if (this.ready()){
                this.render()
            }
        }
    });
});
