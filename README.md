map-dive
========

Map-Diving game for Google I/O 2013

[Application Architecture](https://github.com/Instrument/map-dive/blob/master/docs/architecture.md "Architecture") | [Using the Editor](https://github.com/Instrument/map-dive/blob/master/docs/editor.md "Dive Editor")


Installing Map Dive on a Liquid Galaxy
--------------------------------------

Please note, the following instructions are specific to the Liquid Galaxy hardware and software configuration.  The Map Dive game will work just fine on a single computer, but most of the UI overlay content will look really bad if the screen size is not set to 1080x1920 (HD in portrait configuration).  


Server
------

### 1) Get all the code

On the server node, pull the Github repo to your users home directory.

`https://github.com/Instrument/map-dive.git `


### 2) Install [node.js](http://nodejs.org/ "node.js") and [socket.io](http://socket.io// "socket.io")

After installing node.js, install the  package in the `server` folder.

	npm install socket.io


### 3) Keep node.js running

Create the following crontab file for your user and install it:

`pgrep -f node.*server.js >/dev/null || node map-dive/server/server.js &>/dev/null &`

Once installed the crontab should launch the servers automatically and relaunch them if they crash.


### 4) Start an HTTP server

All of the content in the `map-dive` folder should be served via HTTP.  Any HTTP server will work, the content is all static.


### 5) Create the global_config.js file

Copy `common/js/global_config.js.source` to `common/js/global_config.js`

Edit `common/js/global_config.js` and set the address of your server in the `WEBSOCKET_SERVER_ADDRESS` variable.


Boot Image
----------

After boot, all nodes should start a fullscreen instance of Google Chrome running in kiosk mode.


### Viewport Nodes

Viewports should all load chrome in full screen, and point to the viewport URL with the viewOffset value set to the correct index.  The center viewport is index zero.  For example, these three URLs are for the left, center, and right viewports.

	[server url]/viewport/index.html#viewOffset=1
	[server url]/viewport/index.html#viewOffset=0
	[server url]/viewport/index.html#viewOffset=-1


### Control Node

The head node, typically connected to a touch-screen display podium, needs to load the following url: 

	[server url]/control


Additionally, the head node is where the XTion depth camera needs to be connected via USB, and run the motion capture software.


### Motion Tracker

You will need to compile this application depending on your specific configuration, see the README file in the user tracker folder for your platform for instructions.  After building the app you should include `user_tracker_linux64/Bin` from the repo in the boot image otherwise you will have to rebuild the app whenever your reboot the system.

Finally, make the boot image for the head node. On the head node only, you should run the user tracker from the Bin folder at boot:

`sudo ./UserTracker &>/dev/null &`