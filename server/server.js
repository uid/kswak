
Accounts.onCreateUser(function(options, user) {
    // try to fill in missing username from email address
    if (!user.username) {
        try {
            var email = user.emails[0].address;
            user.username = email.match(/^([^@]+)@/)[1];
        } catch (e) {
            throw new Error("can't create new user: no username, no email address")
        }
    }
    user.profile = options.profile;
    return user;
});


Questions = new Meteor.Collection("questions");
Meteor.publish("questions", function () {
    return Questions.find({isActive: true});
});

Responses = new Meteor.Collection("responses");
Meteor.publish("responses", function () {
    var user = Meteor.users.findOne(this.userId);
    if (!user) return [];
    else if (isTeacher(user)) return Responses.find();
    else return Responses.find({username:user.username});
});



Meteor.methods({
    newQuestion: function(choices) {
        if (isTeacher(Meteor.user()) ){
            // close all active questions
            Questions.update({isActive: true}, {$set:{isActive: false, isOpen: false}}, {multi:true});

            return Questions.insert({
                choices: choices,
                isActive: true,
                isOpen: true,
                timestamp: new Date()
            });
        }
    },

    studentAnswer : function (question_id, answer) {
        var username = Meteor.user().username;
        var question = Questions.findOne(question_id);
        if (!question.isActive || !question.isOpen) console.log("question closed");
        else if (isTeacher(Meteor.user())) console.log("teacher answered");
        else {
            var response = Responses.findOne({username:username, question:question_id});
            if (response) {
                Responses.update(response._id, {$set: {
                    answer: answer,
                    timestamp: new Date()
                }});
            } else {
                Responses.insert({
                    username:username, 
                    question:question_id, 
                    answer: answer,
                    timestamp: new Date()
                });
            }
        }
    },

    closeOrOpenQuestion: function(question_id, isOpen){
        if (isTeacher(Meteor.user())) {
            Questions.update(question_id, {$set:{isOpen:isOpen}})
        }
    },

});
