import React from "react";
import { resetTable } from "../utils/api"

export default function ResetTable({ triggerRender, table_id }) {

  const handleReset = () => {
    resetTable(table_id)
    .then(triggerRender);
  }

  return (
    <div
      className="modal fade"
      id="exampleModalCenter"
      tabIndex="-1"
      role="dialog"
      aria-labelledby="exampleModalCenterTitle"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title" id="exampleModalLongTitle">
              Finish this Table
            </h5>
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">Is this table ready to seat new guests? This cannot be undone.</div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
            >
              Cancel
            </button>
            <button onClick={handleReset} data-dismiss="modal" type="button" className="btn btn-danger">
              Finish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
