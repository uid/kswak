
if (!Meteor.settings.public.teachers) {
    console.log("no list of teachers! Need to edit settings.json and restart Meteor");
}


// User -> boolean.  Returns true iff user is a teacher.
isTeacher = function isTeacher(user) {
    if (!user) return false;
    var username = user.username;

    var teachers = Meteor.settings.public.teachers;
    if (!teachers) {
        return false;
    }
    for (var i = 0; i < teachers.length; ++i) {
        if (teachers[i] == username) return true;
    }
    return false;
}
