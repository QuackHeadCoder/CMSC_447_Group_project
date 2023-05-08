
import sqlite3
from flask import Flask, request, jsonify, json, render_template, url_for, redirect, flash, session
from flask_cors import CORS, cross_origin
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import login_user, login_required, logout_user, LoginManager, current_user, UserMixin

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite3'
app.config['SECRET_KEY'] = 'shhh this is a secret'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.login_view = 'auth.login'
login_manager.init_app(app)

    


#locates user from username/key
@login_manager.user_loader
def load_user(username):
    return User.query.get(username)

@app.route('/api/get', methods = ['GET'])
def getJson():
    return {"data:":
                [
                    {
                        "Group": "A",
                        "Title":"Top 5 Scores",
                        "<1st Name>": "<1st score>",
                    	"<2nd Name>": "<2nd score>",
                        "<3nd Name>": "<3nd score>",
                        "<4nd Name>": "<4nd score>",
                        "<5nd Name>": "<5nd score>",
                    }
                ]
            }

@app.route('/api/update_user', methods = ['PUT'])
def updateUser():
    
    json = request.get_json()
    if json is None:
        return "Not okay"

    #validation
    if (json.get("username") is not None and 
        json.get("password") is not None and
        json.get("id") is not None and
        json.get("currentLevel") is not None and
        json.get("topScore") is not None):
        
        username = json.get("username")
        password = json.get("password")
        id = json.get("id")

        user = User.query.filter_by(username=username).first()
        if user:
            if user.password == password and user.id == id:
                
                user.currentLevel = json.get("currentLevel")
                user.topScore = json.get("topScore")
                db.session.commit()
                return 'ok'

    
    return "Not okay"

#Basic User Information
class User(UserMixin,db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement = True)
    username = db.Column(db.String(30), unique = True, nullable=False)
    password = db.Column(db.String(30),nullable=False)
    currentLevel = db.Column(db.Integer, default = 1)
    topScore = db.Column(db.Integer, default = 0)
    dateAdded = db.Column(db.DateTime, default = datetime.utcnow)

    def getJson(self):
        return json.dumps({
            "id": self.id,
            "username": self.username,
            "password": self.password,
            "currentLevel": self.currentLevel,
            "topScore": self.topScore,
            "dateAdded": self.dateAdded,
        })

    def __repr__(self):
        return f"""
            id: '{self.id}'
            username: '{self.username}'
            password: '{self.password}'
            currentLevel: '{self.currentLevel}'
            topScore: '{self.topScore}'
            dateAdded: '{self.dateAdded}'
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
        User(id=0,username="testUser1",password=generate_password_hash("password1",method='sha256'),currentLevel=1,topScore=25),
        User(id=1,username="testUser2",password=generate_password_hash("password2",method='sha256'),currentLevel=1,topScore=125),
        User(id=2,username="testUser3",password=generate_password_hash("password3",method='sha256'),currentLevel=2,topScore=35),
        User(id=3,username="testUser4",password=generate_password_hash("password4",method='sha256'),currentLevel=2,topScore=65),
        User(id=4,username="testUser5",password=generate_password_hash("password5",method='sha256'),currentLevel=1,topScore=85),
    ]

    #adding some default users
    for users in testUsers:
        db.session.add(users)

    db.session.commit()

@app.route('/get',methods=['GET'])
def getCurrentUser():
    if current_user.is_authenticated:
        user = User.query.filter_by(id=current_user.id).first()
        return user.getJson()
    else:
        return "Error login required"


#home page
@app.route('/', methods = ['GET','POST'])
def index():
    if request.method == 'POST':
        #for using the navbar login
        if request.form.get('login-nav') is not None:
            username = request.form.get('username-nav')
            password = request.form.get('password-nav')
            user = User.query.filter_by(username=username).first()
            if user:
                if check_password_hash(user.password,password):
                   login_user(user,remember=True)
                   return redirect(url_for("index"))
                
        
        elif request.form.get('create_new_user-nav') is not None:
            newUser = request.form.get('username-nav')
            newPass = request.form.get('password-nav')
            user = User.query.filter_by(username=newUser).first()

            #user exist
            if(user):
                return redirect(url_for("index"))
            #username too short
            elif len(newUser) < 4:
                return redirect(url_for("index"))
            #password too short
            elif len(newPass) < 6:
                return redirect(url_for("index"))
            #valid
            else:
                newUser = User(username=newUser, password=generate_password_hash(newPass,method='sha256'))
                db.session.add(newUser)
                db.session.commit()
                login_user(newUser,remember=True)
                return redirect(url_for("index"))
        elif request.form.get('logout-nav') is not None:
            logout_user()
            return redirect(url_for('index'))

            




        #for using the login below the JS
        if request.form.get('login') is not None:
           username = request.form.get('username')
           password = request.form.get('password')

           user = User.query.filter_by(username=username).first()
           if user:
               if check_password_hash(user.password,password):
                   login_user(user,remember=True)
                   return redirect(url_for("index"))
               else:
                   flash("Incorrect username or password, try again.", category = 'error')
           else:
               flash("Incorrect username or password, try again.", category = 'error')

        elif request.form.get('create_new_user') is not None:
            newUser = request.form.get('username')
            newPass = request.form.get('password')

            user = User.query.filter_by(username=newUser).first()
            if(user):
                flash("Username already in use, try again.", category = 'error')
            elif len(newUser) < 4:
                flash("Username must be more than 4 characters", category = 'error')
            elif len(newPass) < 6:
                flash("password must be more than 6 characters", category = 'error')
            else:
                newUser = User(username=newUser, password=generate_password_hash(newPass,method='sha256'))
                db.session.add(newUser)
                db.session.commit()
                login_user(newUser,remember=True)
                return redirect(url_for("index"))
            
        elif request.form.get('logout') is not None:
            logout_user()
            return redirect(url_for('index'))
        


    return render_template('index.html', user=current_user)





if __name__ == '__main__':
    

    with app.app_context():
        db.create_all() 
        #for testing purposes NEED TO REMOVE WHEN FINISHED
        testingDB()

        app.run(debug=True)



    