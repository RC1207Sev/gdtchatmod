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
    	//console.log('Name changed into ' + myNickname);
    	
    };
    
    // It initializes 
    Chatclient.init = function () {
    	
    	
        content = $('#contentmodchat');
        input = $('#input');

        // get chromium websocket
        window.WebSocket = window.WebSocket;

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

        	input.removeAttr('disabled');

        	var json = JSON.stringify({type: 'handshake', data: myNickname});
        	connection.send(json);
        	$(this).val(''); //clear input box to be sure
        	//console.log('Chat Connected to ws://54.194.3.0:1337');
            addGenericMessage("Connected!", new Date(),'green');
        };

        connection.onerror = function (error) {
        	// just in there were some problems with connection...
        	content.html($('<p>', { text: 'Sorry, but there\'s some problem with your '
        		+ 'connection or the server is down.' } ));
        };

        // most important part - incoming messages
        connection.onmessage = function (message) {

        	try {
        		var json = JSON.parse(message.data);
        	} catch (e) {
        		//console.log('This doesn\'t look like a valid JSON: ', message.data);
        		return;
        	}

        	if (json.type === 'color') { // first response from the server with user's color
        		myColor = json.data;
        		
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
        		//console.log('wrong JSON received: ', json);
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
        	content.scrollTop(10000000);
        }

        /**
         * Add generic message without formatting (used for system notifications)
         * color: optional
         */
        function addGenericMessage(message, dt, color) {
        color || (color = 'black');
        content.append('<p style="margin: 0px; margin-top: 1px; color:' + color + '">[' + (dt.getHours() < 10 ? '0' + dt.getHours() : dt.getHours()) + ':'
        + (dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes())
        + '] ' + ': '
        + message + '</p>');
        Totalmessages += 1;
        content.scrollTop(10000000);
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
				$('#chat').show();
        		statusBarSize = 2;
        	}else{  // else it will return in the default state
        		$('#statusBarCustomized').css("width",normalSizes.width + "%").css("height",normalSizes.height + "px");
        		$('#contentmodchat').css("height",(normalSizes.height - 70) + "px");
        		statusBarSize = 1;
        	}
        	content.scrollTop(10000000);

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
        	content.scrollTop(10000000);

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