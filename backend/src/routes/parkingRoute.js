const express = require("express");
const {
    getSlots,
    parkVehicle,
    exitVehicle,
    getParkedVehicles
} = require("../controllers/parkingController");

const router = express.Router();

router.get("/slots", getSlots);

router.post("/park",parkVehicle);

router.post("/exit",exitVehicle);

router.get('/parked',getParkedVehicles);


module.exports = router;