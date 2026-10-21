
import json
import requests
from pathlib import Path

# Canara Engineering College, Benjanapadavu
LAT = 12.899738
LON = 74.983481

# Start with a small area around the college
RADIUS_METERS = 500

OUTPUT_DIR = Path("output")
OUTPUT_DIR.mkdir(exist_ok=True)

OUTPUT_FILE = OUTPUT_DIR / "pedestrian_paths.geojson"

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

QUERY = f"""
[out:json][timeout:60];
way(around:{RADIUS_METERS},{LAT},{LON})
  ["highway"~"^(footway|path|pedestrian|steps|residential|service|living_street)$"];
out geom;
"""

def main():
    print("Fetching pedestrian paths near CEC...")

    try:
        
        response = requests.post(
        OVERPASS_URL,
        data={"data": QUERY},
        headers={
            "User-Agent": "AUXILIUM-AccessibilityResearch/1.0 (student project)",
            "Accept": "application/json"
    },
    timeout=90
)

        response.raise_for_status()
        data = response.json()

    except requests.RequestException as error:
        print(f"OSM request failed: {error}")
        print("Try again later or use a regional OSM extract.")
        return

    features = []

    for element in data.get("elements", []):
        if element.get("type") != "way":
            continue

        geometry = element.get("geometry", [])
        tags = element.get("tags", {})

        if len(geometry) < 2:
            continue

        coordinates = [
            [point["lon"], point["lat"]]
            for point in geometry
        ]

        properties = {
            "path_id": f"osm_way_{element['id']}",
            "highway": tags.get("highway", "unknown"),
            "surface": tags.get("surface", "unknown"),
            "incline": tags.get("incline", "unknown"),
            "stairs": (
                "yes" if tags.get("highway") == "steps"
                else "unknown"
            ),
            "ramp": tags.get("ramp", "unknown"),
            "wheelchair_access": tags.get(
                "wheelchair", "unknown"
            ),
            "source": "openstreetmap",
            "verification_status": "unverified"
        }

        features.append({
            "type": "Feature",
            "id": properties["path_id"],
            "geometry": {
                "type": "LineString",
                "coordinates": coordinates
            },
            "properties": properties
        })

    geojson = {
        "type": "FeatureCollection",
        "features": features
    }

    OUTPUT_FILE.write_text(
        json.dumps(geojson, indent=2),
        encoding="utf-8"
    )

    print(f"Paths collected: {len(features)}")
    print(f"GeoJSON saved to: {OUTPUT_FILE.resolve()}")

if __name__ == "__main__":
    main()
