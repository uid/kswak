Questions = new Meteor.Collection("questions");
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
            correct = $('input[name="correct"]:checked').val(); //integer, representing the choice that is correct

            var question_data = {
                title: title.value,
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                correct: correct,
                submission_map: {'A': 0, 'B': 0, 'C': 0, 'D': 0},
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
                var submission_map = question.submission_map;
                submission_map[user_answer] += 1;
                Questions.update(id, {$set: {submission_map: submission_map}});
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
        data: function() { return Questions.findOne(this.params._id); },
    });
});
