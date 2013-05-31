#
# set up virtualenv
#
VENV=~/venv.arm # hgfs sucks
rm -rf $VENV
virtualenv --system-site-packages -p /usr/bin/python $VENV
$VENV/bin/easy_install -U psycopg2 simplejson markdown flask flask-sqlalchemy openpyxl
#
# set up openlayers
#
rsync -az --delete ./openlayers/theme/ ./html/theme/
rsync -az --delete ./openlayers/img/ ./html/img/
( cd openlayers/build && python build.py -c jsmin full ../../html/OpenLayers.js )
