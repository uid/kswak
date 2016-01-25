
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

Accounts.onLogin(function() {
    var user = Meteor.user();
    logEvent("login", user.username);
});

/*
 Question = {
    choices: string (e.g. "ABCD")
    isOpen: boolean (true if students are allowed to answer right now)
    timestamp: Date, when question was created
  }
  This collection should have only document in it.
*/
Questions = new Meteor.Collection("questions");
Meteor.publish("questions", function () {
    return Questions.find();
});

/*
 Response = {
    username: string
    answer: string (typically "A", "B", etc) 
    timestamp: Date, when latest response was made
 }
*/
Responses = new Meteor.Collection("responses");
Meteor.publish("responses", function () {
    var user = Meteor.users.findOne(this.userId);
    if (!user) return [];
    else if (isTeacher(user)) return Responses.find();
    else return Responses.find({username:user.username});
});

/*
 Event = {
    type: string, may be one of:
        "login"
        "new question"
        "student answer"
        "teacher answer"
        "closed question"
        "reopened question"
    username: string
    choices: optional string (typically "ABCD")
    question: optional string, question ID
    answer: optional string (typically "A", "B", etc.)
    timestamp: Date
 }
*/
Events = new Meteor.Collection("events");
// don't publish the event log -- it's just for backend


Meteor.methods({
    newQuestion: function(choices) {
        var user = Meteor.user();        
        if (isTeacher(user)) {
            // delete all questions and answers
            Questions.remove({});
            Responses.remove({});

            var questionID = Questions.insert({
                choices: choices,
                isOpen: true,
                timestamp: new Date()
            });
            logEvent("new question", user.username, {choices:choices, questionID: questionID});

            return questionID;
        }
    },

    studentAnswer : function (questionID, answer) {
        var user = Meteor.user();
        var username = user.username;
        var question = Questions.findOne(questionID);

        if (!question) {
            console.log("question " + questionID + " no longer exists");
        } else if (answer.length != 1 || question.choices.indexOf(answer) == -1) {
            console.log("invalid answer: " + answer);
        } else if (isTeacher(user)) {
            logEvent("teacher answer", user.username, {choices:question.choices, question:question._id, answer:answer});
        } else if (!question.isOpen) {
            console.log("question closed");
        } else {
            Responses.upsert({username:username}, {$set: {
                username:username, 
                answer: answer,
                timestamp: new Date()
            }});
            logEvent("student answer", user.username, {choices:question.choices, question:question._id, answer:answer});
        }
    },

    closeOrOpenQuestion: function(questionID, isOpen){
        var user = Meteor.user();
        if (isTeacher(user)) {
            Questions.update(questionID, {$set:{isOpen:isOpen}});
            logEvent(isOpen ? "reopened question" : "closed question", user.username, {question:questionID});
        }
    },

});


// Log an event
//     type: string, one of the Event types above.
//     username: string, username causing event
//     options: additional fields for event, see Event type above
function logEvent(type, username, options) {
    if (!options) options = {};
    options.type = type;
    options.username = username;
    options.timestamp = new Date();
    Events.insert(options);
}
