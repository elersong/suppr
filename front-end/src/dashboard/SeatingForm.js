import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import { seatTable, listTables, listReservations } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatingForm({ date }) {
  const { reservation_id } = useParams();
  const startingValues = {
    table_id: "1",
    reservation_id,
  };

  const [formData, setFormData] = useState(startingValues);
  const [tableData, setTableData] = useState([]);
  const [reservationData, setReservationData] = useState();

  const [apiError, setApiError] = useState();
  const [formError, setFormError] = useState();

  const history = useHistory();

  useEffect(loadData, [date, reservation_id]);

  // Look up data for all tables
  // Look up data for all reservations, find the current one
  function loadData() {
    const abortController = new AbortController();
    listReservations({ date }, abortController.signal)
      .then((data) =>
        setReservationData(
          data.filter((res) => +res.reservation_id === +reservation_id)[0]
        )
      )
      .catch(setFormError);
    listTables({}, abortController.signal)
      .then((data) => data.filter((table) => !table.reservation_id))
      .then(setTableData);
    return () => abortController.abort();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ABORT = new AbortController();
    const runUpdateFunction = async () => {
      try {
        const response = await seatTable(formData, ABORT.signal);
        console.log("Table Seated", response);
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
      history.push("/dashboard");
    }

    return () => {
      ABORT.abort();
    };
  };

  const getCapacity = (id) => {
    return tableData.find((el) => el.table_id === +id).capacity;
  };

  const handleChange = (e) => {
    // DONT FRICKIN DO THIS
    // e.preventDefault();
    let newState;

    if (reservationData.people <= getCapacity(e.target.value)) {
      newState = { ...formData, table_id: e.target.value };
    } else {
      newState = { ...formData, table_id: "" };
    }
    setFormData(newState);
  };

  return (
    <div>
      {formError && <ErrorAlert error={formError} />}
      {reservationData &&
        <div className="card">
        <div className="card-body">
          <h5>{`${reservation_id}. ${reservationData.first_name} ${reservationData.last_name}`}</h5>
          <h6>{`phone: ${reservationData.mobile_number}`}</h6>
          <h6>{`date: ${reservationData.reservation_date} @ ${reservationData.reservation_time}`}</h6>
          <h6>{`party size: ${reservationData.people}`}</h6>
        </div>
      </div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_id">Select Table: </label>
        <select
          name="table_id"
          value={formData.table_id}
          onChange={handleChange}
          required
        >
          {tableData.length > 0 &&
            tableData.map((table) => {
              return (
                <option
                  key={`table-${table.table_id}`}
                  value={table.table_id}
                >{`${table.table_name} - ${table.capacity}`}</option>
              );
            })}
        </select>
        <br></br>

        <button type="submit">Submit</button>

        <button onClick={history.goBack} className="btn btn-secondary">
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatingForm;
