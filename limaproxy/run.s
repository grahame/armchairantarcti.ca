#!/bin/bash

cd /home/grahame/code/armchair/limaproxy/
. ~/venv.armchair/bin/activate
gunicorn -k eventlet -w 2  -b 127.0.0.1:8081 config:application

