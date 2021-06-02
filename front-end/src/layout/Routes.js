import Dashboard from "../dashboard/Dashboard";
import NotFound from "./NotFound";
import React , { useState } from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import ReservationForm from "../dashboard/ReservationForm";
import Search from "../dashboard/Search"
import SeatingForm from "../dashboard/SeatingForm";
import TableForm from "../dashboard/TableForm";
import { today } from "../utils/date-time";
import useQuery from "../utils/useQuery";

/**
 * Defines all the routes for the application.
 * This is the parentmost customized component in the application.
 * Holds the state of the activeDate (date string), passed to children components.
 * @params none
 *
 * @returns {JSX.Element}
 */

function Routes() {
  const [activeDate, setActiveDate] = useState(today());
  let query = useQuery();
  if (query.get("date") && query.get("date") !== activeDate) {
    setActiveDate(query.get("date"))
  }
  
  return (
    <Switch>
      <Route exact={true} path="/">
        <Redirect to={"/dashboard"} />
      </Route>
      <Route exact={true} path="/search">
        <Search setActiveDate={setActiveDate} />
      </Route>
      <Route exact={true} path="/tables/new">
        <TableForm />
      </Route>
      <Route exact={true} path="/reservations/new">
        <ReservationForm setActiveDate={setActiveDate} />
      </Route>
      <Route exact={true} path="/reservations/:reservation_id/edit">
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
