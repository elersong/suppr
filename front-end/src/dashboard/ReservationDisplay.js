import React from "react";
import { Link } from "react-router-dom";
import {changeStatus} from "../utils/api"

/**
 * Displays the details of one reservation
 * @param reservation
 *  an object, containing names, date, time and size of the reservation
 * @returns {JSX.Element}
 */

function ReservationDisplay({ reservation, setActiveDate, triggerRender }) {
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

  const editButton = () => {
    return (
      <Link to={`/reservations/${reservation_id}/edit`}>
        <button className="btn btn-secondary">Edit</button>
      </Link>
    );
  };

  const handleCancel = async () => {
    if (
      window.confirm("Do you want to cancel this reservation? This cannot be undone.")) {
      await changeStatus("cancelled", reservation_id).then(triggerRender);
    }
  };

  const cancelButton = () => {
    return (
      <span>
        <button
          type="button"
          // data-toggle="modal"
          // data-target="#reservationCancelModal"
          data-reservation-id-cancel={reservation.reservation_id}
          className="btn btn-danger"
          onClick={handleCancel}
        >
          Cancel
        </button>
      </span>
    );
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5>{`${reservation_id}. ${first_name} ${last_name}`}</h5>
        <h6>{`phone: ${mobile_number}`}</h6>
        <h6>{`date: ${reservation_date} @ ${reservation_time}`}</h6>
        <h6>{`party size: ${people}`}</h6>
        <h6
          data-reservation-id-status={reservation_id}
        >{`status: ${status}`}</h6>
        {status === "booked" && seatingButton()}
        {status !== "finished" && editButton()}
        {cancelButton()}
      </div>
    </div>
  );
}

export default ReservationDisplay;
