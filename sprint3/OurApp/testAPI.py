import requests

base = "http://127.0.0.1:5000/"

id=0
username = "testUser1"
password = "password1"
currentLevel = 2
topScore = 5000

header = {'Content-type':"application/json"}
response = requests.put(base+"/api/update_user")
#response = requests.put(base+"/api/update_user",json={"username":username,"id":id,"password":password,"currentLevel":currentLevel,"topScore":topScore},headers=header)
print(response)

#testing get data (for prof)
input("Press enter to continue\n")
response = requests.get(base+"/api/get")
print(response.json())


