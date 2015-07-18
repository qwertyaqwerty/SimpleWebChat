// REGISTER DOM ELEMENTS
var messageField = $('#messageInput');
var nameField = $('#nameInput');
var messageList = $('#messages');
var userList = $('#online-users');
var chatContainer = $('#chat-container');
var loginContainer = $('#login-container');
var serverConnection = $('#server-connection');

chatContainer.hide();
serverConnection.hide();

// CREATE REFERENCE TO FIREBASE
var messagesRef = new Firebase('https://glaring-torch-3549.firebaseIO.com/messages');
var usersRef = new Firebase('https://glaring-torch-3549.firebaseio.com/users/');

//client's online time
var onlineTime;

//Promise for handling firebase errors
var pushData = function(ref, data) {
  return new Promise(function(resolve, reject) {
    ref.push(data, function(e) {
      if (e == null)
        resolve();
      else
        reject(e);
    });
  });
};

var pushDataRemove = function(ref, data) {
  return new Promise(function(resolve, reject) {
    ref.push(data, function(e) {
      if (e == null)
        resolve();
      else
        reject(e);
    }).onDisconnect().remove();
  });
};

// handle KEYPRESS EVENT
function nameKeyPress(e) {
  if (e.keyCode == 13) {
    nameField.unbind();
    serverConnection.show();
    var username = nameField.val();
    if (username == '') {
      nameField.keypress(nameKeyPress);
      serverConnection.hide();
      alert("Username should not be empty");
    } else {
      usersRef.orderByChild("name").equalTo(username).once('value', function(snapshot) {
        if (snapshot.val() != null) {
          nameField.keypress(nameKeyPress);
          serverConnection.hide();
          alert("User exists!");
        } else {
          pushDataRemove(usersRef, {name: username, online: (new Date()).valueOf()}).then(function() {
            onlineTime = (new Date()).valueOf();
            serverConnection.hide();
            loginContainer.hide();
            chatContainer.show();
          }, function(e) {
            serverConnection.hide();
            nameField.keypress(nameKeyPress);
            alert("Can't connect to server!");
          });
        }
      });
    }
  }
}

nameField.keypress(nameKeyPress);

messageField.keypress(function (e) {
  if (e.keyCode == 13) {
    //FIELD VALUES
    var username = nameField.val();
    var message = messageField.val();

    messageField.val("");

    if (message == '') {
      alert("Message should not be empty");
    } else {
      //SAVE DATA TO FIREBASE
      pushData(messagesRef, {name:username, text:message}).then(function() {
      }, function(e) {
        alert("Failed to send message.");
      });
    }

    //prevent textarea from adding new line
    return false;
  }
});

//handle disconnection
var connectedRef = new Firebase("https://glaring-torch-3549.firebaseIO.com/.info/connected");
connectedRef.on("value", function(snap) {
  if (snap.val() == false && chatContainer.is(':visible')) {
    chatContainer.hide();
    loginContainer.show();
    nameField.keypress(nameKeyPress);
    alert("Connection lost");
  }
});

// Add a callback that is triggered for each chat message.
messagesRef.limitToLast(9).on('child_added', function (snapshot) {
  //GET DATA
  var data = snapshot.val();
  var username = data.name || "anonymous";
  var message = data.text;

  //CREATE ELEMENTS MESSAGE & SANITIZE TEXT
  var messageElement = $("<li>");
  var contentElement = $("<p>")
  var nameElement = $("<strong class='example-chat-username'></strong>")
  nameElement.text(username);
  contentElement.text(message).prepend(nameElement);
  messageElement.append(contentElement);

  //ADD MESSAGE
  messageList.append(messageElement)

  //SCROLL TO BOTTOM OF MESSAGE LIST
  messageList[0].scrollTop = messageList[0].scrollHeight;
});


//User online
usersRef.on('child_added', function (snapshot) {
  //GET DATA
  var data = snapshot.val();
  var username = data.name || "anonymous";

  //CREATE ELEMENTS USER NAME
  var listElement = $("<li title='" + username + "'>");
  var nameElement = $("<strong class='example-chat-username'></strong>")
  nameElement.text(username);
  listElement.text(nameElement.text());

  //ADD USER
  userList.append(listElement);

  //Add message
  if (onlineTime < data.online) {
    var messageElement = $("<li>");
    var contentElement = $("<p>");
    contentElement.append(($("<i>").text("joined the room")));
    var nameElement = $("<strong>");
    nameElement.text(username);
    contentElement.prepend(nameElement);
    messageElement.append(contentElement);

    messageList.append(messageElement);

    messageList[0].scrollTop = messageList[0].scrollHeight;
  }
});


//User offline
usersRef.on('child_removed', function (snapshot) {
  //GET DATA
  var data = snapshot.val();
  var username = data.name || "anonymous";

  //REMOVE USER
  $('#online-users li').remove("li[title='" + username + "']");

  //Add message
  var messageElement = $("<li>");
  var contentElement = $("<p>");
  contentElement.append(($("<i>").text("left the room")));
  var nameElement = $("<strong>");
  nameElement.text(username);
  contentElement.prepend(nameElement);
  messageElement.append(contentElement);

  messageList.append(messageElement);

  messageList[0].scrollTop = messageList[0].scrollHeight;
});
