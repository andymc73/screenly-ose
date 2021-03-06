#!/bin/bash

# The following variables allow use in a fresh environment, in locations chosen by the customising developer or end user,
# and this avoids having hard-coded paths, etc.

# If SCREENLY_GITHUB not set, apply a heuristic to check other defaults
if test -z "$SCREENLY_GITHUB" ; then
  SCREENLY_GITHUB=git://github.com/wireload/screenly-ose.git
fi

# If SCREENLY_DIR not set, apply a heuristic to check other defaults
if test -z "$SCREENLY_DIR" ; then
  if test -d .git && test -d misc && test -d views && test -f viewer.py  ; then
    SCREENLY_DIR=`pwd`
  else
    SCREENLY_DIR=~/screenly
  fi
fi

# More path defaults
CONFIG_DIR=~/.screenly/

echo "Installing Screenly OSE (beta)"

## Simple disk storage check. Naively assumes root partition holds all system data.
ROOT_AVAIL=$(df -k / | tail -n 1 | awk {'print $4'})
MIN_REQ="512000"

if [ $ROOT_AVAIL -lt $MIN_REQ ]; then
	echo "Insufficient disk space. Make sure you have at least 500MB available on the root partition."
	exit 1
fi

echo "Updating system package database..."
sudo apt-get -qq update > /dev/null

echo "Upgrading the system..."
echo "(This might take a while.)"
sudo apt-get -y -qq upgrade > /dev/null

echo "Installing dependencies..."

# The latest raspbian (2014-01-07-wheezy-raspbian) causes the following error when installing watchdog:
# "There is a loop between service watchdog and mathkernel if stopped ..."
# The fix is described in the 7th post in http://www.raspberrypi.org/forum/viewtopic.php?f=28&t=66059
#
# Check, and if we dont find the LSB signature, insert the stuff after the first line which we expect to be #!/bin/sh
if grep -v -q "BEGIN INIT INFO" /etc/init.d/mathkernel ; then
  sudo cp /etc/init.d/mathkernel /etc/init.d-mathkernel.modified_by_screenly
  sudo sed -e '2i### BEGIN INIT INFO\
# Provides:          mathkernel\
# Required-Start:    $syslog\
# Required-Stop:     $syslog\
# Default-Start:     2 3 4 5\
# Default-Stop:      0 1 6\
# Short-Description: mathkernel\
# Description:       This file should be used to construct scripts to be\
#                    placed in /etc/init.d.\
### END INIT INFO\
#\
# rest of file here' -i /etc/init.d/mathkernel
fi

sudo apt-get -y -qq install git-core python-pip python-netifaces python-simplejson python-imaging python-dev uzbl sqlite3 supervisor omxplayer x11-xserver-utils libx11-dev watchdog chkconfig feh > /dev/null

SDEST=$(cd "$SCREENLY_DIR" && pwd)

# If we are running this _inside_ the same working copy then we dont want to clone it!
if [ "$SDEST" == "$(pwd)" ] ; then
  echo "Assuming you are installing from inside working copy."
else
  echo "Downloading Screenly-OSE from $SCREENLY_GITHUB ..."
  git clone "$SCREENLY_GITHUB" "$SCREENLY_DIR" > /dev/null
fi

echo "Installing more dependencies..."
sudo pip install -r "$SCREENLY_DIR/requirements.txt" -q > /dev/null
sudo pip install --upgrade sh
sudo pip install --upgrade uptime
sudo pip install --upgrade six

echo "Adding Screenly to X auto start..."
mkdir -p ~/.config/lxsession/LXDE/
echo "@$SCREENLY_DIR/misc/xloader.sh" > ~/.config/lxsession/LXDE/autostart

echo "Increasing swap space to 500MB..."
echo "CONF_SWAPSIZE=500" > ~/dphys-swapfile
sudo cp /etc/dphys-swapfile /etc/dphys-swapfile.modified_by_screenly
sudo mv ~/dphys-swapfile /etc/dphys-swapfile

echo "Adding Screenly's config-file"
mkdir -p $CONFIG_DIR
cp "$SCREENLY_DIR/misc/screenly.conf" $CONFIG_DIR

echo "Enabling Watchdog..."
sudo modprobe bcm2708_wdog > /dev/null
sudo cp /etc/modules /etc/modules.modified_by_screenly
sudo sed '$ i\bcm2708_wdog' -i /etc/modules
sudo chkconfig watchdog on
sudo cp /etc/watchdog.conf /etc/watchdog.conf.modified_by_screenly
sudo sed -e 's/#watchdog-device/watchdog-device/g' -i /etc/watchdog.conf
sudo /etc/init.d/watchdog start

echo "Adding Screenly to autostart (via Supervisord)"
#sudo ln -s "$SCREENLY_DIR/misc/supervisor_screenly.conf" /etc/supervisor/conf.d/screenly.conf
cat "$SCREENLY_DIR/misc/supervisor_screenly.conf" | sudo bash -c "sed -e 's@/home/pi/screenly@'$SDEST'@/'  > /etc/supervisor/conf.d/screenly.conf"

sudo /etc/init.d/supervisor stop > /dev/null
sudo /etc/init.d/supervisor start > /dev/null

echo "Making modifications to X..."
[ -f ~/.gtkrc-2.0 ] && rm -f ~/.gtkrc-2.0
ln -s "$SCREENLY_DIR/misc/gtkrc-2.0" ~/.gtkrc-2.0
[ -f ~/.config/openbox/lxde-rc.xml ] && mv ~/.config/openbox/lxde-rc.xml ~/.config/openbox/lxde-rc.xml.modified_by_screenly
[ -d ~/.config/openbox ] || mkdir -p ~/.config/openbox
ln -s "$SCREENLY_DIR/misc/lxde-rc.xml" ~/.config/openbox/lxde-rc.xml
[ -f ~/.config/openbox/environment ] && cp ~/.config/openbox/environment ~/.config/openbox/environment.modified_by_screenly
echo "export SCREENLY_DIR=$SCREENLY_DIR" >> ~/.config/openbox/environment

[ -f ~/.config/lxpanel/LXDE/panels/panel ] && mv ~/.config/lxpanel/LXDE/panels/panel ~/.config/lxpanel/LXDE/panels/panel.modified_by_screenly
[ -f /etc/xdg/lxsession/LXDE/autostart ] && sudo mv /etc/xdg/lxsession/LXDE/autostart /etc/xdg/lxsession/LXDE/autostart.modified_by_screenly
sudo sed -e 's/^#xserver-command=X$/xserver-command=X -nocursor/g' -i /etc/lightdm/lightdm.conf

# Make sure we have proper framebuffer depth.
if grep -q framebuffer_depth /boot/config.txt; then
  sudo sed 's/^framebuffer_depth.*/framebuffer_depth=32/' -i /boot/config.txt
else
  echo 'framebuffer_depth=32' | sudo tee -a /boot/config.txt > /dev/null
fi

# Fix frame buffer bug
if grep -q framebuffer_ignore_alpha /boot/config.txt; then
  sudo sed 's/^framebuffer_ignore_alpha.*/framebuffer_ignore_alpha=1/' -i /boot/config.txt
else
  echo 'framebuffer_ignore_alpha=1' | sudo tee -a /boot/config.txt > /dev/null
fi

echo "Quiet the boot process..."
sudo cp /boot/cmdline.txt /boot/cmdline.txt.modified_by_screenly
sudo sed 's/$/ quiet/' -i /boot/cmdline.txt

echo "Assuming no errors were encountered, go ahead and restart your computer."
