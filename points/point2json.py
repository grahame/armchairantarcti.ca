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
        # stuff we want
        pid = rget("Parent ID", int)
        lat = rget("Latitude", float)
        lng = rget("Longitude", float)
        icon = rget("Our Icon")
        typ = rget("Type")
        export = {}
        stations = export['stations'] = {}
        for row in r:
            if len(filter(None, [t.strip() for t in row])) == 0:
                break
            point_type = typ(row)
            point_id = pid(row)
            if point_id is None:
                continue
            if point_type == 'Station' and not stations.has_key(point_id):
                stations[point_id] = {
                    'lat' : lat(row),
                    'lng' : lng(row), 
                    'icon' : icon(row)
                }
        with open('../html/point_data.json', 'w') as wfd:
            json.dump(export, wfd)


