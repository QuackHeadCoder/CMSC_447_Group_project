from flask import Flask, request, jsonify, json, render_template, url_for, redirect
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SECRET_KEY'] = 'shhh this is a secret'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    username = db.Column(db.String(30), unique = True, nullable=False)
    currentLevel = db.Column(db.Integer, default = 1)
    topScore = db.Column(db.Integer, default = 0)
    dateAdded = db.Column(db.DateTime, default = datetime.utcnow)

    def __repr__(self):
        return f"username: '{self.username}', id: {self.id}, currentLevel: {self.currentLevel}, dateAdded: {self.dateAdded}, topScore: {self.topScore}"
    
class Password(db.Model):
    __tablename__ = 'passwords'
    username = db.Column(db.String(30), db.ForeignKey('users.id'), nullable = False, primary_key = True)
    password = db.Column(db.String(30), nullable = False)

    def __repr__(self):
        return f"username: {self.username}, password: {self.password}"

class Score(db.Model):
    __tablename__ = 'scores'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    username = db.Column(db.String(30), db.ForeignKey('users.id'))
    score = db.Column(db.Integer, default = 0)

    def __repr__(self):
        return f"username: {self.username}, score: {self.score}"


@app.route('/')
def index():
    #home page
    return render_template('index.html')


@app.route('/getAllUsers')
def getAllUsers():
    #return list of all users and their top score
    users = User.query.all()
    for user in users:
        print (user)
    return "getAllUsers called"

@app.route('/getLeaderboard')
def getLeaderboard():
    #return top 10 scores from scores table
    scores = Score.query.order_by(Score.score.desc()).limit(10).all()
    print(scores)
    return "getLeaderboard called"

@app.route('/addNewUser', methods = ['POST', 'GET'])
def addNewUser():
    #if username is not taken, add new user with new credentials
    #username and password for new account should be in request body
    if(request.method in ['POST','OPTIONS']):

        username = request.form['username']

        oldUser = User.query.filter_by(username=username).first()
        if(oldUser):
            return f"username '{username}' already taken "
        
        
        password = request.form['password']
        newUser = User(username = username,currentLevel = 1, topScore=0)
        newPassword = Password(username = username, password = password)
        
        db.session.add(newUser)
        db.session.add(newPassword)
        db.session.commit()

        return f"new user with username: '{username}' added"
    
    else: #get request
        return render_template('createUser.html')


@app.route('/deleteUser', methods = ['DELETE', 'OPTIONS', 'GET'])
def deleteUser():
    #delete preexisting user
    #safely remove from password, score(s), and user objects
    if(request.method in ['DELETE', 'OPTIONS']):
        username = request.args['username']

        user = User(username = username)
        password = Password(username = username)
        scores = Score.query.filter_by(username = username).all()

        if(user):
            for score in scores:
                db.session.delete(score)
            db.session.delete(password)
            db.session.delete(user)
            db.session.commit()
            return f"deleted user {username}"
        else:
            return f"user {username} not found"
    else:
        return f"deleteUser called"


@app.route('/getUserTopScore/<username>')
def getUserTopScore(username):
    #return top score of given user
    user = User.query.filter_by(username=username).first()
    if user:
        return f"{user.topScore}"
    else:
        return '0'

#helper function for logging in
def checkPassword(username, password):
    #check if username and password are a match in the password database
    user = User.query.filter_by(username=username).first()
    if(not user):
        return f"user {username} not found"
    userPassword = Password.query.filter_by(username=username).first()
    if(password == userPassword.password):
        return 'Match Found !'
    return 'Username and Password do not match.'

@app.route('/updateScore', methods = ['POST', 'OPTIONS', 'GET'])
def updateScore():
    #if score is high enough, update leaderboards table and current user's top score
    #request body should contain username and score
    #also update user's level if needed
    if(request.method in ['POST', 'OPTIONS']):
        username = request.args['username']
        score = request.args['score']

        user = User.query.filter_by(username = username).first()
        if(user):
            if(score > user.topScore()):
                db.session.query(User).filter_by(username = username).first().update({"topScore":score})
            
            scores = Score.query.order_by(Score.score.desc()).limit(10).all()
            if(score>scores[-1]):
                newScore = Score(username=username, score=score)
                db.session.add(newScore)

            db.session.commit()

            return f"scores updated"
        
        return f"user not found"

    else:
        return f"updateScore called"

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
        app.run(debug=True)

    