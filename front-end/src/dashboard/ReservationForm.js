import React, { useState } from "react";
import { today } from "../utils/date-time";
import { Link, useHistory } from "react-router-dom";
import { createReservation } from "../utils/api";

function ReservationForm( { setActiveDate } ) {
  const startingValues = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    people: 1,
    reservation_date: "",
    reservation_time: "",
  };
  const [formData, setFormData] = useState(startingValues);
  const [apiError, setApiError] = useState();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ABORT = new AbortController();
    const runCreateFunction = async () => {
      try {
        const response = await createReservation(formData, ABORT.signal);
        setActiveDate(formData.reservation_date)
        console.log("Reservation Created", response);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log(err);
        } else {
          await setApiError(err);
        }
      }
    };
    await runCreateFunction();
    if (!apiError) {
      history.push(`/dashboard`);
    }

    return () => {
      ABORT.abort();
    };
  };

  const handleChange = (e) => {
    // DONT FRICKIN DO THIS
    // e.preventDefault();
    let newState;

    switch (e.target.name) {
      case "first_name":
        newState = { ...formData, first_name: e.target.value };
        setFormData(newState);
        break;
      case "last_name":
        newState = { ...formData, last_name: e.target.value };
        setFormData(newState);
        break;
      case "mobile_number":
        newState = { ...formData, mobile_number: e.target.value };
        setFormData(newState);
        break;
      case "people":
        newState = { ...formData, people: +e.target.value };
        setFormData(newState);
        break;
      case "reservation_date":
        newState = { ...formData, reservation_date: e.target.value };
        setFormData(newState);
        break;
      case "reservation_time":
        newState = { ...formData, reservation_time: e.target.value };
        setFormData(newState);
        break;

      default:
        // just to quiet the linter
        break;
    }
  };

  return (
    <div>
    <form onSubmit={handleSubmit}>
      <label htmlFor="first_name">First Name: </label>
      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        required
      ></input>
      <br></br>
      <label htmlFor="last_name">Last Name: </label>
      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="mobile_number">Phone: </label>
      <input
        type="tel"
        name="mobile_number"
        value={formData.mobile_number}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="people">Party Size: </label>
      <input
        type="number"
        name="people"
        min="1"
        value={formData.people}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="reservation_date">Date: </label>
      <input
        type="date"
        name="reservation_date"
        min={today()}
        value={formData.reservation_date}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="reservation_time">Time: </label>
      <input
        type="time"
        name="reservation_time"
        value={formData.reservation_time}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <button type="submit">Submit</button>
      <Link to={`/dashboard`}>
        <button className="btn btn-secondary">Cancel</button>
      </Link>
    </form>
    </div>
  );
}

export default ReservationForm;
