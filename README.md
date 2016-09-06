#kswak
###klicker spelled with a k

A simple clicker app that lets teachers see their students answers to specific questions in real time.

Written by Steven Rivera, Rob Soto, Pei Tao, and Iveel Tsogsuren as part of the 6.MITx UROP for summer 2014.



Configuring and running
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

4. Run the app:

    meteor run

You can then direct students to the app running on your laptop, using your IP address and the port number that Meteor displays.  You may find http://shoutkey.com useful for creating a temporary short URL to share.



Deploying on a Ubuntu VM
----

If you want to deploy KSWAK on a virtual machine (say on CSAIL's OpenStack or Amazon EC2), here's how to set up that VM:

    # git and mongodb
    sudo apt-get update
    sudo apt-get -y install git mongodb authbind

    # meteor
    curl https://install.meteor.com/ | sh

    # use authbind to give your user account permission to open port 80
    sudo touch /etc/authbind/byport/80
    sudo chown $USER /etc/authbind/byport/80
    sudo chmod 755 /etc/authbind/byport/80

    # get kswak from github
    cd ~
    git clone https://github.com/uid/kswak.git

    # update meteor packages
    cd ~/kswak
    meteor update

Then upload the `settings.json` file that you created in the previous section, and put it in `~/kswak`.

Next, set up a background `screen` for KSWAK so that it will keep running and displaying diagnostic output, even after you disconnect:

    # create a screen for kswak
    cd ~/kswak
    screen -S kswak

If you already started the kswak screen, here's how to get back into it:

    # get back into the kswak screen
    screen -r kswak

If KSWAK is hung, you can press Ctrl-C to stop it.

Finally, start up KSWAK.  The command below uses authbind to run on port 80, and uses a local mongod (but not Meteor's builtin mongod because that doesn't play well with authbind).  The local mongod should have been automatically started up when you installed mongod earlier in this section:

    # start up KSWAK
    MONGO_URL=mongodb://localhost/ authbind --deep meteor run --port=80 --settings settings.json

Once it says "App running at: http://localhost:80/", it is good to go.  You should be able to browse to your VM's IP address or hostname and see KSWAK's UI.

Press Ctrl-A d to detach from the screen, so that it stays running in the background of the VM.  You can log out of the VM now.


Getting student responses out in CSV 
----

Install mongodb, because you'll need the mongoexport tool.  If you followed the VM install instructions, you already did this.

Then run mongoexport, depending on the type of data you want:

   * Just the last student response to each question, in CSV format

       MONGO_URL=mongodb://localhost/ mongoexport -d admin -c responses --type csv --fields "timestamp,username,answer"  --sort={timestamp:1}

   * All events, in CSV format

       MONGO_URL=mongodb://localhost/ mongoexport -d admin -c events --type csv --fields "timestamp,type,username,choices,answer" --sort={timestamp:1}

