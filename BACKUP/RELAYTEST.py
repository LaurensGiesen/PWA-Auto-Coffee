import RPi.GPIO as GPIO
import time

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BCM)
GPIO.cleanup()

pinListRelay = [27,22]
SleepTimeL = 2

GPIO.setup(pinListRelay[0], GPIO.OUT)
GPIO.setup(pinListRelay[1], GPIO.OUT)
GPIO.output(pinListRelay[0],GPIO.HIGH)
GPIO.output(pinListRelay[1],GPIO.HIGH)
time.sleep(2)
GPIO.output(pinListRelay[0],GPIO.LOW)
time.sleep(2)
GPIO.output(pinListRelay[1],GPIO.LOW)





try:
    time.sleep(2)
    print("de moeder")
    GPIO.cleanup()
except:
  print ("  Quit")

  # Reset GPIO settings
  GPIO.cleanup()