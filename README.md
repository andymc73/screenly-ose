# Screenly OSE - Digital Signage for the Raspberry Pi

To learn more about Screenly, please visit the official website at [ScreenlyApp.com](http://www.screenlyapp.com). On the official site, you'll find the complete installation instructions, along with a live-demo of Screenly.

## Disk Image Changelog

### 2014-01-11

 * Upgrade kernel (3.10.25+) and firmware. Tracked in [this](https://github.com/wireload/rpi-firmware) fork.
 * Change and user Screenly's APT repository (apt.screenlyapp.com).
 * `apt-get upgrade` to the Screenly APT repository.
 * Update Screenly to latest version.
 * The disk image is available at [ScreenlyApp.com](http://www.screenlyapp.com).

## Running the Unit Tests

    nosetests --with-doctest

## Changes Screenly makes to your Raspberry PI

Screenly first installs various packages and Python PIP packages, as well as upgrading any pending upgrades using apt.

Apart from installing various additional packages from Debian and Python PIP, be aware the following files are modified or created;
this will change the way your pi operates, and possibly make it difficult to perform other unrelated tasks.

    ~/screenly     (by default)
    ~/.screenly
    ~/.config/lxsession/LXDE/autostart
    ~/.gtkrc-2.0                          # deleted if it exists, and replaced with a symlink --> ~/screenly/misc/gtkrc-2.0
    ~/.config/openbox/lxde-rc.xml         # symlink --> ~/screenly/misc/lxde-rc.xml
    ~/.config/lxpanel/LXDE/panels/panel   # deleted if it exists
    /etc/dphys-swapfile
    /etc/modules                          # addition of bcm2708_wdog
    /etc/xdg/lxsession/LXDE/autostart     # deleted
    /etc/watchdog.conf
    /etc/supervisor/conf.d/screenly.conf
    /etc/lightdm/lightdm.conf
    /boot/config.txt
    /boot/cmdline.txt

A backup is made of the following files:

    ~/.config/openbox/lxde-rc.xml
    ~/.config/lxpanel/LXDE/panels/panel
    /etc/xdg/lxsession/LXDE/autostart
    /etc/dphys-swapfile
    /etc/modules.modified
    /etc/watchdog.conf

## Installing directly from git

If you want to develop locally, first clone the git repository. You might for example do this on another computer than the target pi:

    git clone https://github.com/wireload/screenly-ose.git <optional-path/to/working/copy>

From this point you only need the Internet for Debian and PIP package installation.
By default the Screenly installed expects everything to be in `~/screenly`.
You can change this in your environment (e.g. in `~/.bashrc` to be persistent):

    export SCREENLY_DIR=path/to/working/copy

The installer can then be run directly in the working copy:

    cd "$SCREENLY_DIR"
    bash misc/install.sh
