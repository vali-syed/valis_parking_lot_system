import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [slots, setSlots] = useState(null);
  const [parkedVehicles, setParkedVehicles] = useState([]);

  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("car");

  const [exitValue, setExitValue] = useState("");

  const [ticket, setTicket] = useState(null);
  const [receipt, setReceipt] = useState(null);

  const [message, setMessage] = useState("");

  const fetchSlots = async () => {
    const response = await fetch(`${API_URL}/slots`);
    const data = await response.json();

    setSlots(data);
  };

  const fetchParkedVehicles = async () => {
    const response = await fetch(`${API_URL}/parked`);
    const data = await response.json();

    setParkedVehicles(data);
  };

  const refreshDashboard = async () => {
    await Promise.all([
      fetchSlots(),
      fetchParkedVehicles(),
    ]);
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handlePark = async (event) => {
    event.preventDefault();

    setMessage("");
    setReceipt(null);

    try {
      const response = await fetch(`${API_URL}/park`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          vehicleNumber,
          vehicleType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setTicket(data.ticket);

      setVehicleNumber("");

      await refreshDashboard();
    } catch (error) {
      setMessage("Unable to park vehicle");
    }
  };

  const handleExit = async (event) => {
    event.preventDefault();

    setMessage("");
    setReceipt(null);

    try {
      const body = exitValue
        .toUpperCase()
        .startsWith("TKT-")
        ? {
            ticketId: exitValue,
          }
        : {
            vehicleNumber: exitValue,
          };

      const response = await fetch(`${API_URL}/exit`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
        return;
      }

      setReceipt(data.receipt);

      setExitValue("");

      await refreshDashboard();
    } catch (error) {
      setMessage("Unable to exit vehicle");
    }
  };

  const totalSlots = slots
    ? Object.values(slots).reduce(
        (total, slot) => total + slot.total,
        0
      )
    : 0;

  const availableSlots = slots
    ? Object.values(slots).reduce(
        (total, slot) => total + slot.available,
        0
      )
    : 0;

  const occupiedSlots = totalSlots - availableSlots;

  return (
    <main className="app">
      <header className="header">
        <h1>Parking lot management</h1>

        <p>
          {occupiedSlots} of {totalSlots} slots occupied
        </p>
      </header>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <section className="availability-grid">
        {slots &&
          Object.entries(slots).map(([type, data]) => (
            <div
              className="availability-card"
              key={type}
            >
              <div className="slot-title">
                <span
                  className={`slot-dot ${type}`}
                ></span>

                <h3>
                  {type.charAt(0).toUpperCase() +
                    type.slice(1)}
                </h3>

                {data.available === 0 && (
                  <span className="full-badge">
                    Full
                  </span>
                )}
              </div>

              <div className="slot-information">
                <strong>{data.available}</strong>

                <span>/ {data.total} free</span>
              </div>
            </div>
          ))}
      </section>

      <section className="forms-grid">
        <form
          className="action-card"
          onSubmit={handlePark}
        >
          <h2 className="park-heading">Park a vehicle</h2>

          <p className="card-description">
            Generates a ticket
          </p>

          <label>Vehicle number</label>

          <input
            type="text"
            value={vehicleNumber}
            onChange={(event) =>
              setVehicleNumber(event.target.value)
            }
            placeholder="KA01AB1234"
          />

          <label>Vehicle type</label>

          <select
            value={vehicleType}
            onChange={(event) =>
              setVehicleType(event.target.value)
            }
          >
            <option value="bike">Bike</option>
            <option value="car">Car</option>
            <option value="truck">Truck</option>
          </select>

          <button
            className="primary-button"
            type="submit"
          >
            Generate ticket
          </button>
        </form>

        <form
          className="action-card"
          onSubmit={handleExit}
        >
          <h2 className="exit-heading">Exit a vehicle</h2>

          <p className="card-description">
            Calculates the fare
          </p>

          <label>
            Ticket ID or vehicle number
          </label>

          <input
            type="text"
            className="exit-input"
            value={exitValue}
            onChange={(event) =>
              setExitValue(event.target.value)
            }
            placeholder="TKT-1001"
          />

          <button
            className="secondary-button"
            type="submit"
          >
            Exit and calculate fare
          </button>

          {receipt && (
            <div className="fare-result">
              <div>
                <span>Duration</span>

                <strong>
                  {receipt.durationHours} hours
                </strong>
              </div>

              <div>
                <span>Amount due</span>

                <strong className="amount">
                  ₹{receipt.amount}
                </strong>
              </div>
            </div>
          )}
        </form>
      </section>

      {ticket && (
        <section className="ticket-card">
          <h2>Generated ticket</h2>

          <div className="ticket-grid">
            <div>
              <span>Ticket ID</span>

              <strong>
                {ticket.ticketId}
              </strong>
            </div>

            <div>
              <span>Vehicle</span>

              <strong>
                {ticket.vehicleNumber}
              </strong>
            </div>

            <div>
              <span>Type</span>

              <strong>
                {ticket.vehicleType}
              </strong>
            </div>

            <div>
              <span>Entry time</span>

              <strong>
                {new Date(
                  ticket.entryTime
                ).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </strong>
            </div>
          </div>
        </section>
      )}

      <section className="parked-section">
        <h2>Currently parked</h2>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Vehicle no.</th>
                <th>Type</th>
                <th>Entry time</th>
              </tr>
            </thead>

            <tbody>
              {parkedVehicles.map((vehicle) => (
                <tr key={vehicle.ticketId}>
                  <td>{vehicle.ticketId}</td>

                  <td>{vehicle.vehicleNumber}</td>

                  <td>
                    {vehicle.vehicleType
                      .charAt(0)
                      .toUpperCase() +
                      vehicle.vehicleType.slice(1)}
                  </td>

                  <td>
                    {new Date(
                      vehicle.entryTime
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}

              {parkedVehicles.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="empty-table"
                  >
                    No vehicles currently parked
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default App;