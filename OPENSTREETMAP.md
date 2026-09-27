# Adding PCW network points to OpenStreetMap

A quick guide to interacting with OpenStreetMap for the map working group: using OpenStreetMap to add WiFi availability.

<!-- Combined 2026-09 from three Drive docs in Ops Mapping/OpenStreetMap: "OSM Process doc" (2024-07), "Adding PCW points to OSM" (2024-08) and "OSM Project Plan" (2024-06 to 2025-06). Left out: team names, the meeting log, the KoboToolbox form, screenshots, and the Mapbox URL of the PCW background layer (ask the map team). -->

## Resources

* [OSM wiki: Tags](https://wiki.openstreetmap.org/wiki/Tags)
* [Wheelmap](https://wheelmap.org/) and Freifunk, the models we looked at
* [MapComplete](https://mapcomplete.org/)

## Tags

| Tag | Purpose / Details |
|---|---|
| `internet_access=wlan` | A WLAN wireless internet hotspot, also known as wireless, wifi or Wi-Fi. |
| `internet_access:fee=no` | Access is free for all |
| `internet_access:operator=Philly Community Wireless` | |

Use the hashtag `#wifijawn` in the changeset comment. Hashtags are not tags: they don't behave the same in the mapping environment.

## Adding a point

1. Make an OpenStreetMap account and log in.
2. Zoom in to the PCW network area: in the search bar, type "Norris Square Park, Philadelphia" and press enter, then zoom out a little to see all of North Philadelphia. Or use this link: <https://www.openstreetmap.org/#map=15/39.9875/-75.1347>
3. Start editing by clicking the Edit button. You will see a satellite image as background.
4. Optional: change the background to the PCW infrastructure map. On the toolbar on the right, click Background Settings, go to the bottom of the list, click the options button next to "Custom", and paste the PCW map background URL (ask the map team) into "Enter a url template". You will see a dark background with red, blue and green points labelled with the PCW APs and routers.
5. Locate the point you are adding: find it in the AP list, then find it on the map using the labels in the background.
6. Add the point:
    1. Click the Point button on the toolbar at the top of the screen. The cursor changes to a cross.
    2. Click where the point goes. A white marker appears and the bar on the left shows some options.
    3. Under "Select feature type", type `wifi` and click "Wi-Fi Hotspot".
    4. In "Edit feature", set Wifi Network Name: `Philly Community Wireless` and Internet Access: `free`.
    5. In the Tags section, click + and add `internet_access:operator` = `Philly Community Wireless`.
7. Save and upload: click Save (top right), add `#wifijawn` and any other comment under "Changeset Comment", then click Upload. When the upload finishes, the Save button is greyed out.
8. Mark the point as done in the AP list's OSM status column.

## Checking the results

Run this query in [Overpass Ultra](https://overpass-ultra.us/):

```
---
style:
  layers:
        - type: symbol
          filter: [ ==, [ get, 'internet_access:operator' ], 'Philly Community Wireless' ]
          layout:
            icon-overlap: always
            icon-size: 0.5
            icon-image: https://raw.githubusercontent.com/phillycommunitywireless/pcwnetworkmap/main/icons/RooftopHub.png
  extends: https://styles.trailsta.sh/protomaps-dark.json
---
[out:json][timeout:25];
(
  node["internet_access:operator"="Philly Community Wireless"];
);
out body;
```

## Open questions (from the 2024 plan)

**Are we mapping our network infrastructure or the service?** There are two ways to map the network in OSM:

1. Map the equipment as points (mostly antennas), with tags like `communication:*` and `man_made=antenna` (plus `location=roof` and so on). These points are not visible in the default map style, but they are in the database and can be queried and mapped with a different style. Example: <https://overpass-turbo.eu/s/1O1Q>
2. Tag the structures the equipment is attached to, with `internet_access=wlan`, `internet_access:fee=no`, the operator tag and the `#wifijawn` hashtag. Mapping the service opens the option for collaboration from users.

**Importing or editing?** If we map infrastructure (1), an import is preferred, which means following OSM's import guidelines, a plan and the community. If we tag existing elements (2), editing is the way to go.

In July 2024 the group decided against requesting a new amenity tag, because the OSM wiki asks people to clean up that type of tag.
