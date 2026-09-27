# pcwnetworkmap

![A screenshot of the Philly Community Wireless webmap](/img/readme_screenshot.png)

This map of PCW's network coverage is built with MapBox via Jekyll.

Deploy previews via `Render`

The live deploy of the map is availabe here - https://map.phillycommunitywireless.org

# Additional functionality
## URL Parameters 
### Setting default position/zoom level
On page load, the map shows PCW's main three coverage areas - Norris Square, Fairhill, and Kensington. The `latitude`, `longitude`, and `zoom` URL parameters can be used to show a specific latitude, longitude, and zoom level at page load. 

e.g - `https://map.phillycommunitywireless.org/?latitude=39.95239&longitude=-75.16364&zoom=16` sets the default view to a zoomed-in view of Philadelphia City Hall 

![A screenshot of the Philly Community Wireless webmap centered around Philadelphia City Hall](/img/readme_urlparams.png)

## Setting menu visibility at map load 
Similarly, the `menu_closed` URL parameter sets if the menu is open or closed at map load time - e.g, `https://map.phillycommunitywireless.org/?menu_closed=true` 

# Local Development 
You can run this site locally in a container using Docker
* Clone the repo with `git clone`
* Sign up for a [MapBox developer account and get a MapBox public token](https://docs.mapbox.com/help/dive-deeper/access-tokens/)
* Set `MAPBOX_API` in `_config.yml` to your MapBox public token.  
* `docker compose up -d`
* `jekyll` will serve at `localhost:4000`
* If you change the `Gemfile`, refresh `Gemfile.lock` with `docker run --rm -v .:/app -w /app ruby:3.2 bundle lock`

# Editing map contents
The map does not ship any GeoJSON of its own. Since 8/20/24 it has fetched its GeoJSON at runtime from an API that generates it dynamically from the content of a spreadsheet - **please contact a PCW staff member for access.**

The code for the API is available here - https://github.com/phillycommunitywireless/pcwnetworkmap-api 

# Removed features
The census demographic overlays - median household income and households without broadband access - were removed along with the unused GeoJSON in `/data`. They had been disabled in the UI since March 2025 (commit `01ee2ce`), but the repository still carried several MB of unused GeoJSON and the page still loaded the Turf.js library for every visitor. The code is still in git history; the last commit containing it is `778eea7`. Any future demographic visualization is expected to start as a fresh project rather than revive these layers.
