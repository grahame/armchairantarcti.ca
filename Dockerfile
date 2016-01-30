#
# this is pretty hacky, just moving this older software over to a
# new dockerised machine. I'll clean up at some point :-)
#

# don't use the python container, as a bunch of our deps are a pain
# in the neck to compile, so we're better off using debian's system
# python
FROM debian:jessie
MAINTAINER Grahame Bowland <grahame@angrygoats.net>

ARG GIT_TAG=next
ARG PIP_OPTS="--no-cache-dir"

ENV GITTAG $GIT_TAG

# this is a bit of a kitchen sink. we use this container to
# run ealgis 'recipes'; at some point we should break the recipe
# container out
#
# postgis is only needed for the shp2pgsql binary
RUN apt-get update && apt-get install -y --no-install-recommends \
      python \
      python-pip \
      python-pillow \
      wget less git && \
  apt-get autoremove -y --purge && \
  apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

WORKDIR /app

RUN pip install -U "pip<8"

RUN pip ${PIP_OPTS} install \
    simplejson markdown flask flask-sqlalchemy openpyxl && \
  rm -rf /root/.cache/pip/

COPY . /app

RUN adduser --system --uid 1000 --shell /bin/bash armchair
USER armchair
ENV HOME /app

EXPOSE 8081
VOLUME ["/app", "/data"]

COPY docker-entrypoint.sh /docker-entrypoint.sh

# entrypoint shell script that by default starts runserver
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["uwsgi"]
