import React from "react";
import { Link } from "react-router-dom";
/**
 * Displays the details of one reservation
 * @param reservation
 *  an object, containing names, date, time and size of the reservation
 * @returns {JSX.Element}
 */

function ReservationDisplay({ reservation, setActiveDate }) {
  const {
    reservation_id,
    first_name,
    last_name,
    mobile_number,
    reservation_date,
    reservation_time,
    people,
    status,
  } = reservation;

  const seatingButton = () => {
    return (
      <Link to={`/reservations/${reservation_id}/seat`}>
        <button
          className="btn btn-secondary"
          onClick={() => setActiveDate(reservation_date)}
        >
          Seat
        </button>
      </Link>
    );
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5>{`${reservation_id}. ${first_name} ${last_name}`}</h5>
        <h6>{`phone: ${mobile_number}`}</h6>
        <h6>{`date: ${reservation_date} @ ${reservation_time}`}</h6>
        <h6>{`party size: ${people}`}</h6>
        <h6 data-reservation-id-status={reservation.reservation_id}>{`status: ${status}`}</h6>
        {status === "booked" && seatingButton()}
      </div>
    </div>
  );
}

export default ReservationDisplay;
