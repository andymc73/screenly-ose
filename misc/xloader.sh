#!/bin/bash

LOG=/tmp/screenly_xloader.log

# If SCREENLY_DIR not set, apply a heuristic to check other defaults
if test -z "$SCREENLY_DIR" ; then
  SCREENLY_DIR=~/screenly
fi

echo "Disabling screen power savings..." > $LOG

xset s off          # Don't activate screensaver
xset -dpms          # Disable DPMS (Energy Star) features
xset s noblank      # Don't blank the video device
export NOREFRESH=1  # Fix white flickering in omxplayer

sleep 5

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
	python $SCREENLY_DIR/viewer.py >> $LOG 2>&1
done
