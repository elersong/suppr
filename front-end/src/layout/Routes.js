import React , { useState } from "react";

import { Redirect, Route, Switch } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import ReservationForm from "../dashboard/ReservationForm";
import TableForm from "../dashboard/TableForm";
import SeatingForm from "../dashboard/SeatingForm";
import { today } from "../utils/date-time";

/**
 * Defines all the routes for the application.
 *
 * You will need to make changes to this file.
 *
 * @returns {JSX.Element}
 */
function Routes() {
  const [activeDate, setActiveDate] = useState(today());

  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/tables/new">
        <TableForm />
      </Route>
      <Route exact={true} path="/reservations/new">
        <ReservationForm setActiveDate={setActiveDate} />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/seat">
        <SeatingForm date={activeDate} />
      </Route>
      <Route exact={true} path="/reservations">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route path="/dashboard">
        <Dashboard date={activeDate} setActiveDate={setActiveDate}/>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Routes;
