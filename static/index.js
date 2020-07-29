document.addEventListener('DOMContentLoaded', () => {
    var socket = io('http://' + document.domain + ':' + location.port);
    // Set default room
    var room;
     
    
    //VERIFY SOCKET IS CONNECTED
    socket.on('connect', function() {
        console.log('user is connected');

        if (localStorage.getItem("room")){
            room = localStorage.getItem("room")
            joinRoom(room)
        }
        else{
            room = "Lounge"
            joinRoom(room)
        }
        
                
    });

    //Display messages 
    socket.on('message', data => {
        if (data.username){
            
            const p = document.createElement('p');
            const br = document.createElement('br');
            const span = document.createElement('span');
            const span_time = document.createElement('span');
            span.innerHTML = data.username + ": ";
            span_time.innerHTML = data.time_stamp
            p.innerHTML = span.innerHTML + data.msg + "  " + "(" + span_time.innerHTML + ")" + br.innerHTML;
            document.querySelector('#display_message').append(p);
        }
        else{
            printSysMsg(data.msg);
        }
 
        
        
    });
    //SELECT THE MESSAGE FROM THE FORM 
    document.querySelector('#message_submit').onclick = () => {
       
        socket.send({'msg':document.querySelector('#message_input').value, 'username' : username, 'room': room});

                
        //clear input area 
        document.querySelector('#message_input').innerHTML = '';
    }
    
     // Select a room
    document.querySelectorAll('#select-room').forEach(button => {
        button.onclick = () => {
            let newRoom = button.innerHTML
            // Check if user already in the room
            if (newRoom === room) {
                msg = `You are already in ${room} room.`;
                printSysMsg(msg);
            } else {
                leaveRoom(room);
                joinRoom(newRoom);
                room = newRoom;
                localStorage.setItem("room", room);
            }
        };
    });

    function leaveRoom(room) {
        socket.emit('leave', {'username': username, 'room': room});
 
    }

    // Trigger 'join' event
    function joinRoom(room) {

        // Join room
        socket.emit('join', {'username': username, 'room': room});

        
        // Clear message area
        document.querySelector('#display_message').innerHTML = '';

        // Autofocus on text box
        document.querySelector("#message_input").focus();
    }

    // Scroll chat window down
    function scrollDownChatWindow() {
        const chatWindow = document.querySelector("#display_message");
        chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    // Print system messages
    function printSysMsg(msg) {
        const p = document.createElement('p');
        p.innerHTML = msg;
        document.querySelector('#display_message').append(p);
        scrollDownChatWindow()

        // Autofocus on text box
        document.querySelector("#messages").focus();
    }

    //print pre msgs
    function printPreMsg() {
        const p = document.createElement('p');
        if (pre_msg.room === room){
            p.innerHTML = pre_msg.msg

        }
        
    }
    
})