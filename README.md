# Parking Lot Management System

A full-stack parking lot management application built using React, Node.js, Express, and PostgreSQL.

The application allows users to park vehicles, generate parking tickets, view real-time slot availability, exit vehicles, calculate parking fares, and view currently parked vehicles.

## Features

- Park bikes, cars, and trucks
- Fixed parking capacity for each vehicle type
- Real-time parking slot availability
- Prevent duplicate parking for the same vehicle
- Generate a unique parking ticket
- Store vehicle entry and exit times
- Exit using ticket ID or vehicle number
- Automatically calculate parking duration
- Calculate parking fare based on duration
- Display currently parked vehicles
- Handle parking full and invalid input cases

## Tech Stack

### Frontend

- React
- Vite
- CSS
- Fetch API

### Backend

- Node.js
- Express.js
- PostgreSQL
- node-postgres (`pg`)

## Project Structure

```text
parking-lot-system/
├── backend/
│   ├── database/
│   │   └── schema.sql
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   └── parkingController.js
│   │   ├── routes/
│   │   │   └── parkingRoutes.js
│   │   └── app.js
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   └── package.json
│
└── README.md
```

## Parking Capacity

| Vehicle Type | Total Slots |
| --- | ---: |
| Bike | 5 |
| Car | 5 |
| Truck | 2 |

Slot availability is calculated dynamically by counting tickets with a `parked` status.

## Fare Rules

| Parking Duration | Fare |
| --- | ---: |
| 1–3 hours | ₹30 |
| 4–6 hours | ₹85 |
| 7+ hours | ₹120 |

Partial hours are rounded up to the next whole hour.

For example, 4 hours and 15 minutes is calculated as 5 hours.

## API Endpoints

### Get Slot Availability

`GET /api/slots`

Returns the total and available slots for each vehicle type.

Example response:

```json
{
  "bike": {
    "total": 5,
    "available": 5
  },
  "car": {
    "total": 5,
    "available": 4
  },
  "truck": {
    "total": 2,
    "available": 2
  }
}
```

### Park a Vehicle

`POST /api/park`

Request body:

```json
{
  "vehicleNumber": "KA01AB1234",
  "vehicleType": "car"
}
```

Example success response:

```json
{
  "success": true,
  "ticket": {
    "ticketId": "TKT-1001",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "car",
    "entryTime": "2026-07-10T10:00:00.000Z"
  }
}
```

### Exit a Vehicle

`POST /api/exit`

A vehicle can exit using either its ticket ID or vehicle number.

Using ticket ID:

```json
{
  "ticketId": "TKT-1001"
}
```

Using vehicle number:

```json
{
  "vehicleNumber": "KA01AB1234"
}
```

Example success response:

```json
{
  "success": true,
  "receipt": {
    "ticketId": "TKT-1001",
    "vehicleNumber": "KA01AB1234",
    "entryTime": "2026-07-10T10:00:00.000Z",
    "exitTime": "2026-07-10T12:00:00.000Z",
    "durationHours": 2,
    "amount": 30
  }
}
```

### Get Currently Parked Vehicles

`GET /api/parked`

Returns all vehicles whose ticket status is currently `parked`.

Example response:

```json
[
  {
    "ticketId": "TKT-1001",
    "vehicleNumber": "KA01AB1234",
    "vehicleType": "car",
    "entryTime": "2026-07-10T10:00:00.000Z"
  }
]
```

## Database Setup

PostgreSQL is required to run the backend locally.

Create a PostgreSQL database:

```sql
CREATE DATABASE parking_lot;
```

Run the provided schema file from the `backend` directory:

```bash
psql -U postgres -d parking_lot -f database/schema.sql
```
## Schema Design

The application uses a single `tickets` table to store the complete parking lifecycle of a vehicle.

| Column | Description |
| --- | --- |
| `id` | Auto-generated primary key |
| `ticket_id` | Unique parking ticket ID |
| `vehicle_number` | Vehicle registration number |
| `vehicle_type` | Vehicle type: bike, car, or truck |
| `entry_time` | Vehicle parking entry time |
| `exit_time` | Vehicle exit time |
| `amount` | Calculated parking fare |
| `status` | Current ticket status: parked or exited |

## Environment Variables

Create a `.env` file inside the `backend` directory.

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=parking_lot
DB_PASSWORD=your_postgresql_password
DB_PORT=5432
```

The `.env` file is excluded from Git and should not be committed.

## Running the Backend

Navigate to the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
node server.js
```

The backend runs at:

`http://localhost:5000`

## Running the Frontend

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in the terminal.

## Error Handling

The application handles:

- Missing vehicle number or vehicle type
- Invalid vehicle type
- Duplicate parking of an already parked vehicle
- Parking capacity reached
- Invalid ticket ID or vehicle number during exit
- Attempting to exit an already exited vehicle
- Internal server errors

## Author

Syed Vali