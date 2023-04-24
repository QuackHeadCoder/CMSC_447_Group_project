
import sqlite3
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


#Basic User Information
class User(db.Model):
    __tablename__ = 'users'
    username = db.Column(db.String(30), primary_key = True, unique = True, nullable=False)
    password = db.Column(db.String(30),nullable=False)
    currentLevel = db.Column(db.Integer, default = 1)
    topScore = db.Column(db.Integer, default = 0)
    dateAdded = db.Column(db.DateTime, default = datetime.utcnow)

    def __init__(self,username,password,currentLevel=1,topScore=0):
        self.username = username
        self.password = password
        self.currentLevel = currentLevel
        self.topScore = topScore
        self.dateAdded = datetime.now()

    def __repr__(self):
        return f"""
            username: '{self.username}'\n"
            password: '{self.password}'\n"
            currentLevel: '{self.currentLevel}'\n"
            topScore: '{self.topScore}'\n"
            dateAdded: '{self.dateAdded}'\n"
            """



#for testing purposes
def testingDB():

    #clearing database
    try:
        db.session.query(User).delete()
        db.session.commit()
    except:
        db.session.rollback()
    
    testUsers = [
        User("testUser1","password1",1,25),
        User("testUser2","password2",1,50),
        User("testUser3","password3",2,110),
        User("testUser4","password4",1,75),
        User("testUser5","password5",2,38),
    ]
    #adding some default users
    for users in testUsers:
        db.session.add(users)
    db.session.commit()




@app.route('/')
def index():
    #home page
    return render_template('index.html')



if __name__ == '__main__':
    

    with app.app_context():
        db.create_all() 
        #for testing purposes NEED TO REMOVE WHEN FINISHED
        testingDB()

        app.run(debug=True)



    