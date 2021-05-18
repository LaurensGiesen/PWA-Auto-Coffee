#IMPORTS
import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import RPi.GPIO as GPIO
from time import sleep
import threading
import signal

#DEVICE VARIABLES
Key = "1234" #later on this can be moved to a json file maybe
Status = u"online" #will be updated to or from the database || initial on "online" because device will only send offline status to db, before shut down
ReservoirFull = u"False" #will be updated to the database as a string
#local globals
blinkspeed = 0.5
pairingTime = 20
relay1IsOn = False
relay2IsOn = False

#FIREBASE INITIALIZATION
cred = credentials.Certificate("firebase-servAccKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

coll_d = db.collection('Devices') #quick reference to the device collection
doc_d = coll_d.document(Key)

#GPIO SETUP
#disable warnings
GPIO.setwarnings(False)
#set mode to GPIO BOARD
GPIO.setmode(GPIO.BOARD)

#GPIO PINS
sensorReservoirPin = 11
btnPairing = 12
btnRelay1 = 13
btnRelay2 = 15
ledRedPin = 37
relayPins = [35,33,31,29]

#GPIO SETUP
GPIO.setup(sensorReservoirPin, GPIO.IN, pull_up_down=GPIO.PUD_UP) #sensorReservoir
GPIO.setup(btnPairing, GPIO.IN, pull_up_down=GPIO.PUD_UP) #btnPairing
GPIO.setup(btnRelay1,GPIO.IN, pull_up_down=GPIO.PUD_UP) #btnRelay1
GPIO.setup(btnRelay2,GPIO.IN, pull_up_down=GPIO.PUD_UP) #btnRelay2
GPIO.setup(ledRedPin,GPIO.OUT) #ledRED

#turn off all relay pins
for i in relayPins: #set up all relayPins and turn them off
    GPIO.setup(i, GPIO.OUT)
    GPIO.output(i, GPIO.HIGH) #turn off


#FUNCTIONS
#Led controll
def on(i):
    GPIO.output(i, GPIO.HIGH)

def off(i):
    GPIO.output(i,GPIO.LOW)

#relay controll
def relayOn(i):
    GPIO.output(i,GPIO.LOW)

def relayOf(i):
    GPIO.output(i,GPIO.HIGH)

#procedures    
def db_init_device():
    doc_d.set({
        u"Status":Status,
        u"reservoirFull" : reservoirFull
    })

def pairing_process():
    global Status
    global blinkspeed
    Status = u"Pairing"
    blinkspeed = 0.2
    sleep(pairingTime)
    blinkspeed = 0.5
    Status = u"Online"

def print_device_Status():
    print("Status LOCAL:", Status)

def listen_db_status():
    doc = doc_d.get()
    if doc.exists:
        print(u"Status DB:", doc)
    else:
        print("SOMETHING WENT WRONG IN DB LISTENER")

#BUTTONS
#Callbacks
def button_pairing_callback():
    threading.Thread(target=pairing_process).start()

def sensor_reservoir_callback():
    global ReservoirFull
    if GPIO.input(11) and reservoirFull: #Rising
        print("Geen Water")
        coll_d.document(Key).update({u"reservoirFull":u"False"})
        ReservoirFull = u"False"
    elif GPIO.input(11) != 1 and not reservoirFull: #falling
        print("Water")
        coll_d.document(Key).update({u"reservoirFull":u"True"})
        ReservoirFull = u"True"

def button_relay1_callback(channel):
    global relay1IsOn
    if not relay1IsOn:
        relayOn(relayPins[0])
        relay1IsOn = True
    elif relay1IsOn:
        relayOf(relayPins[0])
        relay1IsOn = False

def button_relay2_callback(channel):
    global relay2IsOn
    if not relay2IsOn:
        relayOn(relayPins[1])
        relay2IsOn = True
    elif relay2IsOn:
        relayOf(relayPins[1])
        relay2IsOn = False

#add event detects
GPIO.add_event_detect(btnPairing,GPIO.RISING,callback=button_pairing_callback)
GPIO.add_event_detect(btnRelay1,GPIO.RISING,callback=button_relay1_callback)
GPIO.add_event_detect(btnRelay2,GPIO.RISING,callback=button_relay2_callback)
GPIO.add_event_detect(sensorReservoirPin,GPIO.BOTH,callback=sensor_reservoir_callback, bouncetime= 200)

#running
#1 initialize device
init_device()
#2 loop
try:
    while True:
        on(ledRedPin)
        sleep(blinkspeed)
        off(ledRedPin)
        sleep(blinkspeed)
        listen_db_status()
        print_device_Status()
