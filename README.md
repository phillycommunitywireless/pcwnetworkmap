# pcwnetworkmap

![A screenshot of the Philly Community Wireless webmap](/img/readme_screenshot.png)

This map of PCW's network coverage is built with MapBox via Jekyll.

Deploy previews via `Render`

The live deploy of the map is availabe here - https://map.phillycommunitywireless.org

# Additional functionality
## Changing the default Zoom level with URL parameters 
On page load, by defaut the map shows PCW's main three coverage areas - Norris Square, Fairhill, and Kensington. URL parameters can be used to show a specific latitude, longitude, and zoom level at page load. 

For example, this URL sets the default view to a zoomed-in view of City Hall - https://map.phillycommunitywireless.org/?latitude=39.95239&longitude=-75.16364&zoom=16 

![A screenshot of the Philly Community Wireless webmap centered around Philadelphia City Hall](/img/readme_urlparams.png.png)

# Local Development 
You can run this site locally in a container using Docker
* clone the repo with `git clone`
* `docker compose up -d`
* `jekyll` will serve at `localhost:4000`

# Editing map contents
As of 8/20/24, the map **no longer uses the geosjon files in `/data`**. It is now linked to an API that generates GeoJSON files dynamically based of the content of a spreadsheet - **please contact a PCW staff member for access.**

The code for the API is available here - https://github.com/phillycommunitywireless/pcwnetworkmap-api 
