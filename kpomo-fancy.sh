#!/bin/sh
# Name: Kpomo-fancy
# Author: Kurizu
# DontUseFBInk
# Icon: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAEmUlEQVR4nO3dsUvrXBgG8CdfRVCRGqmKoDhYW0RBHDp00DqLg4Nugh0cHLQIDi7q4lgcBJdupejm39CKoFuHimgrFBFRJ1NQaFBovdOFD/FqmpyYxPP8wC09vs375OSkpA1ARERERERERERERERERERERERERERERERERN6j2DGoqqrvdoxLQKVSEdozYYOx6T9PRBj+E1EIm+8MEfvdUoLYePcwOxuYngHYfHcx2w9TAWDz3clMX5rsKAQANE2za2hpdXZ2Ch+z4fPGdylj4+33XRAaWQ80FICvms/G/7yvgmA0BEIuA8m7hASAR78zROx3wwHgyt9bjPbL8gzAo99ZVvc/1wCSYwAkxwBI7tcEIBgMQlGUH/k7Pj52+u0K82sCQOYwAJJjACTHAEiOAZAcAyA5BkBytt0R5DbhcBjFYtHpMlyHM4DkGADJMQCSYwAkxwBITpqrgJeXFySTSeTzeVxcXEDTNFQqFSiKAlVVoaoqAoEAxsfHEY1GEY1G0d/f73TZtjN8W/i/7jFzyy1hwWAQ5XJZ6JiTk5NIJBKYnZ2Fz+cTOrZI/7o93Mit4TwFfOHk5ARzc3MIh8M4PT11uhxbMAAGlMtlxGIxbG9vo1arOV2OUAyAQbVaDTs7O1hcXES9Xne6HGEYgAYdHh5ic3PT6TKEsbwIJPfiIpC+xQBIjgGQHAMgOcsfBbvlk0BRrq+vEQ6HDW+vaRpUVbWxou9Z+ekYzgAfhEKhhgJwc3NjYzX2YwA+MTw8bHhbr8+ADMAnGpnSdV23sRL7MQCfqFQqhrdtaWmxsRL7MQCfuLq6MrxtIBCwsRL7MQAfFItFlEolQ9sqioLBwUGbK7KX5+8ISiaTeH9/x8rKClpbWy2Pt7W1ZXjbkZERtLe3W/6fTvL8DPD09ISNjQ0Eg0Hs7++jWq2aHmtvbw9HR0eGt5+enjb9v9zC8wH46/HxEaurq+jt7cXy8jLy+bzh11arVSQSCaytrRl+jaIoiMfjjRfqMp4/BXz0/PyMVCqFVCqFgYEBxGIxTE1NYXR0FD09Peju7ka9XoemaSgUCshms0in0w1fz8/Pzzf0eYFb/boA/N/t7S0ymQwymYzQcf1+P3Z3d4WO6ZRfcwr4KT6fDwcHB+jr63O6FCEYgAY0NTUhnU5jZmbG6VKEYQAMGhoaQjabxcLCgtOlCMUAfKO5uRnr6+soFAqYmJhwuhzhPP/NIF3XcXZ2hlwuh1wuh3w+j9fXV8vjhkIhLC0tIR6Po6urS0Cl9rHyzSDPB+CjWq2GUqmE8/NzXF5e4u7uDvf393h4eEClUoGu69B1HW9vb2hra4Pf70dHRwcCgQDGxsYQiUQQiUQQCoWcfiuGMQCS43cDyTQGQHIMgOQYAMkxAJKzHAA7HmdKxlnd/4YDYPbx5OSMH31yKGcBZ4jY71wDSI5PD/cgx54e/peRXwthEMQzMuU3ulaz7ZYwrgu8wdQagFcE7mSmL6YXgQyBu5jth5Am8hfEnGP1QBRyGcjZwBki9rstjeOMYB8ebERERERERERERERERERERERERERERERERAQA+AN/plyD7VTCFwAAAABJRU5ErkJggg==

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
