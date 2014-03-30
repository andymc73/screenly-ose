#!/usr/bin/env python
# -*- coding: utf8 -*-

__author__ = "Andrew McDonnell"
__copyright__ = "Copyright 2014"
__license__ = "GPLv2"
__version__ = "0.1"
__email__ = "bugs@andrewmcdonnell.net"

import sys
import os
import csv
import datetime
import uuid
import os
import os.path
import sqlite3
from contextlib import contextmanager

#
# Arguments:
# $1 CSV File
#

#
# Expects a CSV with several columns:
# (1) Start Date and time - time defaults to midnight if omitted
# (2) Finish Date and time - time defaults to midnight if omitted
# (3) Display Duration, seconds
# (4) Text to render with image magick if picture doesnt work
# (5) Picture

if len(sys.argv) < 2:
  print "Need CSV file"
  os.exit(1)

CONFIG_DIR = os.path.join( os.environ['HOME'], ".screenly")
database = os.path.join( CONFIG_DIR, 'screenly.db')
asset_dir = "screenly_assets"
asset_path = os.path.join( os.environ['HOME'], asset_dir)

conn = sqlite3.connect(database, detect_types=sqlite3.PARSE_DECLTYPES)

@contextmanager
def cursor(connection):
    cur = connection.cursor()
    yield cur
    cur.close()


@contextmanager
def commit(connection):
    cur = connection.cursor()
    yield cur
    connection.commit()
    cur.close()

with cursor(conn) as c:
    c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='assets'")
    if c.fetchone() is None:
        c.execute('CREATE TABLE assets(asset_id text primary key, name text, uri text, md5 text, start_date timestamp, end_date timestamp, duration text, mimetype text, is_enabled integer default 0, nocache integer default 0, play_order integer default 0)')

comma = ','.join
create = lambda keys: 'insert into assets (' + comma(keys) + ') values (' + comma(['?'] * len(keys)) + ')'


with open(sys.argv[1], 'rb') as csvfile:
  r = csv.reader(csvfile)
  for row in r:
    s = row[0].split(" ")
    f = row[1].split(" ")
    if len(s) > 1:
      start = datetime.datetime.strptime(row[0], "%Y-%m-%d %H:%M:%S")
    else:
      start = datetime.datetime.strptime(s[0], "%Y-%m-%d")
    if len(f) > 1:
      finish = datetime.datetime.strptime(row[1], "%Y-%m-%d %H:%M:%S")
    else:
      finish = datetime.datetime.strptime(f[0], "%Y-%m-%d")
    duration = row[2]
    title = row[3] # fixme - escape single quotes from this
    image = ""
    asset_id = uuid.uuid4().hex
    if len(row) > 4:
      image = row[4]
      cmd = "cp '%s' '%s'" % (image, os.path.join( asset_path, asset_id))
      #print cmd
      os.system( cmd)
    else:
      # run image magick and render text
      cmd = "convert -background black -fill yellow -font Courier -format png -size 640x400 -pointsize 28 -gravity center label:'%s' 'png:%s'" % (title, os.path.join( asset_path, asset_id))
      #print cmd
      os.system( cmd)

    # datetime.datetime(2013, 1, 19, 23, 59)

    asset = {
        'asset_id': asset_id,
        'name': title,
        'uri': os.path.join(asset_dir, asset_id),
        'start_date': start,
        'end_date': finish,
        'duration': duration,
        'mimetype': "image",
        'is_enabled': 1
    }
            
    # TODO copy image to screenly_assets/asset['asset_id']
    with commit(conn) as c:
      c.execute(create(asset.keys()), asset.values())

