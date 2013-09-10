var app = require('http').createServer(handler),
  dgram = require("dgram"),
  fs = require('fs'),
  io = require('socket.io').listen(app),
  pg = require('commander'),
  qs = require('querystring');

pg
  .option( '-p, --port [port]', 'Listen port [8800]', '8800' )
  .option( '-u, --udp  [port]', 'UDP port [12345]', '12345' )
  .parse( process.argv );

var listenPort = Number(pg.port);
var udpPort = Number(pg.udp);

// Used by the level editor, writes a bunch of json into a file.
function saveLevel(name, json, _cb){
  fs.writeFile("../common/levels/" + name + ".json", json, function(err) {
      if(err) {
          console.log(err);
      } else {
          console.log("The file was saved!");
      }
      _cb();
  });
}

// Start the socket server.
app.on("listening", function () {
	var address = app.address();
	console.log("TCP server listening for displays on " + address.address + ":" + address.port);
});
app.listen(listenPort);


// Handler for HTTP requests.
function handler (req, res) {

  if( req.method == 'GET'){

    fs.readFile(__dirname + '/index.html',
      function (err, data) {
        if (err) {
          res.writeHead(500);
          return res.end('Error loading index.html');
        }

        res.writeHead(200);
        res.end(data);
      });
  }
  

  // Level editor posts data to the node.js instance to be written to disk (manual steps are required otherwise like copy/paste from browser)
  if ((req.method == 'POST') && (req.url == "/save-level")) {
    var body = '';
    
    req.on('data', function (data) {
      // store the data coming in.
      body += data;

      // ignore enormous posts, this should never happen.
      if (body.length > 1e6) {
          req.connection.destroy();
      }
    });

    req.on('end', function () {
      var POST = qs.parse(body);

      saveLevel(POST.name, POST.json, function() {
        res.writeHead(200);
        res.end("thanks");
        console.log("done saving.");
      });

    });
  }
}


// the list of connected clients.
var clients = [];

io.set('log level', 2);

// Set up new sockets
io.sockets.on('connection', function (socket) {

  // route messages.
  socket.on('viewstate', function (data) {
    io.sockets.in("viewport").emit('viewstate', data );
  });

  socket.on('message', function (data) {
    io.sockets.in("viewport").emit('message', data );
  });

  socket.on('editor', function (data) {
    io.sockets.in("viewport").emit('editor', data );
  });

  socket.on('input', function(data){
    io.sockets.in("controller").emit("input", data);
  });

  // Status messages are sent when clients initially connect.
  socket.on('status', function (data){
    if(data["type"] == "viewport"){
      socket.join("viewport");
      console.log("Adding to viewports.  Total viewports:" + io.sockets.clients("viewport").length);
    }
    if(data["type"] == "controller") {
      if(io.sockets.clients("controller").length == 0){
        socket.join("controller");
        console.log("Adding to controllers..");
      } else {
        console.log("Controller already exists! Ignoring connection..");
        socket.disconnect();
      }
    }

    if(data["type"] == "input"){
      socket.join("inputs");
      console.log("Adding to inputs..");
    }
  });

});




// UDP server, listens to messages from the motion controller
var UDPserver = dgram.createSocket("udp4");

// Got message over UDP, forward it to the controller node.
UDPserver.on("message", function (msg, rinfo) {
	io.sockets.in("controller").emit( 'osc', JSON.parse(msg) );
});

UDPserver.on("listening", function () {
	var address = UDPserver.address();
	console.log("UDP server listening for user_tracker on " + address.address + ":" + address.port);
});

UDPserver.bind(udpPort);
