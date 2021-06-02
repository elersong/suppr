import ErrorAlert from "../layout/ErrorAlert";
import React, { useState, useEffect } from "react";
import { seatTable, listTables } from "../utils/api";
import { useHistory, useParams } from "react-router-dom";

/**
 * Displays the form to seat a reservation at a free table
 * @param {Number} reservation_id - Optional | The reservation, from the url, to be updated
 *
 * @returns {JSX.Element}
 */

function SeatingForm() {
  const { reservation_id } = useParams();
  const startingValues = {
    table_id: "1",
    reservation_id,
  };

  const [formData, setFormData] = useState(startingValues);
  const [tableData, setTableData] = useState([]);

  const [submitError, setSubmitError] = useState(null);
  const [formError, setFormError] = useState();

  const history = useHistory();

  // This doesn't require exhaustive dependencies
  // eslint-disable-next-line
  useEffect(loadData, [reservation_id]);

  // Look up data for all table objects
  // Look up data for all reservations, find the current one
  function loadData() {
    const abortController = new AbortController();

    listTables({}, abortController.signal)
      .then((data) => data.filter((table) => !table.reservation_id))
      .then((data) => {
        startingValues.table_id = data[0].table_id;
        setFormData(startingValues);
        return data;
      })
      .then(setTableData)
      .catch(setFormError);

    return () => abortController.abort();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError(null);
    seatTable(formData)
      .then(() => history.push("/dashboard"))
      .catch(setSubmitError);
  };

  return (
    <div>
      {submitError && <ErrorAlert error={submitError} />}
      {formError && <ErrorAlert error={formError} />}
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_id">Select Table:</label>
        <select id="table_id" name="table_id">
          {tableData.length > 0 &&
            tableData.map((table) => {
              return (
                <option key={`table-${table.table_id}`} value={table.table_id} >
                  {`${table.table_name} - ${table.capacity}`}
                </option>
              );
            })}
        </select>
        <br></br>

        <button type="submit" className="btn btn-secondary" id="pleaseClick">
          Submit
        </button>

        <button type="button" onClick={history.goBack} className="btn btn-secondary">
          Cancel
        </button>
      </form>
    </div>
  );
}

export default SeatingForm;
