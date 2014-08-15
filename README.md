#kswak
###klicker spelled with a k

A simple clicker app that lets teachers see their students answers to specific questions in real time.

Written by Steven Rivera, Rob Soto, Pei Tao, and Iveel Tsogsuren as part of the 6.MITx UROP for summer 2014.

##Launching Meteor
To launch, run the following commands in the shell.

    source config/env.sh
    meteor

If this gives you issues, you can boot with the Meteor.settings file manually by running

    meteor --settings config/settings.json

but keep in mind that this means that the other environment variables in env.sh will not have source run on them, so be sure to manually type whatever variables you need in from of the above command like so:

    MONGO_URL="mongodb://127.0.0.1:27017/test-db" meteor --settings config/settings.json

##Packages
bootstrap, crypto-base, crypto-md5, accounts-password, accounts-ui, iron-router, d3
Be sure to remove autopublish and insecure when launching the website for use!
