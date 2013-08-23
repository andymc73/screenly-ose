#!/bin/bash

# Ordinarily wait 5 seconds before starting, to give system time to settle.
# When developing we want to skip that, so set in environment
STARTUP_DELAY=${STARTUP_DELAY:-5}

LOG=/tmp/screenly_xloader.log

echo "Disabling screen power savings..." > $LOG

xset s off                         # Don't activate screensaver
xset -dpms                         # Disable DPMS (Energy Star) features
xset s noblank                     # Don't blank the video device

sleep $STARTUP_DELAY

echo "Launching infinite loop..." >> $LOG
while true
do
	# Clean up in case of an unclean exit
	echo "Cleaning up..." >> $LOG
	killall uzbl-core
	killall omxplayer omxplayer.bin
	rm -f /tmp/uzbl_*
	rm -f /tmp/screenly_html/*

	# Launch the viewer
	python ~/screenly/viewer.py >> $LOG 2>&1
done
