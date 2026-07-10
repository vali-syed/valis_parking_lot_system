const pool = require('../config/db');

const LIMITS = {
    bike:5,
    car:5,
    truck:2,
}

const calculateFare = (entryTime, exitTime) => {
  const milliseconds =
    new Date(exitTime) - new Date(entryTime);

  const hours = Math.ceil(
    milliseconds / (1000 * 60 * 60)
  );

  let amount;

  if (hours <= 3) {
    amount = 30;
  } else if (hours <= 6) {
    amount = 85;
  } else {
    amount = 120;
  }

  return {
    hours,
    amount,
  };
};

const getSlots = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT vehicle_type, COUNT(*) AS occupied
      FROM tickets
      WHERE status = 'parked'
      GROUP BY vehicle_type
    `);

    const slots = {
        bike:{
            total: LIMITS.bike,
            available: LIMITS.bike,
        },
        car:{
            total: LIMITS.car,
            available:LIMITS.car,
        },
        truck:{
            total: LIMITS.truck,
            available:LIMITS.truck,
        }   
    } 

    result.rows.forEach(row => {
        const type = row.vehicle_type;
        const occupied = row.occupied;
        slots[type].available = LIMITS[type]-parseInt(occupied);
    })

    console.log(slots.car); // checking the availbe slots for car.

    res.status(200).json(slots);

  } catch (error) {
    console.error(error.message);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

const parkVehicle = async (req, res) => {
  try {
    const { vehicleNumber, vehicleType } = req.body;

    //checking vehicle number and vehicle type are provided or not.
    if (!vehicleNumber || !vehicleType) {
      return res.status(400).json({
        success: false,
        message: "Vehicle number and vehicle type are required",
      });
    }

    //checking vehicle type is valid or not.
    if (!LIMITS[vehicleType]) {
      return res.status(400).json({
        success: false,
        message: "Invalid vehicle type",
      });
    }

    //checking if the vehicle is already parked or not.
    const existingVehicle = await pool.query(
      `
        SELECT *
        FROM tickets
        WHERE vehicle_number = $1
        AND status = 'parked'
      `,
      [vehicleNumber]
    );

    if (existingVehicle.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already parked",
      });
    }

    //checking if the parking is full for the given vehicle type.
    const occupiedResult = await pool.query(
      `
        SELECT COUNT(*) AS occupied
        FROM tickets
        WHERE vehicle_type = $1
        AND status = 'parked'
      `,
      [vehicleType]
    );

    const occupied = Number(
      occupiedResult.rows[0].occupied
    );

    if (occupied >= LIMITS[vehicleType]) {
      return res.status(409).json({
        success: false,
        message: "Parking Full",
      });
    }

    //generating ticket id and entry time.
    const idResult = await pool.query(
      "SELECT nextval('tickets_id_seq') AS id"
    );

    const id = Number(idResult.rows[0].id);

    const ticketId = `TKT-${1000 + id}`;

    const entryTime = new Date();

    const result = await pool.query(
      `
        INSERT INTO tickets (
          id,
          ticket_id,
          vehicle_number,
          vehicle_type,
          entry_time
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        id,
        ticketId,
        vehicleNumber,
        vehicleType,
        entryTime,
      ]
    );

    const ticket = result.rows[0];

    return res.status(201).json({
      success: true,
      ticket: {
        ticketId: ticket.ticket_id,
        vehicleNumber: ticket.vehicle_number,
        vehicleType: ticket.vehicle_type,
        entryTime: ticket.entry_time,
      },
    });
  } 
  catch (error) {
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const exitVehicle = async (req, res) => {
  try {
    const { ticketId, vehicleNumber } = req.body;

    if (!ticketId && !vehicleNumber) {
      return res.status(400).json({
        success: false,
        message: "Ticket ID or vehicle number is required",
      });
    }

    let result;

    if (ticketId) {
      result = await pool.query(
        `
          SELECT *
          FROM tickets
          WHERE ticket_id = $1
          AND status = 'parked'
        `,
        [ticketId]
      );
    } else {
      result = await pool.query(
        `
          SELECT *
          FROM tickets
          WHERE vehicle_number = $1
          AND status = 'parked'
        `,
        [vehicleNumber]
      );
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ticket not found or already exited",
      });
    }

    const ticket = result.rows[0];

    const exitTime = new Date();

    const { hours, amount } = calculateFare(
      ticket.entry_time,
      exitTime
    );

    const updatedResult = await pool.query(
      `
        UPDATE tickets
        SET exit_time = $1,
            amount = $2,
            status = 'exited'
        WHERE id = $3
        RETURNING *
      `,
      [
        exitTime,
        amount,
        ticket.id,
      ]
    );

    const updatedTicket = updatedResult.rows[0];

    return res.status(200).json({
      success: true,
      receipt: {
        ticketId: updatedTicket.ticket_id,
        vehicleNumber: updatedTicket.vehicle_number,
        entryTime: updatedTicket.entry_time,
        exitTime: updatedTicket.exit_time,
        durationHours: hours,
        amount: Number(updatedTicket.amount),
      },
    });
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getParkedVehicles = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        ticket_id,
        vehicle_number,
        vehicle_type,
        entry_time
      FROM tickets
      WHERE status = 'parked'
      ORDER BY entry_time DESC
    `);

    const parkedVehicles = result.rows.map((vehicle) => {
      return {
        ticketId: vehicle.ticket_id,
        vehicleNumber: vehicle.vehicle_number,
        vehicleType: vehicle.vehicle_type,
        entryTime: vehicle.entry_time,
      };
    });

    return res.status(200).json(parkedVehicles);
  } catch (error) {
    console.error(error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  getSlots,
  parkVehicle,
  exitVehicle,
  getParkedVehicles,
};