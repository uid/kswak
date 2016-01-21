
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
    var userID = this.userId;
    var user = Meteor.users.findOne(userID);
    if (user && isTeacher(user)) {
        return Questions.find();
    }
    else{
        return Questions.find({status:{$in:['active', 'frozen']}});
    }
});

Responses = new Meteor.Collection("responses");
Meteor.publish("responses", function () {
    var userID = this.userId;
    var user = Meteor.users.findOne(userID);
    if (user && isTeacher(user)) {
        return Responses.find();
    }
    else {
        return Responses.find({user:userID});
    }
});



Meteor.methods({
    submit_response : function (question, user_answer) {
        var user_id = Meteor.user()._id;
        if (question.status == 'active' && !isTeacher(Meteor.user())){
            var question_id = question._id;
            var response = Responses.findOne({user:user_id, question:question_id});
            if (response != undefined){
                Responses.update(response._id, {$set: {answer: user_answer}})
            }else{
                Responses.insert({user:user_id, question:question_id, answer: user_answer})
            }
        }else{
            console.log('not a student')
        }
    },

    remove_responses: function ( question_id){
        if (isTeacher(Meteor.user()) ){
             Responses.find({question:question_id}).forEach( function(response){
                    Responses.remove(response._id)
                });
        }
    },

    insert_question: function( question_data){
        if (isTeacher(Meteor.user()) ){
            return Questions.insert(question_data)
        }
    },

    remove_question: function (question_id) {
        if (isTeacher(Meteor.user()) ){
            Questions.remove(question_id);
        }
    },


    inactivate_question: function (){
        if (isTeacher(Meteor.user()) ){
            var active = Questions.findOne({status:{$in:['active', 'frozen']}})
            if (active != undefined){
                Questions.update(active._id,  {$set:{status:'inactive'}})
            }
        }
    },

    activate_question: function(question_id){
        if (isTeacher(Meteor.user()) ){
            Questions.update( question_id, {$set:{status:'active'}})
        }
    },

    freeze_question: function(question_id){
        if (isTeacher(Meteor.user()) ){
            Questions.update(question_id, {$set:{status:'frozen'}});
        }
    },

    update_question: function(question, title, choices){
        if (isTeacher(Meteor.user()) ){
            Questions.update(question, {$set:{title:title, choices:choices}})
        }
    },

    add_teacher: function(newTeacherList, editor) {
        if (isTeacher(editor)) {
            for (var nn=0;nn<newTeacherList.length;nn++) {
                var username = newTeacherList[nn];
                Teachers.insert({username: username});
                var userID = Meteor.users.findOne({username: username});
                if (userID != null) {
                    Meteor.users.update( userID, { $set: { 'profile.role' : 'teacher'} } );
                }
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    },
    //todo: this is borked, debug.
    remove_teacher: function(teacher_username, editor) {
        if (editor.profile.role == 'teacher') {
            var id = Meteor.users.findOne({username: teacher_username})._id;
            if (id != null) {
                Meteor.users.update( id, { $set: { 'profile.role' : 'student'} } );
            }
        }
        else {
            console.log('ERROR: USER LACKS SUFFICIENT PRIVILEGES TO EDIT TEACHER ROSTER.')
        }
    }
});
