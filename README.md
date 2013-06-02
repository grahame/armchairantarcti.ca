
armchairantarti.ca -- see http://armchairantarti.ca/ for the live version.

The scripts points/run.s and webcam/run.s need to be launched periodically 
from cron.

Otherwise the nginx config required to launch this is in etc/ and you'll 
also need to set up mapproxy; once you've got the virtualenv set up for 
Python, just got to "limaproxy" and launch "run.s"; nginx proxies through 
to the mapproxy.

See the file LICENSE for licensing terms.

