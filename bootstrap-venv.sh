#
# set up virtualenv
#
VENV=~/venv

rm -rf $VENV
virtualenv --system-site-packages $VENV
. $VENV/bin/activate
#$VENV/bin/easy_install simplejson markdown flask flask-sqlalchemy openpyxl

(cd mapproxy && python setup.py install )
VENV/bin/pip install eventlet gunicorn
