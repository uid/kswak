Questions = new Meteor.Collection("questions");
Meteor.publish("questions", function () {
    return Questions.find();
});

