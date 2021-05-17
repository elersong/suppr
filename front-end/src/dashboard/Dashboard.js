import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationDisplay from "./ReservationDisplay";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);

  // eslint-disable-next-line
  useEffect(loadDashboard, [date]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {date}</h4>
      </div>
      {reservations.length === 0 &&
        <ErrorAlert error={{message: "No reservations found for this date"}} />
      }
      <ErrorAlert error={reservationsError} />
      {reservations.length > 0 && reservations.map((reservation, idx) => {
        return <ReservationDisplay reservation={reservation} key={idx} />;
      })}
    </main>
  );
}

export default Dashboard;
