#!/bin/bash

. ~/venv/bin/activate
gunicorn -k eventlet -w 8  -b :8080 config:application

