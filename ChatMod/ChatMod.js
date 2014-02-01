(function () { 
	
	var OriginalshowNotifications = UI.showNotifications; 
	
	var Nickname = "Unnamed";
	
	// Overrides original UI.showNotifications: this will skip and delete the notification pop up
	// binded to the ADD_CHAT_NOTIFICATION event
    UI.showNotifications = function (a) {
    	
    	var c = GameManager.company.activeNotifications;
    	
    	if ("ADD_CHAT_NOTIFICATION" != c[0].header){
    		
    		OriginalshowNotifications(a);
    		
    	}else{
    		c.pop();
    	}
    };
	
	var AddChat = function () {
		
		var SendNotification = {
				
				id: "ADD_CHAT_NOTIFICATION" + (new Date).getTime(),
				maxTriggers: 1,
				trigger: function (company) {
					return 1;
				},
				//because we dynamically create the notification every time the event triggers, we use getNotification
				getNotification: function (company) {
					
					//Saves the Nickname
					Nickname = company.staff[0].name;
					
					// Check if the panel already exists: if not, create it
					console.log($('#ChatModPanel').length);
					$('#ChatModPanel').length || $('#barLeft').append($('<div id="ChatModPanel">').load("mods/ChatMod/html/statusBarLeft.html", function () { AddName(); }));
					
					// Loads the new Chat panel into the main html (id: BarLeft)

					
					return new Notification("ADD_CHAT_NOTIFICATION", "");
				}
		};
		
		GDT.addEvent(SendNotification);
	};
	
	// Call back after load: initializes the chatclient.js
	var AddName = function () {
		
		// Checks if the name is usable and init the client
		Chatclient.changeName(Nickname) && Chatclient.init();
		$('#statusBarCustomized').draggable({ cancel: "p" });

	};
	
	var ready = function () {
		
	/*
	Adds Chat in game

	*/
	
	
		// Chat Panel		
		AddChat();

		
	};
	

	var error = function () {
		};

	GDT.loadJs(['mods/ChatMod/api/events.js',
	            'mods/ChatMod/helpers/checks.js',
	            'mods/ChatMod/chatclient.js'], ready, error);
	
})();