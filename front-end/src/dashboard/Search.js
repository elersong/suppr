import React, { useState } from "react";
import ReservationDisplay from "./ReservationDisplay";
import { searchReservation } from "../utils/api";

/**
 * Displays the page to search a reservation by phone number
 * @param {Function} setActiveDate - Change the date within the Parentmost state component
 *
 * @returns {JSX.Element}
 */

function Search({ setActiveDate }) {
  const startingValues = {
    mobile_number: "",
  };
  const [formData, setFormData] = useState(startingValues);
  const [apiError, setApiError] = useState();
  const [reservations, setReservations] = useState([]);

  const handleChange = (e) => {
    // DONT FRICKIN DO THIS IN HANDLE CHANGES
    // e.preventDefault();
    let newState = { mobile_number: e.target.value };
    setFormData(newState);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ABORT = new AbortController();
    const runSearchFunction = async () => {
      try {
        const response = await searchReservation(formData, ABORT.signal);
        setReservations(response);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log(err);
        } else {
          await setApiError(err);
        }
      }
    };
    await runSearchFunction();

    return () => {
      ABORT.abort();
    };
  };

  return (
    <div>
      <nav className="navbar navbar-light bg-light">
        <form className="form-inline w-75" onSubmit={handleSubmit}>
          <input
            className="form-control mr-sm-2 w-75"
            placeholder="Enter a customer's phone number"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
          />
          <button
            className="btn btn-outline-primary my-2 my-sm-0"
            type="submit"
          >
            Find
          </button>
        </form>
      </nav>
      {apiError && <p>{apiError.message}</p>}
      {reservations.length === 0 && 
        <h2>No reservations found.</h2>
      }
      {reservations.map((obj) => {
        return (
          <ReservationDisplay
            key={obj.reservation_id}
            reservation={obj}
            setActiveDate={setActiveDate}
          />
        );
      })}
    </div>
  );
}

export default Search;
