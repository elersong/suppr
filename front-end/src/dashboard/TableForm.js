import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function TableForm( ) {
  const startingValues = {
    table_name: "",
    capacity: ""
  };
  const [formData, setFormData] = useState(startingValues);
  const [apiError, setApiError] = useState();
  const [formError, setFormError] = useState();
  const history = useHistory();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ABORT = new AbortController();
    const runCreateFunction = async () => {
      try {
        const response = await createTable(formData, ABORT.signal);
        console.log("Table Created", response);
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
      case "table_name":
        let nameInput = e.target.value;
        if (nameInput.length < 2) {
          setFormError({message: "Table name must be 2 characters or longer."})
        } else {
          setFormError(null)
        }
        newState = { ...formData, table_name: nameInput };
        setFormData(newState);
        break;
      case "capacity":
        newState = { ...formData, capacity: +e.target.value };
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
      <label htmlFor="table_name">Table Name: </label>
      <input
        type="text"
        name="table_name"
        value={formData.table_name}
        minLength="2"
        onChange={handleChange}
        required
      ></input>
      <br></br>
      <label htmlFor="capacity">Max Capacity: </label>
      <input
        type="text"
        name="capacity"
        value={formData.capacity}
        onChange={handleChange}
        required
      ></input>
      <br></br>

      <button type="submit">Submit</button>
      <button type="button" onClick={history.goBack} className="btn btn-secondary">Cancel</button>
    </form>
    </div>
  );
}

export default TableForm;
