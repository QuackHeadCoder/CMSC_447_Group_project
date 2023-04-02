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
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(30), unique = True, nullable=False)
    currentLevel = db.Column(db.Integer, nullable = False, default = 1)
    topScore = db.Column(db.Integer, default = 0)
    dateAdded = db.Column(db.DateTime, default = datetime.utcnow)

    def __repr__(self):
        return f"username: '{self.username}', id: {self.id}, currentLevel: {self.currentLevel}, dateAdded: {self.dateAdded}"
    
class Password(db.Model):
    __tablename__ = 'passwords'
    username = db.Column(db.String(30), db.ForeignKey('users.id'), primary_key = True)
    password = db.Column(db.String(30), nullable = False)

    def __repr__(self):
        return f"username: {self.username}, password: {self.password}"

class Score(db.Model):
    __tablename__ = 'scores'
    username = db.Column(db.String(30), db.ForeignKey('users.id'), primary_key = True)
    score = db.Column(db.Integer, default = 0, primary_key = True)

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
        print (f"{user.username}, {user.topScore}")
    return ""

@app.route('/getLeaderboard')
def getLeaderboard():
    #return top 10 scores from scores table
    scores = Score.query.order_by(Score.score).first(10)
    return scores

@app.route('/addNewUser', methods = ['POST'])
def addNewUser():
    #if username is not taken, add new user with new credentials
    #username and password for new account should be in request body
    pass

@app.route('/deleteUser', methods = ['POST', 'DELETE'])
def deleteUser():
    #delete preexisting user
    #safely remove from password, score, and user table
    #can use either post or delete method
    pass

@app.route('/getUserTopScore/<username>')
def getUserTopScore(username):
    #return top score of given user
    pass

@app.route('/checkPassword')
def checkPassword():
    #check if username and password are a match in the password database
    #request body should contain username and password
    pass

@app.route('/updateScore', methods = ['POST'])
def updateScore():
    #if score is high enough, update leaderboards table and current user's top score
    #request body should contain username and score
    pass

if __name__ == '__main__':
    with app.app_context():
        db.create_all() 
    app.run(debug=True)

    