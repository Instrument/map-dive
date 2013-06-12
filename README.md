map-dive
========

Map-Diving game for Google I/O 2013

A detailed explaination of the architecture [can be found here](https://github.com/Instrument/map-dive/blob/master/docs/architecture.md "Architecture"). 


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

You must include `user_tracker_linux64/Bin` from the repo in the boot image.  You may need to compile this application depending on your specific configuration.

Before making the image, in the Bin folder, the usertracker.ini file needs to be edited so that the host line matches the name of the server.

Then make the boot image for the head node. At boot time, on the head node only, this should be run as root from where the Bin folder:

`sudo ./UserTracker &>/dev/null &`