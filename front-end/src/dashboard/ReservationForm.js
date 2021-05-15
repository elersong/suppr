import React, { useState } from "react";
import { today } from "../utils/date-time";

function ReservationForm() {
  const startingValues = {
    first_name: "",
    last_name: "",
    mobile: "",
    size: 1,
    date: "",
    time: "",
  }
  const [formData, setFormData] = useState(startingValues);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    setFormData(startingValues);
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
      case "mobile":
        newState = { ...formData, mobile: e.target.value };
        setFormData(newState);
        break;
      case "size":
        newState = { ...formData, size: +e.target.value };
        setFormData(newState);
        break;
      case "date":
        newState = { ...formData, date: e.target.value };
        setFormData(newState);
        break;
      case "time":
        newState = { ...formData, time: e.target.value };
        setFormData(newState);
        break;
      
      default:
        // just to quiet the linter
        break;
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="first_name">First Name:  </label>
      <input
        type="text"
        name="first_name"
        value={formData.first_name}
        onChange={handleChange}
        required
      ></input>
      <br></br>
      <label htmlFor="last_name">Last Name:  </label>
      <input
        type="text"
        name="last_name"
        value={formData.last_name}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="mobile">Phone: </label>
      <input
        type="tel"
        name="mobile"
        value={formData.mobile}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="size">Party Size: </label>
      <input
        type="number"
        name="size"
        min="1"
        value={formData.size}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="date">Date: </label>
      <input
        type="date"
        name="date"
        min={today()}
        value={formData.date}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <label htmlFor="time">Time: </label>
      <input
        type="time"
        name="time"
        value={formData.time}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <button type="submit">Submit</button>
    </form>
  );
}

export default ReservationForm;
