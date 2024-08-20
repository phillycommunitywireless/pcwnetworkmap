# networkmap

This map of PCW's network coverage is built with MapBox via Jekyll.

# Local Development 
You can run this site locally in a container using Docker
* clone the repo with `git clone`
* `docker compose up -d`
* `jekyll` will serve at `localhost:4000`

# Editing map contents
* As of 8/20/24, the map **no longer uses the geosjon files in `/data`**. It is now linked to a Google Apps Script that generates GeoJSON files dynamically based of the content of a spreadsheet - **please contact a PCW staff member for access.**
