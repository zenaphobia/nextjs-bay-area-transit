export const legQuery = `query Leg($id: String!) {
  leg(
    id: $id
  ) {
    realtimeState
    from { departure { scheduledTime estimated { time } }}
    to { arrival { scheduledTime estimated { time } }}
  }
}` as const;

export const PlanTripQuery = `
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
        ` as const;
