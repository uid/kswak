Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
Answers = new Meteor.Collection("answers");

if (Meteor.isClient) {
    Template.home.helpers({
        questions: function() {
            return Questions.find();
        }
    });
	
	Template.teacher_home.helpers({
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
			
			if (correct != null){
                var question_data = {
                    title: title.value,
                    choice1: choice1.value,
                    choice2: choice2.value,
                    choice3: choice3.value,
                    choice4: choice4.value,
                    correct: correct,
					status: false,
					live: false,
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
            if (correct != null){
                Router.go('/teacher/' + question_id);
            }

        }
  });
	
	Template.teacher_home.events({
//		'change [name="launch"]': function (event, template){
//			console.log("launch", Questions.findOne({live:false})._id, this._id);
//			if (Questions.findOne({live:true}) != undefined ){
//				Questions.update(Questions.findOne({live:true})._id, {live:false})
//			}
//			Questions.update(this._id, {live:true});
//		},
//		'click .delete': function (event, template){
//			Questions.remove(this._id)
//		}
	
	})

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            event.preventDefault();
            var choice = template.find("input[name='choice']:checked");
            if (choice == null) {
                console.log('ERROR: nothing chosen. Please choose an answer.')
                $('#submitFeedback').html('ERROR: nothing chosen. Please choose an answer.');
            }
            else {
                var user_answer = choice.value;
                var id = Router.current().path.substr(1);
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
                }
                console.log("submitted!");
                $('#submitFeedback').html('');
            }
        }
    });
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup
        //certificate auth should be here eventually
    });
}

//Templates needed: teacher, home, question, teacher_question_view
Router.map(function () {
    this.route('teacher');  // By default, path = '/teacher', template = 'teacher'
    this.route('home', {
        path: '/',
    });
	
	this.route('teacher_home', {
        path: 'teacher/home',
		template: 'teacher_home',
    });
	
    this.route('question_view', {
        path: '/_id',  //overrides the default '/home'
		template: 'question_view',
        data: function() { return Questions.findOne(this.params._id); },
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
            var question = Questions.findOne(this.params._id);
			var answers = Answers.find().fetch();
            console.log(question)
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
                options: options,
                title: question.title,
                correct: question.correct,
                total: total
            }
        },
    });
});
