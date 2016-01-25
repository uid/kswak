#kswak
###klicker spelled with a k

A simple clicker app that lets teachers see their students answers to specific questions in real time.

Written by Steven Rivera, Rob Soto, Pei Tao, and Iveel Tsogsuren as part of the 6.MITx UROP for summer 2014.



Configuring and deploying
----

1. Browse to https://6005.mit.edu:444/certauth/certauth.php to get a fresh token/secret pair.

2. Save it to settings.json in this folder (the root kswak/ folder).

3. Edit settings.json to add a list of teachers in the public part, using their MIT Kerberos usernames:

    {
      "public": {
        "CertAuthURL": "...",
        "teachers": ["rcm", "maxg"]
      },
      "CertAuthSecret": "..."
    }

3. Run
      meteor deploy 005k.meteor.com -D
to wipe any old deployment along with its database.

4. Run
      meteor deploy 005k.meteor.com --settings settings.json
to start up the deployment.

5. Run
      meteor authorized 005k.meteor.com --add mit6005
to add the 6.005 organization as an authorized maintainer of the deployment. 





Getting student responses out in CSV 
----

1. Install mongodb, because you'll need the mongoexport tool.

2. Run mongoexport.  The first part of its command line depends on whether you're running KSWAK locally
   (with localhost URLs):

        mongoexport -h 127.0.0.1 --port 3001 -d meteor 

or remotely on meteor.com:

    meteor mongo -U 005k.meteor.com | sed -E -e 's_mongodb://([^:]+):([^@]+)@([^:]+):([^/]+)/(.*)$_mongoexport -u \1 -p \2 -h \3 --port \4 -d \5_'

which will print the mongoexport command line that you need to run, including hostname, port, username, and password.  Don't bother saving these values for later, because the username and password are temporary and will expire.

3. The end of your mongoexport command line should be one of the following, depending on the data you want:

   * Just the last student response to each question, in CSV format

       -c responses --type csv --fields "timestamp,username,answer"  --sort={timestamp:1}

   * All events, in CSV format

       -c events --type csv --fields "timestamp,type,username,choices,answer" --sort={timestamp:1}

