#!/bin/sh
# Name: Kpomo-fancy
# Author: Kurizu
# DontUseFBInk
# Icon: data:image/png;base64,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

#Credit To HackerDude For OG Source (Modified A Bit For Stuffs)

SOURCE_DIR="/mnt/us/documents/kpomo-fancy"
TARGET_DIR="/var/local/mesquite/kpomo-fancy"
DB="/var/local/appreg.db"
APP_ID="xyz.kurizu.kpomo"

#Copy To VAR/LOCAL/MESQUITE
if [ -d "$SOURCE_DIR" ]; then
    if [ -d "$TARGET_DIR" ]; then
        rm -rf "$TARGET_DIR"
    fi
    cp -r "$SOURCE_DIR" "$TARGET_DIR"
else
    exit 1
fi

#Redeclare To APPREG.DB 
sqlite3 "$DB" <<EOF
INSERT OR IGNORE INTO interfaces(interface) VALUES('application');

INSERT OR IGNORE INTO handlerIds(handlerId) VALUES('$APP_ID');

INSERT OR REPLACE INTO properties(handlerId,name,value) 
  VALUES('$APP_ID','lipcId','$APP_ID');
INSERT OR REPLACE INTO properties(handlerId,name,value) 
  VALUES('$APP_ID','command','/usr/bin/mesquite -l $APP_ID -c file://$TARGET_DIR/');

# Set the app icon (new flip-clock tile). icon.png is copied to $TARGET_DIR by `cp -r` above.
INSERT OR REPLACE INTO properties(handlerId,name,value) 
  VALUES('$APP_ID','icon','file://$TARGET_DIR/icon.png');
EOF

echo Registered $APP_ID, You May Now Launch It With LIPC.
sleep 2

#Launch With LIPC
nohup lipc-set-prop com.lab126.appmgrd start app://$APP_ID >/dev/null 2>&1 &
