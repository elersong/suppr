import React, { useState, useEffect } from "react";
import { Link, useHistory, useParams } from "react-router-dom";
import { createReservation, readReservation, updateReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function ReservationForm( { setActiveDate } ) {
  let startingValues = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    people: 1,
    reservation_date: "",
    reservation_time: "",
  };
  const { reservation_id } = useParams();

  const [formData, setFormData] = useState(startingValues);
  const [apiError, setApiError] = useState();
  const [formError, setFormError] = useState();
  const history = useHistory();

  useEffect(loadReservation, [reservation_id])

  // check for a reservation_id in the url
  // if it isn't there, then this is a new reservation, so don't load anything
  function loadReservation() {
    if (reservation_id === undefined) return null;
    const abortController = new AbortController();
    readReservation({ reservation_id }, abortController.signal)
      .then(data => {
        data.reservation_date = new Date(data.reservation_date).toISOString().split("T")[0];
        return data;
      })
      .then(setFormData)
      .catch(setApiError);
    return () => abortController.abort();
  }

  const handleSubmit = async (e) => {
    if (reservation_id === undefined) {
      await handleNewSubmit(e)
    } else {
      await handleUpdate(e)
    }
  }

  const handleNewSubmit = async (e) => {
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    const ABORT = new AbortController();
    const runUpdateFunction = async () => {
      try {
        const response = await updateReservation(formData, ABORT.signal);
        setActiveDate(formData.reservation_date)
        console.log("Reservation Updated", response);
      } catch (err) {
        if (err.name === "AbortError") {
          console.log(err);
        } else {
          await setApiError(err);
        }
      }
    };
    await runUpdateFunction();
    if (!apiError) {
      history.push(`/dashboard`);
    }

    return () => {
      ABORT.abort();
    };
  }

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
        if (new Date(e.target.value).getDay() === 1) {
          setFormError({message: "Restaurant closed on Tuesdays. Select another day."})
          newState = { ...formData, reservation_date: e.target.value };
        } else {
          if (Date.parse(e.target.value) < Date.now()) {
            setFormError({message: 'Past dates make no sense. Try again.'})
            newState = { ...formData, reservation_date: e.target.value };
          } else {
            setFormError(null)
            newState = { ...formData, reservation_date: e.target.value };
          }
        }
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
      {formError && <ErrorAlert error={formError}/>}
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
        //min={today()}
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
