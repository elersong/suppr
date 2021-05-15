import React from "react";

/**
 * Displays the details of one reservation
 * @param reservation
 *  an object, containing names, date, time and size of the reservation
 * @returns {JSX.Element}
 */

function ReservationDisplay({ reservation }) {  
  const {reservation_id, first_name, last_name, mobile, date, time, size} = reservation;
  return (
    <div className="card">
      <div className="card-body">
        <h5>{`${reservation_id}. ${first_name} ${last_name}`}</h5>
        <h6>{`phone: ${mobile}`}</h6>
        <h6>{`date: ${date} @ ${time}`}</h6>
        <h6>{`party size: ${size}`}</h6>
      </div>
    </div>
  );
}

export default ReservationDisplay;