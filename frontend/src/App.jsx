import { useState } from "react";
import MapView from "./components/MapView";
import { calculateRouteScore } from "./utils/accessibility";

function App() {
  const [profile, setProfile] = useState("general");

  /*
    Prototype accessibility data.

    For our current 20% implementation, this represents
    the accessibility characteristics of the recommended
    route.

    Later, these values will come from actual GIS/OSM data,
    accessibility reports, and eventually AI-based analysis.
  */
  const routeSegments = [
    {
      name: "Segment 1",
      stairs: false,
      slope: "low",
      ramp: true,
      surface: "good",
      obstacles: false,
    },
    {
      name: "Segment 2",
      stairs: false,
      slope: "low",
      ramp: true,
      surface: "good",
      obstacles: false,
    },
    {
      name: "Segment 3",
      stairs: false,
      slope: "low",
      ramp: true,
      surface: "good",
      obstacles: false,
    },
  ];

  const accessibilityScore = calculateRouteScore(
    profile,
    routeSegments
  );

  return (
    <div>
      <h1>AUXILIUM</h1>

      <div>
        <label htmlFor="profile">
          Accessibility Profile:
        </label>

        <select
          id="profile"
          value={profile}
          onChange={(e) => setProfile(e.target.value)}
        >
          <option value="general">
            General
          </option>

          <option value="wheelchair">
            Wheelchair
          </option>

          <option value="walking_difficulty">
            Walking Difficulty
          </option>
        </select>
      </div>

      <p>
        Selected profile:{" "}
        <strong>
          {profile === "wheelchair"
            ? "Wheelchair"
            : profile === "walking_difficulty"
            ? "Walking Difficulty"
            : "General"}
        </strong>
      </p>

      <MapView profile={profile} />

      <div>
        <h2>Recommended Route</h2>

        <p>
          Accessibility Score:{" "}
          <strong>{accessibilityScore}/100</strong>
        </p>

        <h3>Accessibility Features</h3>

        <p>✓ No stairs</p>
        <p>✓ Low slope</p>
        <p>✓ Ramps available</p>
        <p>✓ Suitable surface</p>
        <p>✓ No reported obstacles</p>
      </div>
    </div>
  );
}

export default App;