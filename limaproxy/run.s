#!/bin/bash

. ~/venv/bin/activate
gunicorn -k eventlet -w 8  -b 127.0.0.1:8080 config:application

