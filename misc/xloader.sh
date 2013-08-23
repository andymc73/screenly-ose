#!/bin/bash

# Script modified by Andrew McDonnell bugs@andrewmcdonnell.net under GPLv2
# - added SCREENLY_DIR and STARTUP_DELAY environment variables

# Ordinarily wait 5 seconds before starting, to give system time to settle.
# When developing we want to skip that, so set in environment
STARTUP_DELAY=${STARTUP_DELAY:-5}

# Note, when developing and testing from a git checkout of screenly-ose, the default
# directory is wrong! Override it in your environment as needed.
SCREENLY_DIR=${SCREENLY_DIR:-~/screenly}

# Note: to check python logs look in /tmp/screenly_viewer.log
# Change 'debug_logging = True' in the settings file ~/.screenly/screenly.conf
LOG=/tmp/screenly_xloader.log

# If SCREENLY_DIR not set, apply a heuristic to check other defaults
if ! test -d "$SCREENLY_DIR" ; then
  SCREENLY_DIR=~/screenly-ose
fi

if ! test -d "$SCREENLY_DIR" ; then
  # If we got this far, fallback to PWD
  SCREENLY_DIR=`pwd`
fi

if ! test -d "$SCREENLY_DIR" ; then
  echo "Cant find SCREENLY_DIR."
  exit 1
fi  

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
	python "$SCREENLY_DIR/viewer.py" >> $LOG 2>&1
	
	# One downside of this loop is you need to hit CTRL+C twice in quick succession to break out
done
