Questions = new Meteor.Collection("questions");
questionsHandle = Meteor.subscribe("questions");
//Submissions = new Meteor.Collection("submissions");

if (Meteor.isClient) {
    Template.home.helpers({
        questions: function() {
            return Questions.find();
        }
    });

    Template.new.events({
        'submit form': function (event, template) {
            event.preventDefault();

            title = template.find("input[name=title]");
            choice1 = template.find("input[name=choice_1]");
            choice2 = template.find("input[name=choice_2]");
            choice3 = template.find("input[name=choice_3]");
            choice4 = template.find("input[name=choice_4]");
            correct = $('input[name="correct"]:checked').val(); //in form A, B, C, or D

            var question_data = {
                title: title.value,
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                correct: correct,
                A: 0,
                B: 0,
                C: 0,
                D: 0,
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
            Router.go('/teacher/' + question_id);

        }
  });

    Template.question_view.events({
        'submit #student_question': function (event, template) {
            event.preventDefault();
            var choice = template.find("input[name='choice']:checked");
            if (choice == null) {
                console.log('ERROR: nothing chosen. Please choose an answer.')
            }
            else {
                var user_answer = choice.value;
                console.log(user_answer);
                var id = Router.current().path.substr(1);
                var question = Questions.findOne({_id: id});
                switch (user_answer) {
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
    this.route('question_view', {
        path: '/:_id',  //overrides the default '/home'
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
            var questions = Questions.findOne(this.params._id);
            console.log(questions)
            var percentA = 100.0*(questions.A / (questions.A + questions.B + questions.C + questions.D))
            var percentB = 100.0*(questions.B / (questions.A + questions.B + questions.C + questions.D))
            var percentC = 100.0*(questions.C / (questions.A + questions.B + questions.C + questions.D))
            var percentD = 100.0*(questions.D / (questions.A + questions.B + questions.C + questions.D))

            var options = []
            options.push(
                {
                    option: "A",
                    choice: questions.choice1,
                    voters: questions.A,
                    percent: percentA.toFixed(2)
                },
                {
                    option: "B",
                    choice: questions.choice2,
                    voters: questions.B,
                    percent: percentB.toFixed(2)
                },
                {
                    option: "C",
                    choice: questions.choice3,
                    voters: questions.C,
                    percent: percentC.toFixed(2)
                },
                {
                    option: "D",
                    choice: questions.choice4,
                    voters: questions.D,
                    percent: percentD.toFixed(2)
                }
            );

            return {
                options: options,
                title: questions.title,
                correct: questions.correct,
                total: questions.A + questions.B + questions.C + questions.D
            }
        },
    });
});
