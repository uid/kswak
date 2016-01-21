


//Check if a user is a teacher. Meant to take in Meteor.user(), so keep in mind it takes in an accounts object.
isTeacher = function isTeacher(user) {
    return user && user.profile && user.profile.isTeacher;
}
