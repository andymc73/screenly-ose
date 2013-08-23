#!/bin/bash

# Script modified by Andrew McDonnell bugs@andrewmcdonnell.net under GPLv2
# - added SCREENLY_DIR and STARTUP_DELAY environment variables
# - suppress errors when killing non-existent processes
# - added protection against log flooding on a bogus installation

# Ordinarily wait 5 seconds before starting, to give system time to settle.
# When developing we want to skip that, so set in environment
STARTUP_DELAY=${STARTUP_DELAY:-5}

# Note, when developing and testing from a git checkout of screenly-ose, the default
# directory is wrong! Override it in your environment as needed.
SCREENLY_DIR=${SCREENLY_DIR:-~/screenly}

# Note: to check python logs look in /tmp/screenly_viewer.log
# Change 'debug_logging = True' in the settings file ~/.screenly/screenly.conf
LOG=/tmp/screenly_xloader.log

function fail_message() {
  xterm -hold -T "$1" -e bash -c 'echo -e '"$2"''
}

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

unset TSTART
while true
do
	# Clean up in case of an unclean exit
	echo "Cleaning up..." >> $LOG
	killall uzbl-core 2> /dev/null
	killall omxplayer omxplayer.bin 2> /dev/null
	rm -f /tmp/uzbl_*
	rm -f /tmp/screenly_html/*

	# But if we find ourselves doing that multiple times per second, something is
	# seriously wrong, so dont fill up the logfile which would fill the sdcard...
	# of course, maybe /tmp should be in a ramdisk...
	if [ ! -z $TSTART ] ; then
	  TNOW=`date +%s`
	  TD=$(( $TNOW - $TSTART ))       
	  if [ $TD -le 1 ] ; then # our restart happened very fast...
	    TFAIL=$(( $TFAIL+1 ))
	    # If we got a bunch of fast fails in a row, die
	    # Because a package is missing, or maybe a python library
	    # This is useful when developing and you forgot to install something
	    # Try and show something at least. Provided we installed a terminal...
	    fail_message "Screenly has a problem." 'Screenly has encountered a fatal problem!\\nAborting restart attempts to save the sdcard.'
	    exit 1
	  else # reset, things are normal
	    TFAIL=0
	  fi
	else
	  TFAIL=0      
	fi
  TSTART=`date +%s`

	# Launch the viewer
	python "$SCREENLY_DIR/viewer.py" >> $LOG 2>&1
	
	# One downside of this loop is you need to hit CTRL+C twice in quick succession to break out
done
