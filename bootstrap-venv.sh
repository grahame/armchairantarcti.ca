#
# set up virtualenv
#
VENV=~/venv.armchair

rm -rf $VENV
virtualenv --system-site-packages $VENV
. $VENV/bin/activate
$VENV/bin/pip install pillow simplejson markdown flask flask-sqlalchemy openpyxl

(cd mapproxy && python setup.py install )
$VENV/bin/pip install eventlet gunicorn
