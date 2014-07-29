Questions = new Meteor.Collection("questions");

if (Meteor.isClient) {
    Template.new.events({
        'submit form': function (event, template) {
//            // template data, if any, is available in 'this'
//            if (typeof console !== 'undefined')
//                console.log("Publish button pressed.");
            event.preventDefault();

            title = template.find("input[name=title]");
            choice1 = template.find("input[name=choice_1]");
            choice2 = template.find("input[name=choice_2]");
            choice3 = template.find("input[name=choice_3]");
            choice4 = template.find("input[name=choice_4]");
            correct = $('input[name="correct"]:checked').val(); //integer, representing the choice that is correct

            //store data
            var data = {
                title: title.value,
                choice1: choice1.value,
                choice2: choice2.value,
                choice3: choice3.value,
                choice4: choice4.value,
                correct: correct
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

            Questions.insert(data, function(err) { /* handle error */ });
//            console.log(data);
        }
  });

    Template.teacher_question_view.title = function() {
        return "test";
    }

    Template.question_view.title = function() {
        return "test";
    }

    Template.question_view.events({
        'click submit': function () {
            //template data, if any, is available in 'this'
            if (typeof console !== 'undefined')
                console.log("You pressed the button!");
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
//Router.map(function () {
//    this.route('teacher');  // By default, path = '/teacher', template = 'teacher'
//    this.route('home', {
//        path: '/',  //overrides the default '/home'
//    });
//    this.route('question_view', {
//        path: '/:_id',  //overrides the default '/home'
//        data: function() { return Questions.findOne(this.params._id); },
//    });
//    this.route('teacher_question_view', {
//        path: '/teacher/:_id',
//    });
//    this.route('teacher_new', {
//        path: '/teacher/new',
//        template: 'new',
//    });
//});
