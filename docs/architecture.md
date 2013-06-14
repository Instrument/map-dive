Architecture
------------

![architecture diagram](https://github.com/instrument/map-dive/raw/master/docs/architecture.png)


Static HTML Content
-------------------

Both the view and control nodes are simply web pages that run in Chrome, all content is static and served over HTTP rather than run from the local filesystem (otherwise you will run into security restrictions for the webGL content). You can use any http server to host the content, all files are static.  For the MapDiving installation we used node.js to serve the content, but any HTTP server should work just fine.

*IMPORTANT*: When you first check out the source, you will need to duplicate `common/js/global_config.js.source` and rename it to `common/js/global_config.js` otherwise the viewport and control pages will not load.


Socket Server
-------------

Messages are routed between the various components in this system via an instance of Node.js.  

The server receives UDP messages from the user tracking application via UDP and routes them to the control console.  The control console sends game state updates via websockets which are broadcast to all the connected viewports (again via websockets).  As a result, the node.js instance is critical for the system to funciton. For long-term installation, it is recommended that a cron job be set up (or something equivelant) to ensure that the server is always running (restarting it if needed).

Please note: The server component for this project will open up ports for incoming TCP and UDP connections without any authentication.  You should not expose the server to public networks and make sure to have proper firewalls in place or your computer may be vulnerable to attacks.


Control Console
---------------

The viewports don't actually do anything on their own, they are simply displaying the game state sent from the server via web sockets.  To control the views, open 
the control console in a separate browser window.  The control console processes all of the game logic and player input.  Game state and events are sent to the node.js server to be broadcast to all of the connected view nodes at a regular interval.

To load the control console, open the following url in Chrome:

**server url**/control/index.html

It's fine to run the control console and view nodes on the same computer, but they should be in separate browser windows, not just separate tabs. The reason for this is that the control console must be on a visible tab in the browser since the game updates are tied to a requestAnimationFrame loop.  As a result the game to halt if the control console tab is not visible.


View Nodes
----------

Each view node is an instance of Chrome pointing to a common URL, with a parameter to adjust the camera offset.  Zero is the center viewport, and viewports 
are addressed in increments of one.  View nodes can be multiple instances of Chrome on a single computer, or spread across multiple computers.  You can set it up however you would like.  To maximize performance a dedicated computer is recommended for each of the seven displays (as is the case for the liquid galaxy configuration).

**Note**: The 2d content (mini-map, search info, etc) is displayed based on view index, and was built specifically for use with seven view nodes each running a display at 1080x1920 pixels.  The 2d layers will likely not look correct at different screen sizes.


Player Tracker
--------------

A native C++ app was created to track the players using a 3d sensor. The app uses openNI2 / NiTE 2 and an Asus XTion (or any other supported depth sensor) to track the player and send the angle of both arms and the torso over UPD to the node.js server.  The node.js instance forwards this tracking data on to the control console for use in the game logic.

You can set the host name and port number via *usertracker.ini*, The host refers to the node.js server instance.  If you change the port number you will also need to change the UDP server port in server.js.

The user tracker should be run as root in order to access the device correctly.


Configuration
-------------

Global configuration for the system is kept in js/common/global_config.js.  This file contains configuration for the address of the node.js server, as well as the metrics for the array of screens.  It is assumed that the screens are all the same size, and are arranged in an evenly spaced row (or semi-circle).