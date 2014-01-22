var Chatclient = {};
(function () {
    "use strict";
 
    // for better performance - to avoid searching in DOM
    var content;
    var input;
    var Totalmessages = 0;
 
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;
    // Chosen Nickname
    var myNickname = false;
    // check if already initialized
    var isInit = false;
 
    Chatclient.changeName = function (name){
    	
    	myNickname = name;
    	myName = true;
    	console.log('Name changed into ' + myNickname);
    	
    };
    
    // It initializes 
    Chatclient.init = function () {
    	
    	
        content = $('#contentmodchat');
        input = $('#input');

        // if user is running mozilla then use it's built-in WebSocket
        window.WebSocket = window.WebSocket || window.MozWebSocket;

        // if browser doesn't support WebSocket, just show some notification and exit
        if (!window.WebSocket) {
        	content.html($('<p>', { text: 'Sorry, but your browser doesn\'t '
        		+ 'support WebSockets.'} ));
        	input.hide();
        	$('span').hide();
        	return;
        }

        // open connection
        var connection = new WebSocket('ws://54.194.3.0:1337');

        connection.onopen = function () {
        	// first we want users to enter their names
        	input.removeAttr('disabled');
        	//status.text('Player Name');
        	var json = JSON.stringify({type: 'handshake', data: myNickname});
        	connection.send(json);
        	$(this).val(''); //clear input box to be sure
        	console.log('Chat Connected to ws://54.194.3.0:1337');
        };

        connection.onerror = function (error) {
        	// just in there were some problems with connection...
        	content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
        		+ 'connection or the server is down.' } ));
        };

        // most important part - incoming messages
        connection.onmessage = function (message) {
        	// try to parse JSON message. Because we know that the server always returns
        	// JSON this should work without any problem but we should make sure that
        	// the massage is not chunked or otherwise damaged.
        	try {
        		var json = JSON.parse(message.data);
        	} catch (e) {
        		console.log('This doesn\'t look like a valid JSON: ', message.data);
        		return;
        	}

        	// NOTE: if you're not sure about the JSON structure
        	// check the server source code above
        	if (json.type === 'color') { // first response from the server with user's color
        		myColor = json.data;
        		//status.text(myName + ': ').css('color', myColor);
        		input.removeAttr('disabled').focus();
        		// from now user can start sending messages
        	} else if (json.type === 'history') { // entire message history
        		// insert every single message to the chat window
        		for (var i=0; i < json.data.length; i++) {
        			addMessage(json.data[i].author, json.data[i].text,
        					json.data[i].color, new Date(json.data[i].time));
        		}
        	} else if (json.type === 'message') { // it's a single message
        		input.removeAttr('disabled'); // let the user write another message
        		addMessage(json.data.author, json.data.text,
        				json.data.color, new Date(json.data.time));
        	} else {
        		console.log('wrong JSON received: ', json);
        	}
        };

        /**
         * Send mesage when user presses Enter key
         */
        input.keydown(function(e) {

        	if (e.keyCode === 13) {

        		var msg = $(this).val(); //content of input box

        		if (!msg) {
        			return;
        		}

        		var json = JSON.stringify({type: 'message', data: msg});
        		connection.send(json);

        		$(this).val('');
        		// disable the input field to make the user wait until server
        		// sends back response
        		input.attr('disabled', 'disabled');
        	}
        });

        /**
         * This method is optional. If the server wasn't able to respond to the
         * in 3 seconds then show some error message to notify the user that
         * something is wrong.
         */
        setInterval(function() {
        	if (connection.readyState !== 1) {
        		//status.text('Error');
        		input.attr('disabled', 'disabled').val('Error: Unable to comminucate '
        				+ 'with the WebSocket server.');
        	}
        }, 4000);

        /**
         * Add message to the chat window
         */
        function addMessage(author, message, color, dt) {
        	content.append('<p style="margin: 0px; margin-top: 1px;">[' + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
        			+ (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
        			+ '] ' + '<span style="color:' + color + '">' + author + '</span>: '
        			+ message + '</p>');
        	Totalmessages += 1;
        	content.scrollTop(20 * Totalmessages);
        }


        /**
         * Status bar alteration functions
         */

        var max_button = $('#b_maximize');
        var min_button = $('#b_minimize');
        var close_button = $('#b_close');
        var statusBarSize;
        var OldHeight;
        var normalSizes = {};
        (function () {
        	normalSizes.height = 270;
        	normalSizes.width = 100;
        })();
        var largeSizes = {};
        (function () {
        	largeSizes.height = 600;
        	largeSizes.width = 200;
        })();
        var minimizedSizes = {};
        (function () {
        	minimizedSizes.height = 30;
        	minimizedSizes.width = 100;
        })();


        /**
         * Maximize the statusBar sizes
         */
        max_button.click(function() {

        	// if the status bar is not already maximized
        	if (2 != statusBarSize){
        		$('#statusBarCustomized').css("width", largeSizes.width + "%").css("height",largeSizes.height + "px");
        		$('#contentmodchat').css("height",(largeSizes.height - 70) + "px");
        		statusBarSize = 2;
        	}else{  // else it will return in the default state
        		$('#statusBarCustomized').css("width",normalSizes.width + "%").css("height",normalSizes.height + "px");
        		$('#contentmodchat').css("height",(normalSizes.height - 70) + "px");
        		statusBarSize = 1;
        	}
        	content.scrollTop(20 * Totalmessages);

        });


        /**
         * Minimize the statusBar sizes
         */
        min_button.click(function() {

        	// if the status bar is not already minimized
        	if (0 != statusBarSize){
        		$('#chat').hide();
        		$('#statusBarCustomized').css("width", minimizedSizes.width + "%").css("height",minimizedSizes.height + "px");
        		statusBarSize = 0;
        	}else{  // else it will return in the default state
        		$('#chat').show();
        		$('#statusBarCustomized').css("width",normalSizes.width + "%").css("height",normalSizes.height + "px");
        		statusBarSize = 1;
        	}
        	content.scrollTop(20 * Totalmessages);

        });

        /**
         * Close the statusBar
         */
        close_button.click(function() {

        	// correctly close the websocket
        	connection.onclose = function () {}; // disable onclose handler first
        	connection.close();
        	$('#statusBarCustomized').remove();	

        });

    };
    
})();