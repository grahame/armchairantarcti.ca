#!/usr/bin/env python

import requests, lxml, lxml.etree, sys, os, Image, json
import urlparse
import traceback
from StringIO import StringIO

html = lxml.etree.HTMLParser()
thumb = 128, 128

class Cam(object):
    def __init__(self, name, uri, descr):
        self.name = name
        self.uri = uri
        self.descr = descr

    def get_html(self, uri):
        req = requests.get(uri)
        f = StringIO(req.content)
        return lxml.etree.parse(f, html)

    def thumb_filename(self):
        return "tn_%s.jpg" % self.name

    def thumb_path(self):
        return os.path.join("../html/webcam/", self.thumb_filename())

    def make_thumb(self, img_uri):
        img_uri = urlparse.urljoin(self.uri, img_uri)
        print "thumbnail:", img_uri
        req = requests.get(img_uri)
        outf = self.thumb_path()
        tmpf = outf + '.t'
        f = StringIO(req.content)
        im = Image.open(f)
        im.thumbnail(thumb, Image.ANTIALIAS)
        im.save(tmpf, "JPEG")
        os.rename(tmpf, outf)

    def json(self):
        return {
            "name" : self.name,
            "uri" : self.uri,
            "descr" : self.descr,
            "tn" : "webcam/%s" % (self.thumb_filename())
        }

class AAD(Cam):
    def update(self):
        et = self.get_html(self.uri)
        img = et.xpath('//div[@id="article"]/div/div/img')[0]
        self.make_thumb(img.get('src'))

class Kiwi(Cam):
    def update(self):
        et = self.get_html(self.uri)
        img = et.xpath('//img[contains(@src, "/webcam/")]')[0]
        self.make_thumb(img.get('src'))

class Thistle(Cam):
    def update(self):
        et = self.get_html(self.uri)
        img = et.xpath('//center/img')[0]
        self.make_thumb(img.get('src'))

if __name__ == '__main__':
    webcams = [
            ( Thistle, ("union", "http://www.thistle.org/cgi-bin/dispcgi_wx7_latest_03?today.csv", "Union Glacier runway")),
            ( Thistle, ("thiel", "http://www.thistle.org/cgi-bin/dispcgi_wx8_latest_01?today.csv", "Thiel Mountains runway")),
            ( Kiwi, ("scott", "http://www.antarcticanz.govt.nz/scott-base/webcams", "Scott base")),
            ( AAD, ("casey", "http://www.antarctica.gov.au/webcams/casey", "Casey station") ),
            ( AAD, ("davis", "http://www.antarctica.gov.au/webcams/davis", "Davis station") ),
            ( AAD, ("macquarie-island", "http://www.antarctica.gov.au/webcams/macquarie-island", "Macquarie Island station") ),
            ( AAD, ("mawson", "http://www.antarctica.gov.au/webcams/mawson", "Mawson station") ),
            ]
    instances = []
    for cam, args in webcams:
        print "->", cam, args
        instance = cam(*args)
        try:
            instance.update()
            instances.append(instance)
        except Exception, e:
            traceback.print_exc()

    result = [ t.json() for t in instances ]
    outf = '../html/webcam.json'
    tmpf = outf+ '.t'
    with open(tmpf, 'w') as fd:
        json.dump(result, fd)
    os.rename(tmpf, outf)

