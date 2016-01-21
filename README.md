#kswak
###klicker spelled with a k

A simple clicker app that lets teachers see their students answers to specific questions in real time.

Written by Steven Rivera, Rob Soto, Pei Tao, and Iveel Tsogsuren as part of the 6.MITx UROP for summer 2014.



6.005 deployment instructions
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

