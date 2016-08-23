
/*
 Question = {
    choices: string (e.g. "ABCD")
    isOpen: boolean (true if students are allowed to answer right now)
    timestamp: Date, when question was created
  }
  This collection should have only document in it.
*/
Question = new Meteor.Collection("question");
Meteor.publish("question", function () {
    return Question.find();
});

/*
 Response = {
    username: string
    answer: optional string (typically "A", "B", etc) 
    timestamp: optional Date, when latest response was made
 }

 Contains a document for every student whose browser has rendered the active question.
 answer and timestamp fields are missing until the user makes a response.

 Only student usernames should be in this collection, not teachers.
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


// make sure every User has a username, by filling in from email address (which comes from MIT cert)
Accounts.onCreateUser(function(options, user) {
    console.log(user);

    if (!user.username) {        
        if ("services" in user && "google" in user.services) {
            var email = user.services.google.email;
            user.emails = [ { address: email, verified: true } ];
            user.username = email;
        } else if ("services" in user && "mit" in user.services) {
            var email = user.services.mit.email;
            user.emails = [ { address: email, verified: true } ];
            user.username = user.services.mit.username;
        } else {
            try {
                var email = user.emails[0].address;
                user.username = email.match(/^([^@]+)@/)[1];
            } catch (e) {
                throw new Error("can't create new user: no username, no email address")
            }
        }
    }
    user.profile = options.profile;
    return user;
});

Accounts.onLogin(function() {
    var user = Meteor.user();
    logEvent("login", user.username);
});


Meteor.methods({
    newQuestion: function(choices) {
        var user = Meteor.user();        
        if (isTeacher(user)) {
            // delete all question and answers
            Question.remove({});
            Responses.remove({});

            var questionID = Question.insert({
                choices: choices,
                isOpen: true,
                timestamp: new Date()
            });
            logEvent("new question", user.username, {choices:choices, questionID: questionID});

            return questionID;
        }
    },

    studentViewing : function (questionID) {
        var user = Meteor.user();
        var username = user.username;
        var question = Question.findOne(questionID);

        if (!question) {
            console.log("question " + questionID + " no longer exists");
        } else if (!isTeacher(user)) { // don't make Response docs for teachers 
            Responses.upsert({username:username}, {$set: { username: username }});
        }
    },

    studentAnswer : function (questionID, answer) {
        var user = Meteor.user();
        var username = user.username;
        var question = Question.findOne(questionID);

        if (!question) {
            console.log("question " + questionID + " no longer exists");
            return; // don't accept answer
        }
        
        if (answer.length != 1 || question.choices.indexOf(answer) == -1) {
            console.log("invalid answer: " + answer);
            return; // don't accept answer
        }
        
        if (isTeacher(user)) {
            // teacher can answer question whether closed or not
            logEvent("teacher answer", user.username, {choices:question.choices, question:question._id, answer:answer});
        } else {
            // is student
            if (!question.isOpen) {
                console.log("question closed");
                return; // don't accept student answer to a closed question 
            } else {
              logEvent("student answer", user.username, {choices:question.choices, question:question._id, answer:answer});
           }
        }

        // if we get here, it's okay to record the response
        Responses.upsert({username:username}, {$set: {
            username:username, 
            answer: answer,
            timestamp: new Date()
        }});
    },

    closeOrOpenQuestion: function(questionID, isOpen){
        var user = Meteor.user();
        if (isTeacher(user)) {
            Question.update(questionID, {$set:{isOpen:isOpen}});
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
