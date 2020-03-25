$(function() {



  // Initialize variables
  var $window = $(window);

  var $serialPortPathInput = $('#serialPortPathInput');
  var $baudrateInput = $('#baudrateInput');
  var $messageList = $('.messageList');
  var $modus_select = $('#modus_select');



  // Prompt for setting a username
  var connected = false;

  var socket = io();

  // Open Serial Port
  const beginSession = () => {
    var serialPortPath = cleanInput($serialPortPathInput.val().trim());
    var baudrate = cleanInput($baudrateInput.val().trim());

    // If the serialPortPath and baudrate are valid
    if (serialPortPath && baudrate) {
      console.log(serialPortPath,baudrate);
      //alert(serialPortPath,baudrate);
      socket.emit('new session', {
        serialPortPath:serialPortPath,
        baudrate:baudrate
      });
    }
  }

  // Sends a chat message
  const sendMessage = () => {
    var message = $inputMessage.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputMessage.val('');
      addChatMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
    const log = (message, options) => {
    var $el = $('<li>').addClass('log').text(message);
    addMessageElement($el, options);
  }

  // Adds the visual chat message to the message list
  const addChatMessage = (data) => {
    // Don't fade the message in if there is an 'X was typing'
    //var $typingMessages = getTypingMessages(data);
    // options = options || {};
    // if ($typingMessages.length !== 0) {
    //   options.fade = false;
    //   $typingMessages.remove();
    // }

    // var $usernameDiv = $('<span class="username"/>')
    //   .text(data.username)
    //   .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span style="font-size: 1000%;" class="messageBody">').text(data);

    // var typingClass = data.typing ? 'typing' : '';
    var $messageDiv = $('<li class="message"/>')
      // .data('username', data.username)
      // .addClass(typingClass)
      .append($messageBodyDiv);

    addMessageElement($messageDiv, {});
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  const addMessageElement = (el, options) => {
    // for(var $c in $messageList[0].childNodes){
    //   $messageList.removeChild($c);
    // }
    $messageList.empty();
    var $el = $(el);
    $messageList.append($el);
    
    $messageList[0].scrollTop = $messageList[0].scrollHeight;
  }

  // Prevents input from having injected markup
  const cleanInput = (input) => {
    return $('<div/>').text(input).html();
  }



  // Gets the color of a username through our hash function

///////////////////////////////////// Click events /////////////////////////////////////

  $("#btnOpenPort").click(function(){
    //alert(" clicked.");
    //alert(serialPortPath,baudrate);
    beginSession();
  });


  $modus_select.change(function(){
    if($modus_select.val() == "u"){
      socket.emit('writePort', "0");
    }
    else if($modus_select.val() == "i"){
      socket.emit('writePort', "1");
    }
  });


 
  ///////////////////////////////////// Socket events /////////////////////////////////////

  socket.on('serialportlist', (data) => {
    console.log("received ports");
    data.forEach((port) => {
      $('#availableSerialPorts').append('<option value="' +port + '"></option>');
      console.log("port added: " + port);
    });
    $serialPortPathInput.val(data[0]);

  });

  // Whenever the server emits 'login', log the login message
  socket.on('session started', (data) => {
    console.log("session started");
    connected = true;
    // Display the welcome message
    var message = "Serial Port Opened";
    log(message, {
      prepend: true
    });
    //addParticipantsMessage(data);
  });

  socket.on('session failed', (data) => {
    console.log("session failed");
    connected = true;
    // Display the welcome message
    var message = "Serial Port Failed to Open";
    log(message, {
      prepend: true
    });
    //addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the chat body
  socket.on('new message', (data) => {
    addChatMessage(data);
    //console.log(data)
  });




/*   socket.on('disconnect', () => {
    log('you have been disconnected');
  });

  socket.on('reconnect', () => {
    log('you have been reconnected');
    if (username) {
      socket.emit('add user', username);
    }
  });

  socket.on('reconnect_error', () => {
    log('attempt to reconnect has failed');
  }); */

});
