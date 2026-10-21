import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function LocationSelector({
  setStart,
  setDestination,
  getRoute,
}) {
  useMapEvents({
    click(e) {
      const location = [e.latlng.lat, e.latlng.lng];

      setStart((currentStart) => {
        if (!currentStart) {
          return location;
        }

        setDestination((currentDestination) => {
          if (!currentDestination) {
            getRoute(currentStart, location);
            return location;
          }

          return currentDestination;
        });

        return currentStart;
      });
    },
  });

  return null;
}

function MapView({ profile }) {
  const [start, setStart] = useState(null);
  const [destination, setDestination] = useState(null);

  const [route, setRoute] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  function getWaypoint(startLocation, destinationLocation) {
    const startLat = startLocation[0];
    const startLon = startLocation[1];

    const destinationLat = destinationLocation[0];
    const destinationLon = destinationLocation[1];

    const midLat = (startLat + destinationLat) / 2;
    const midLon = (startLon + destinationLon) / 2;

    const latDifference =
      destinationLat - startLat;

    const lonDifference =
      destinationLon - startLon;

    const length = Math.sqrt(
      latDifference * latDifference +
      lonDifference * lonDifference
    );

    if (length === 0) {
      return null;
    }

    const perpendicularLat =
      -lonDifference / length;

    const perpendicularLon =
      latDifference / length;

    const offset = 0.0015;

    if (profile === "wheelchair") {
      return [
        midLat + perpendicularLat * offset,
        midLon + perpendicularLon * offset,
      ];
    }

    if (profile === "walking_difficulty") {
      return [
        midLat - perpendicularLat * offset,
        midLon - perpendicularLon * offset,
      ];
    }

    return null;
  }

  async function getRoute(
    startLocation,
    destinationLocation
  ) {
    let coordinates;

    const waypoint = getWaypoint(
      startLocation,
      destinationLocation
    );

    if (profile === "general" || !waypoint) {
      coordinates =
        `${startLocation[1]},${startLocation[0]};` +
        `${destinationLocation[1]},${destinationLocation[0]}`;
    } else {
      coordinates =
        `${startLocation[1]},${startLocation[0]};` +
        `${waypoint[1]},${waypoint[0]};` +
        `${destinationLocation[1]},${destinationLocation[0]}`;
    }

    const url =
      `https://router.project-osrm.org/route/v1/foot/` +
      `${coordinates}` +
      `?overview=full&geometries=geojson`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.code !== "Ok" || !data.routes.length) {
        console.log("No route found.");
        return;
      }

      const routeData = data.routes[0];

      const routeCoordinates =
        routeData.geometry.coordinates.map(
          ([longitude, latitude]) => [
            latitude,
            longitude,
          ]
        );

      setRoute(routeCoordinates);
      setDistance(routeData.distance);
      setDuration(routeData.duration);
    } catch (error) {
      console.error("Routing error:", error);
    }
  }

  useEffect(() => {
    if (start && destination) {
      getRoute(start, destination);
    }
  }, [profile]);

  return (
    <div>
      <MapContainer
        center={[12.899738, 74.983481]}
        zoom={30}
        style={{
          height: "500px",
          width: "100%",
        }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationSelector
          setStart={setStart}
          setDestination={setDestination}
          getRoute={getRoute}
        />

        {start && (
          <Marker position={start}>
            <Popup>Start Location</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={destination}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {route && (
          <Polyline
            positions={route}
            pathOptions={{
              weight: 6,
            }}
          />
        )}
      </MapContainer>

      {distance !== null && duration !== null && (
        <div>
          <h3>Route</h3>

          <p>
            Distance: {(distance / 1000).toFixed(2)} km
          </p>

          <p>
            Estimated time:{" "}
            {Math.round(duration / 60)} minutes
          </p>
        </div>
      )}
    </div>
  );
}

export default MapView;