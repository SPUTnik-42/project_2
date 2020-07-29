import os
from datetime import datetime
from flask import Flask, render_template, session, request, redirect, url_for
from flask_socketio import SocketIO, emit, send, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "chatserver"

socketio = SocketIO(app)

UserLs = ['admin']
RoomLs = ['lounge', 'news']
messages = []
@app.route("/")
def index():
   
    if session.get('username'):
        Room = session.get('cur_room')
        print(Room)
        return render_template('index.html', username = session.get('username'), rooms = RoomLs, messages= messages, Room = Room)
    else: 
        return redirect(url_for('signin'))

@app.route("/signin", methods=['GET', 'POST'])
def signin():
    

    session.clear()
    
    if request.method == 'POST':
        username = request.form.get('username')
        print(username)
        if username in UserLs:
            return "That username has already been taken !"
        else:
            session['username'] = username
            UserLs.append(username)
            print(UserLs)
        session.permanent = True 
        return redirect(url_for('index'))
        
    else:
        return render_template('signin.html')
@app.route("/create", methods=['GET', 'POST'])
def create():
    if request.method == 'POST':
        NewRoom = request.form.get('NewRoom')
        NewRoom = NewRoom.title()
        print(NewRoom)
        if NewRoom == None:
            return "room name invalid"
        elif NewRoom in RoomLs:
            return "room Exists"
        else:
            RoomLs.append(NewRoom)
            
        return redirect(url_for('index'))
        
    else:
        return render_template('create.html')

@app.route("/logout", methods=['GET'])
def logout():
    
    log_user = session.get('username')
    # Remove from list
    if log_user in UserLs:
        UserLs.remove(log_user)
    
    session.pop('username')

    
    session.clear()

    return redirect(url_for('index'))

@socketio.on('message')
def message(data):
    now = datetime.now()
    current_time = now.strftime('%b-%d %I:%M%p')
    print(f"\n\n{data}\n\n")
    session['cur_room'] = data['room']
    messages.append(data)
    send({'msg':data['msg'], 'username': data['username'], 'room': data['room'], 'time_stamp': current_time}, broadcast=True)

@socketio.on('join')
def join(data):
    session['room'] = data['room']
    session.permanent = True
    join_room(data['room'])
    send({'msg': data['username'] + " has joined the " + data['room'] + " room."}, room= data['room'], broadcast=True)

@socketio.on('leave')
def leave(data):
    session.pop('room')
    leave_room(data['room'])
    send({'msg': data['username'] + " has left the " + data['room'] + " room."}, room= data['room'], broadcast=True)

if __name__ == '__main__':
    socketio.run(app, debug=True)