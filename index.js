// Setup basic express server
var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3024;


const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

server.listen(port, () => {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(path.join(__dirname, 'public')));

// Chatroom

var numUsers = 0;

//Client connects to the server 
io.on('connection', (socket) => {
    console.log("New Connection");

    SerialPort.list((err, ports) => {
      var portsList = [];
      ports.forEach((port) => {
        portsList.push(port.comName);
        console.log("port found: " + port.comName);
      });
      socket.emit('serialportlist', portsList);
    });

    var getPortsList = (callback) => {
      var portsList = [];
    
      SerialPort.list((err, ports) => {
        ports.forEach((port) => {
          portsList.push(port.comName);
        });
    
        callback(null, portsList);
      });
    };

    socket.on('new session', (data) => {

      socket.serialPortPath = data.serialPortPath;
      socket.baudrate=data.baudrate;
      if(socket.serialPort){
          try{
            socket.serialPort.close(function (err) {
              console.log('port close err', err);
            });
            console.log('port closed');
          }catch(e){
            console.error(e)
            socket.emit('clsong failed', {}); 
          }
      }
      try{
        socket.serialPort = new SerialPort(socket.serialPortPath, { baudRate: parseInt(socket.baudrate) });
        socket.serialPortParser = new Readline()
        socket.serialPort.pipe(socket.serialPortParser)

	      socket.serialPortParser.on('data', (line) => 
          //console.log(`> ${line}`)
          socket.emit('new message',line)
        )

        console.log("New Session Started");
        socket.emit('session started', {});       
      }catch(e){
        console.error(e)
        socket.emit('session failed', {}); 
      }
 
    });

	
    socket.on('writePort', (data) => {
      //TODO: Update Open Serial Ports List
      console.log("changing mode");
      if(socket.serialPort){
        socket.serialPort.write(data, function(err) {
          if (err) {
            return console.log('Error on write: ', err.message)
          }
          console.log('message written')
        })
      }
    });

    socket.on('disconnect', () => {
      //TODO: Update Open Serial Ports List 
      if(socket.serialPort){
          try{
            socket.serialPort.close(function (err) {
              console.log('port close err', err);
            });
            console.log('port closed');
          }catch(e){
            console.error(e)
            socket.emit('clsong failed', {}); 
          }
      }
      socket.serialPort = null;
      console.log("disconnect");
    });
});
