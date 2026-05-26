import http from "k6/http";
import { check, sleep } from "k6";

const PlanTripQuery = `
  query PlanTrip($originLat: CoordinateValue!, $originLon: CoordinateValue!, $destLat: CoordinateValue!, $destLon: CoordinateValue!, $dateTime: OffsetDateTime) {
    planConnection(
      origin: {location: {coordinate: {latitude: $originLat, longitude: $originLon}}}
      destination: {location: {coordinate: {latitude: $destLat, longitude: $destLon}}}
      dateTime: {earliestDeparture: $dateTime}
      modes: {transit: {transit: [{mode: SUBWAY}]}}
    ) {
      edges {
        node {
          start
          end
          legs {
            mode
            from { name lat lon stop { gtfsId } departure { scheduledTime estimated { time delay } } }
            to { name lat lon stop { gtfsId } arrival { scheduledTime estimated { time delay } } }
            route { gtfsId longName shortName }
            id
          }
        }
      }
    }
  }
`;

type Station = { name: string; lat: number; lon: number };

const STATIONS: Station[] = [
  { name: "12th Street / Oakland City Center", lat: 37.803463, lon: -122.271596 },
  { name: "16th Street / Mission", lat: 37.76518, lon: -122.419679 },
  { name: "19th Street Oakland", lat: 37.808065, lon: -122.26872 },
  { name: "24th Street / Mission", lat: 37.752426, lon: -122.418445 },
  { name: "Antioch", lat: 37.995415, lon: -121.780353 },
  { name: "Ashby", lat: 37.853087, lon: -122.269819 },
  { name: "Balboa Park", lat: 37.721748, lon: -122.447433 },
  { name: "Bay Fair", lat: 37.696938, lon: -122.126431 },
  { name: "Berryessa / North San Jose", lat: 37.368474, lon: -121.874759 },
  { name: "Castro Valley", lat: 37.690776, lon: -122.075615 },
  { name: "Civic Center / UN Plaza", lat: 37.77945, lon: -122.413879 },
  { name: "Coliseum", lat: 37.753604, lon: -122.196698 },
  { name: "Colma", lat: 37.684642, lon: -122.466167 },
  { name: "Concord", lat: 37.973773, lon: -122.029126 },
  { name: "Daly City", lat: 37.706263, lon: -122.468922 },
  { name: "Downtown Berkeley", lat: 37.870113, lon: -122.268166 },
  { name: "Dublin / Pleasanton", lat: 37.701692, lon: -121.899242 },
  { name: "El Cerrito Del Norte", lat: 37.925205, lon: -122.316868 },
  { name: "El Cerrito Plaza", lat: 37.902633, lon: -122.298895 },
  { name: "Embarcadero", lat: 37.792741, lon: -122.397019 },
  { name: "Fremont", lat: 37.557513, lon: -121.976605 },
  { name: "Fruitvale", lat: 37.774818, lon: -122.224121 },
  { name: "Glen Park", lat: 37.733269, lon: -122.433557 },
  { name: "Hayward", lat: 37.669678, lon: -122.087 },
  { name: "Lafayette", lat: 37.893155, lon: -122.124621 },
  { name: "Lake Merritt", lat: 37.797357, lon: -122.265232 },
  { name: "MacArthur", lat: 37.828814, lon: -122.267163 },
  { name: "Millbrae", lat: 37.600199, lon: -122.38684 },
  { name: "Milpitas", lat: 37.409836, lon: -121.890803 },
  { name: "Montgomery Street", lat: 37.789213, lon: -122.401642 },
  { name: "North Berkeley", lat: 37.874, lon: -122.283591 },
  { name: "North Concord / Martinez", lat: 38.003369, lon: -122.02449 },
  { name: "Oakland International Airport", lat: 37.713256, lon: -122.212237 },
  { name: "Orinda", lat: 37.87847, lon: -122.183643 },
  { name: "Pittsburg / Bay Point", lat: 38.018881, lon: -121.944249 },
  { name: "Pittsburg Center", lat: 38.016805, lon: -121.889039 },
  { name: "Pleasant Hill / Contra Costa Centre", lat: 37.928414, lon: -122.055954 },
  { name: "Powell Street", lat: 37.784645, lon: -122.407387 },
  { name: "Richmond", lat: 37.936795, lon: -122.353004 },
  { name: "Rockridge", lat: 37.844795, lon: -122.251271 },
  { name: "San Bruno", lat: 37.63772, lon: -122.416384 },
  { name: "San Francisco International Airport", lat: 37.616091, lon: -122.392049 },
  { name: "San Leandro", lat: 37.721806, lon: -122.160713 },
  { name: "South Hayward", lat: 37.634328, lon: -122.057233 },
  { name: "South San Francisco", lat: 37.664497, lon: -122.444193 },
  { name: "Union City", lat: 37.590765, lon: -122.01723 },
  { name: "Walnut Creek", lat: 37.905812, lon: -122.067379 },
  { name: "Warm Springs / South Fremont", lat: 37.502307, lon: -121.939358 },
  { name: "West Dublin / Pleasanton", lat: 37.69976, lon: -121.928301 },
  { name: "West Oakland", lat: 37.804862, lon: -122.295185 },
];

const ENDPOINT = __ENV.OTP_URL;

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    http_req_failed: ["rate<0.01"],
    checks: ["rate>0.99"],
  },
};

export function setup() {
  if (!ENDPOINT) {
    throw new Error("OTP_URL env var is required (e.g. -e OTP_URL=https://...)");
  }
  return { endpoint: ENDPOINT };
}

function pickPair(): { origin: Station; destination: Station } {
  const origin = STATIONS[Math.floor(Math.random() * STATIONS.length)];
  let destination = STATIONS[Math.floor(Math.random() * STATIONS.length)];
  while (destination.name === origin.name) {
    destination = STATIONS[Math.floor(Math.random() * STATIONS.length)];
  }
  return { origin, destination };
}

export default function planTripScenario(data: { endpoint: string }) {
  const { origin, destination } = pickPair();

  const variables = {
    originLat: origin.lat,
    originLon: origin.lon,
    destLat: destination.lat,
    destLon: destination.lon,
    dateTime: new Date().toISOString(),
  };

  const res = http.post(
    data.endpoint,
    JSON.stringify({ query: PlanTripQuery, variables }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { name: "planConnection" },
    },
  );

  check(res, {
    "status 200": (r) => r.status === 200,
    "no graphql errors": (r) => {
      try {
        const body = r.json() as { errors?: unknown };
        return !body.errors;
      } catch {
        return false;
      }
    },
    "has itinerary": (r) => {
      try {
        const body = r.json() as {
          data?: { planConnection?: { edges?: unknown[] } };
        };
        return (body.data?.planConnection?.edges?.length ?? 0) > 0;
      } catch {
        return false;
      }
    },
  });

  sleep(Math.random() * 2);
}
