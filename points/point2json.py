#!/usr/bin/env python

# Parser for Helen's crazy point database google doc thing

import json, csv, requests, base64, requests, time, sys, os

if __name__ == '__main__':
    with open('pointdata.csv') as fd:
        r = csv.reader(fd)
        # skip headers
        next(r)
        next(r)
        # header
        header = next(r)
        def rget(k, t=None):
            idx = header.index(k)
            def __made(row):
                v = row[idx]
                if t is not None:
                    try:
                        v = t(v)
                    except ValueError:
                        v = None
                return v
            return __made
        def twitter_username(s):
            return s.split('/')[-1]
        def last_tweet(username):
            ### mmm
            cache_file = base64.encodestring(username).strip().rstrip('=') + '.json'
            info = None
            try:
                with open(cache_file, 'r') as fd:
                    info = json.load(fd)
            except IOError:
                pass
            now = time.time()
            if info is not None and (now - info.get('time', 0)) > 86400:
                info = None
            if info is None:
                print "updating tweets for", username
                url = "https://api.twitter.com/1/statuses/user_timeline/" + username + ".json?count=1&include_rts=1&callback="
                print url
                req = requests.get(url)
                if req.status_code != requests.codes.ok:
                    req.raise_for_status()
                info = {
                    'time' : now,
                    'tweet' : json.loads(req.content)
                }
            with open(cache_file, 'w') as fd:
                json.dump(info, fd)
            return {
                'text' : info['tweet'][0]['text'],
                'id' : info['tweet'][0]['id_str']
                }

        # stuff we want
        pid = rget("Parent ID", int)
        lat = rget("Latitude", float)
        lng = rget("Longitude", float)
        icon = rget("Our Icon")
        logo_profile = rget("Logo/Profile URL")
        label = rget("Label")
        typ = rget("Type")
        established = rget("Established or Event Date")
        jurisdiction = rget("Jurisdiction")
        url = rget("URL")
        export = {}
        stations = export['stations'] = {}
        for row in r:
            if len(filter(None, [t.strip() for t in row])) == 0:
                break
            point_type = typ(row)
            point_id = pid(row)
            if point_id is None:
                continue
            if not stations.has_key(point_id):
                station = stations[point_id] = {
                    'id' : point_id,
                    'type' : typ(row),
                    'lat' : lat(row),
                    'lng' : lng(row), 
                    'icon' : icon(row),
                    'label' : label(row),
                    'logo' : logo_profile(row),
                    'established' : established(row),
                    'jurisdiction' : jurisdiction(row),
                    'url' : url(row),
                    'twitter' : [],
                    'photo' : [],
                    'trove' : [],
                    'audio' : [],
                    'webcam' : []
                }
            elif stations.has_key(point_id):
                station = stations[point_id]
            if point_type == "Station":
                pass
            elif point_type == "Twitter":
                username = twitter_username(url(row))
                station['twitter'].append({
                    'username' : username,
                    'last_tweet' : last_tweet(username)
                })
            elif point_type == "Photo":
                station['photo'].append({
                    'label' : label(row),
                    'url' : url(row)    
                })
            elif point_type == "Trove Article":
                station['trove'].append({
                    'label' : label(row),
                    'url' : url(row),
                    'logo' : logo_profile(row)
                })
            elif point_type == "Audio":
                station['audio'].append({
                    'label' : label(row),
                    'url' : url(row)
                })
            elif point_type == "Webcam":
                station['webcam'].append({
                    'label' : label(row),
                    'url' : url(row)
                })
            else:
                print "unhandled base type", point_type, url(row)
        outf = '../html/point_data.json'
        tmpf = outf+'.t'
        with open(tmpf, 'w') as wfd:
            json.dump(export, wfd, sort_keys=True, indent=4, separators=(',', ': '))
        os.rename(tmpf, outf)

