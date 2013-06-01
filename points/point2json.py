#!/usr/bin/env python

# Parser for Helen's crazy point database google doc thing

import json, csv

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
                stations[point_id] = {
                    'type' : typ(row),
                    'lat' : lat(row),
                    'lng' : lng(row), 
                    'icon' : icon(row),
                    'label' : label(row),
                    'logo' : logo_profile(row),
                    'established' : established(row),
                    'jurisdiction' : jurisdiction(row),
                    'url' : url(row),
                    'twitter' : []
                }
            elif stations.has_key(point_id):
                existing = stations[point_id]
                if point_type == "Twitter":
                    existing['twitter'].append(twitter_username(url(row)))
                else:
                    print "unhandled subtype", point_type, url(row)
        with open('../html/point_data.json', 'w') as wfd:
            json.dump(export, wfd, sort_keys=True, indent=4, separators=(',', ': '))


