CREATE TABLE tickets(
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(20) UNIQUE NOT NULL,
    vehicle_number VARCHAR(20) NOT NULL,
    vehicle_type VARCHAR(10) NOT NULL
        CHECK (vehicle_type IN ('bike', 'car', 'truck')),
    entry_time TIMESTAMP NOT NULL,
    exit_time TIMESTAMP DEFAULT NULL,
    amount DECIMAL(6,2) DEFAULT NULL,
    parking_status VARCHAR(10) NOT NULL DEFAULT 'parked'
        CHECK (status IN ('parked', 'exited'))
);