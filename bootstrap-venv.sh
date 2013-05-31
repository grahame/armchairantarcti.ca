VENV=~/venv.arm # hgfs sucks
rm -rf $VENV
virtualenv --system-site-packages -p /usr/bin/python $VENV
$VENV/bin/easy_install -U psycopg2 simplejson markdown flask flask-sqlalchemy openpyxl
