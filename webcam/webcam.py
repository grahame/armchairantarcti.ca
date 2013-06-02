#!/usr/bin/env python

import requests, lxml, lxml.etree, sys, os, Image, json
import traceback
from StringIO import StringIO

html = lxml.etree.HTMLParser()
thumb = 128, 128

class Cam(object):
    def __init__(self, name, uri, descr):
        self.name = name
        self.uri = uri
        self.descr = descr

    def thumb_filename(self):
        return "tn_%s.jpg" % self.name

    def thumb_path(self):
        return os.path.join("../html/webcam/", self.thumb_filename())

    def make_thumb(self, img_uri):
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
        req = requests.get(self.uri)
        f = StringIO(req.content)
        et = lxml.etree.parse(f, html)
        img = et.xpath('//div[@id="article"]/div/div/img')[0]
        self.make_thumb(img.get('src'))

class Kiwi(Cam):
    def update(self):
        req = requests.get(self.uri)
        f = StringIO(req.content)
        et = lxml.etree.parse(f, html)
        img = et.xpath('//div[@id="article"]/div/div/img')[0]
        self.make_thumb(img.get('src'))


if __name__ == '__main__':
    webcams = [
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

