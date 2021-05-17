import React, { useEffect, useState } from "react";
import { listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationDisplay from "./ReservationDisplay";
import {today, previous, next} from "../utils/date-time"

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date, setActiveDate }) {
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

  function prevDay() {
    let prev = previous(date)
    setActiveDate(prev)
  }

  function nextDay() {
    let nex = next(date)
    setActiveDate(nex)
  }

  function toDay() {
    setActiveDate(today())
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for date: {date}</h4>
      </div>
      <div className="btn-group" role="group" aria-label="Basic example">
        <button onClick={prevDay} type="button" className="btn btn-secondary">
          Prev
        </button>
        <button onClick={toDay} type="button" className="btn btn-secondary">
          Today
        </button>
        <button onClick={nextDay} type="button" className="btn btn-secondary">
          Next
        </button>
      </div>
      {reservations.length === 0 && (
        <ErrorAlert
          error={{ message: "No reservations found for this date" }}
        />
      )}
      <ErrorAlert error={reservationsError} />
      {reservations.length > 0 &&
        reservations.map((reservation, idx) => {
          return <ReservationDisplay reservation={reservation} key={idx} />;
        })}
    </main>
  );
}

export default Dashboard;
