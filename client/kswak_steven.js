Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Answers = new Meteor.Collection("answers");

if (Meteor.isClient) {
    Template.home.helpers({
        questions: function() {
            return Questions.find();
        }
    });

    Template.teacher_summary.helpers({
        questions: function() {
            return Questions.find();
        }
    });


    Template.new.events({

        /* Add click events for new buttons */

        /* Consider moving custom question form to a new template */

        /* check for question type (t/f, mc2, mc3, etc. and create question_data based on that */

        'click #t/f': function() {

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
			if (Questions.findOne({status:{$in:['active', 'inactive']}}) != undefined){
			Questions.update( Questions.findOne({status:{$in:['active', 'inactive']}})._id, {$set:{status:null}})
			}
			//create new question and launch it
            title = template.find("input[name=title]");
            choice1 = template.find("input[name=choice_1]");
            choice2 = template.find("input[name=choice_2]");
            choice3 = template.find("input[name=choice_3]");
            choice4 = template.find("input[name=choice_4]");
            correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D
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
                status: 'active', //active, inactive, null - not being launched
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
			console.log('here', Questions.findOne(this.question_id));
			if ( Questions.findOne(this.question_id).status == 'active'){
				Questions.update( this.question_id, {$set:{status:'inactive'}});
			}else{
				Questions.update( this.question_id, {$set:{status:'active'}})
			}															
		}
	})

    Template.teacher_summary.events({
        'change [name="launch"]': function (event, template){
            Questions.update({}, {$set:{status:null}});
			var selectionBox = event.target.parentElement.id;
			//selectionBox.append('<input type="radio">');
			//console.log("target", event.target.parentElement.lastChild)
            Questions.update(this._id, {$set:{status:'active'}});
        },
        'click .delete': function (event, template){
            Questions.remove(this._id)
        }

    })

    Template.question_view.events({
        'submit #student_question': function (event, template) {
			console.log(this, 'student');
            event.preventDefault();
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
        // $(this.find("#container_teacher_question_view")).append("<div>GOOD MORNING: "+this.data.title+"</div>");
        var teachQuestViewTemp = $(this.find("#container_teacher_question_view"));
        teachQuestViewTemp.append("<br><br>")
        teachQuestViewTemp.append("<div>Random Temporary Thing: "+ this.data.title+"</div>");
        teachQuestViewTemp.append("<div class='chart'></div>");

        console.log("THIS THING");

        var percentages = []
        var optionsLen = this.data.options.length;
        for (var jj=0; jj < optionsLen; jj++){
            percentages.push(this.data.options[jj].percent);
            console.log(this.data.options[jj].percent);
        }
        console.log(this);

        var width = 420;
        var barHeight = 20;
        var x = d3.scale.linear()
            .domain([0, d3.max(percentages)])
            .range([0, width]);
        var chart = d3.select(".chart")
            .attr("width", width)
            .attr("height", barHeight * optionsLen);
        var bar = chart.selectAll("g")
            .data(percentages)
            .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
        bar.append("rect")
            .attr("width", x)
            .attr("height", barHeight - 1);
        bar.append("text")
            .attr("x", function(d) { return x(d) - 3; })
            .attr("y", barHeight / 2)
            .attr("dy", ".35em")
            .text(function(d) { return d; });

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
        path: 'teacher/home',
		template: function() {
			if (Questions.findOne({status:{$in:['active', 'inactive']}}) == undefined){
				console.log("all null?");
				return 'new'
			}else{
				return 'teacher_question_view'}
			},
		waitOn: function(){
            return Meteor.subscribe("questions")
        },
		data: function() {
            var question = Questions.findOne({status:{$in:['active', 'inactive']}});
		    var question_id = question._id;
			if (question.status == 'active'){
				var status_control = 'change to inactive';
			}else{
				var status_control = 'change to active';
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
    });

	this.route('teacher_summary', {
        path: 'teacher/summary',
    });

    this.route('question_view', {
        path: '/student',  //overrides the default '/home'
        template: 'question_view',
        data: function() {console.log("here", Questions.findOne({status:{$in:['active', 'inactive']}}));
						  return Questions.findOne({status:{$in:['active', 'inactive']}}); }
    });

    this.route('teacher_new', {
        path: '/teacher/new',
        template: 'new',
    });
//    this.route('teacher_question_view', {
//        path: '/teacher/:_id',
//        waitOn: function(){
//            return Meteor.subscribe("questions")
//        }
//        ,
//        template: 'teacher_question_view',
//        data: function() {
//			var question_id = this.params._id;
//            var question = Questions.findOne(question_id);
//			if (question.status == 'active'){
//				var status_control = 'change to inactive';
//			}else{
//				var status_control = 'change to active';
//			}
//			
//            var answers = Answers.find().fetch();
//            console.log('userID: ' + Meteor.userId());
//            var total = question.A + question.B + question.C + question.D;
//            var percentA = 0;
//            var percentB = 0;
//            var percentC = 0;
//            var percentD = 0;
//
//            if (total != 0) {
//                percentA = 100.0*(question.A / total);
//                percentB = 100.0*(question.B / total);
//                percentC = 100.0*(question.C / total);
//                percentD = 100.0*(question.D / total);
//            }
//
//            var options = []
//            options.push(
//                {
//                    option: "A",
//                    choice: question.choice1,
//                    voters: question.A,
//                    percent: percentA.toFixed(0)
//                },
//                {
//                    option: "B",
//                    choice: question.choice2,
//                    voters: question.B,
//                    percent: percentB.toFixed(0)
//                },
//                {
//                    option: "C",
//                    choice: question.choice3,
//                    voters: question.C,
//                    percent: percentC.toFixed(0)
//                },
//                {
//                    option: "D",
//                    choice: question.choice4,
//                    voters: question.D,
//                    percent: percentD.toFixed(0)
//                }
//            );
//
//            return {
//				question_id: question_id,
//				status_control: status_control,
//                options: options,
//                title: question.title,
//                correct: question.correct,
//                total: total
//            }
//        },
//    });
});
