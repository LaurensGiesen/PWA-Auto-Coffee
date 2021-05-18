import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import RPi.GPIO as GPIO
from time import sleep
import threading

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.cleanup()

btnPairing = 12
btnRelay1 = 13
btnRelay2 = 15
sensorReservoirPin = 11
ledRedPin = 37

GPIO.setup(btnPairing, GPIO.IN, pull_up_down=GPIO.PUD_UP) #btnPairing
GPIO.setup(btnRelay1,GPIO.IN, pull_up_down=GPIO.PUD_UP) #btnRelay1
GPIO.setup(btnRelay2,GPIO.IN, pull_up_down=GPIO.PUD_UP) #btnRelay2

GPIO.setup(sensorReservoirPin, GPIO.IN, pull_up_down=GPIO.PUD_UP) #sensorReservoir
GPIO.setup(ledRedPin,GPIO.OUT) #ledRED

relayPins = [35,33,31,29]

for i in relayPins: #set up all relayPins and turn them off
    GPIO.setup(i, GPIO.OUT)
    GPIO.output(i, GPIO.HIGH) #turn off



cred = credentials.Certificate("firebase-servAccKey.json")
firebase_admin.initialize_app(cred)

db = firestore.client()

coll_d = db.collection('Devices')

Key = "1234"
pairing = False
blinkspeed = 0.5

reservoirFull = False

relay1IsOn = False
relay2IsOn = False

def on(i):
    GPIO.output(i, GPIO.HIGH)

def of(i):
    GPIO.output(i,GPIO.LOW)

def relayOn(i):
    GPIO.output(i,GPIO.LOW)

def relayOf(i):
    GPIO.output(i,GPIO.HIGH)

def init_device():
    coll_d.document(Key).set({u"Status": u"Available", "reservoirFull":False})

devInitialized = False
    
def pairing_start():
    global pairing
    global blinkspeed
    pairing = True
    blinkspeed = 0.1
    print("pairing True")
    coll_d.document(Key).update({u"Status":u"Pairing"}) #maak pairing collection met document "KEY"
    
    sleep(20)
    pairing_end()
        
def pairing_end():
    global pairing
    global blinkspeed
    print("pairing False")
    coll_d.document(Key).update({u"Status":u"Available"})
    pairing = False
    blinkspeed = 0.5


def button_pairing_callback(channel):
    global pairing
    if not pairing: #pairing
        pairing_start()
    elif pairing:
        pairing_end()

def sensor_reservoir_callback():
    global reservoirFull
    if GPIO.input(11) and reservoirFull: #Rising
        print("Geen Water")
        coll_d.document(Key).update({u"reservoirFull":u"False"})
        reservoirFull = False
    elif GPIO.input(11) != 1 and not reservoirFull: #falling
        print("Water")
        coll_d.document(Key).update({u"reservoirFull":u"True"})
        reservoirFull = True

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

def listen_status():
    doc_ref = db.collection(u'Devices').document (Key)
    doc = doc_ref.get()
    if doc.exists:
        print(u'Document data:')
        print(doc)
    else:
        print(u'No such document!')

GPIO.add_event_detect(btnPairing,GPIO.RISING,callback=button_pairing_callback)
GPIO.add_event_detect(btnRelay1,GPIO.RISING,callback=button_relay1_callback)
GPIO.add_event_detect(btnRelay2,GPIO.RISING,callback=button_relay2_callback)

GPIO.add_event_detect(sensorReservoirPin,GPIO.BOTH,callback=sensor_reservoir_callback, bouncetime= 200)

init_device()

try:
    
    while True:
        on(37)
        sleep(blinkspeed)
        of(37)
        sleep(blinkspeed)
        listen_status()
except:
    of(37)
    GPIO.cleanup()
    pairing_end()
    coll_d.document(Key).update({u"Status":u"offline"})
finally:
    of(37)
    GPIO.cleanup()
    pairing_end()
    coll_d.document(Key).update({u"Status":u"offline"})