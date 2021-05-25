import React, { useEffect, useState } from "react";
import { listReservations, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import ReservationDisplay from "./ReservationDisplay";
import { today, previous, next } from "../utils/date-time";
import "./Dashboard.css";
import ResetTable from "./ResetTable";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date, setActiveDate }) {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [rerender, setRerender] = useState(true);

  const forceRerender = () => {setRerender(!rerender)}

  // eslint-disable-next-line
  useEffect(loadDashboard, [date, rerender]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    listReservations({ date }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);
    listTables({}, abortController.signal).then(setTables);
    return () => abortController.abort();
  }

  function prevDay() {
    let prev = previous(date);
    setActiveDate(prev);
  }

  function nextDay() {
    let nex = next(date);
    setActiveDate(nex);
  }

  function toDay() {
    setActiveDate(today());
  }

  return (
    <main className="d-flex flex-column">
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
      <div className="d-flex">
        <div className="col-md-6 col-sm-12" id="dasboardReservations">
          {reservations.length === 0 && (
            <ErrorAlert
              error={{ message: "No reservations found for this date" }}
            />
          )}
          <ErrorAlert error={reservationsError} />
          {reservations.length > 0 &&
            reservations.map((reservation, idx) => {
              return (
                <ReservationDisplay
                  reservation={reservation}
                  key={idx}
                  setActiveDate={setActiveDate}
                />
              );
            })}
        </div>
        <div className="col-md-6 col-sm-12" id="dashboardTables">
          <h4>Tables</h4>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Capacity</th>
                <th scope="col">Vacancy</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {tables.length > 0 &&
                tables.map((table, idx) => {
                  return (
                    <tr key={`table-${idx}`}>
                      <th scope="row">{table.table_name}</th>
                      <td>{table.capacity}</td>
                      <td data-table-id-status={table.table_id}>
                        {table.reservation_id === null ? "Free" : "Occupied"}
                      </td>
                      <td>
                        {table.reservation_id && (
                          <div>
                            <button
                              type="button"
                              className="btn btn-warning"
                              data-table-id-finish={table.table_id}
                              data-toggle="modal"
                              data-target="#exampleModalCenter"
                            >
                              Finish
                            </button>
                            <ResetTable triggerRender={forceRerender} table_id={table.table_id} />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default Dashboard;
