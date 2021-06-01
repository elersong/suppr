/**
 * Defines the base URL for the API.
 * The default values is overridden by the `API_BASE_URL` environment variable.
 */
import formatReservationDate from "./format-reservation-date";
import formatReservationTime from "./format-reservation-time";

// DON'T FORGET TO SET THIS ENV_VAR ON VERCEL FRONT END
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

/**
 * Defines the default headers for these functions to work with `json-server`
 */
const headers = new Headers();
headers.append("Content-Type", "application/json");

/**
 * Fetch `json` from the specified URL and handle error status codes and ignore `AbortError`s
 *
 * This function is NOT exported because it is not needed outside of this file.
 *
 * @param url
 *  the url for the requst.
 * @param options
 *  any options for fetch
 * @param onCancel
 *  value to return if fetch call is aborted. Default value is undefined.
 * @returns {Promise<Error|any>}
 *  a promise that resolves to the `json` data or an error.
 *  If the response is not in the 200 - 399 range the promise is rejected.
 */
async function fetchJson(url, options, onCancel) {
  try {
    const response = await fetch(url, options);
    console.log("API.JS ", response.status);
    if (response.status === 204) {
      return null;
    }

    const payload = await response.json();

    if (payload.error) {
      return Promise.reject({ message: payload.error });
    }
    return payload.data;
  } catch (error) {
    if (error.name !== "AbortError") {
      console.error(error.stack);
      throw error;
    }
    return Promise.resolve(onCancel);
  }
}

/**
 * Retrieves all existing reservation.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of reservation saved in the database.
 */

export async function listReservations(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, [])
    .then(formatReservationDate)
    .then(formatReservationTime);
}

/**
 * Creates a new reservation, sending a POST request to /reservations/new
 *
 * @param reservationInfo
 *  an object, describing the reservation to create, which must have proper properties
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the new reservation, which will have a `reservation_id` property.
 */
export async function createReservation(reservationInfo, signal) {
  const url = `${API_BASE_URL}/reservations`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({"data": reservationInfo}),
    signal,
  };
  return await fetchJson(url, options);
}

/**
 * Creates a new table, sending a POST request to /tables/new
 *
 * @param tableInfo
 *  an object, describing the table to create, which must have proper properties
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the new table, which will have a `table_id` property.
 */
 export async function createTable(tableInfo, signal) {
  const url = `${API_BASE_URL}/tables`;
  const options = {
    method: "POST",
    headers,
    body: JSON.stringify({"data": tableInfo}),
    signal,
  };
  return await fetchJson(url, options);
}

/**
 * Retrieves all existing tables.
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */

 export async function listTables(params, signal) {
  const url = new URL(`${API_BASE_URL}/tables`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, []);
}


/**
 * Seats a reservation at a table, sending a PUT request to /tables/:table_id/seat
 *
 * @param tableInfo
 *  an object, describing the table to create, which must have proper properties
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the new table, which will have a `table_id` property.
 */
 export async function seatTable(tableInfo) {
  const url = `${API_BASE_URL}/tables/${tableInfo.table_id}/seat`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({"data": {"reservation_id": tableInfo.reservation_id}}),
  };
  return await fetchJson(url, options, {});
}

/**
 * Resets an occupied table, sending a DELETE request to /tables/:table_id/seat
 *
 * @param tableId
 *  the ID of the table to free-up
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to a table row, which will have a null `reservation_id` property.
 */
 export async function resetTable(tableData) {
  const url = `${API_BASE_URL}/tables/${tableData.table_id}/seat`;
  const options = {
    method: "DELETE",
    headers,
    body: JSON.stringify({"data": {"reservation_id": tableData.reservation_id}})
  };
  return await fetchJson(url, options, {});
}

/**
 * Updates the status of an existing reservation, sending a PUT request to /reservations/:reservation_id/status
 *
 * @param tableId
 *  the ID of the table to free-up
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to a table row, which will have a null `reservation_id` property.
 */
 export async function changeStatus(status, reservation_id, signal) {
  const url = `${API_BASE_URL}/reservations/${reservation_id}/status`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({"data": {"status": status}}),
    signal
  };
  return await fetchJson(url, options, {});
}

/**
 * Retrieves reservations with matching phone numbers
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */

 export async function searchReservation(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value.toString())
  );
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Retrieves reservations by id
 * @returns {Promise<[reservation]>}
 *  a promise that resolves to a possibly empty array of tables saved in the database.
 */

 export async function readReservation(params, signal) {
  const url = new URL(`${API_BASE_URL}/reservations/${params.reservation_id}`);
  return await fetchJson(url, { headers, signal }, []);
}

/**
 * Updates an existing reservation, sending a PUT request to /reservations/:reservation_id
 *
 * @param tableId
 *  the ID of the table to free-up
 * @param signal
 *  optional AbortController.signal
 * @returns {Promise<Error|*>}
 *  a promise that resolves to the updated reservation
 */
 export async function updateReservation(updatedReservation, signal) {
  const url = `${API_BASE_URL}/reservations/${updatedReservation.reservation_id}`;
  const options = {
    method: "PUT",
    headers,
    body: JSON.stringify({"data": updatedReservation}),
    signal
  };
  return await fetchJson(url, options, {});
}