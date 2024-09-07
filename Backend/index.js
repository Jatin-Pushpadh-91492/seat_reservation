const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// connecting monogdb using mongoose library
mongoose.connect('mongodb://localhost/train_seats');

// defining seats schema for ex-> {1,false or true}
const seatSchema = mongoose.Schema({
  seatNumber: Number,
  isBooked: Boolean
});

const Seat = mongoose.model('Seat', seatSchema);

// here we are initializing 80 seats 
app.get('/initializeSeats', async (req, res) => {
    try {
      const count = await Seat.countDocuments();
      if (count === 0) {
        const seats = [];
        for (let i = 1; i <= 80; i++) {
          seats.push({ seatNumber: i, isBooked: false });
        }
        await Seat.insertMany(seats);
        res.send('Seats initialized');
      } else {
        res.send('Seats already initialized');
      }
    } catch (error) {
      console.error('Error initializing seats:', error);
      res.status(500).send('Server error');
    }
  });

// if the seats are full and if you are incharge of that then you can referesh and reinitialize again
app.post('/reinitializeSeats', async (req, res) => {
    try {
      // delete the previous record of seats
      await Seat.deleteMany({});
      
      // here again we are initializing the seats
      const seats = [];
      for (let i = 1; i <= 80; i++) {
        seats.push({ seatNumber: i, isBooked: false });
      }
      await Seat.insertMany(seats);
      res.send('Seats reinitialized');
    } catch (error) {
      console.error('Error reinitializing seats:', error);
      res.status(500).send('Server error');
    }
  });
  

// here we are creating a route for booking seats 
app.post('/bookSeats', async (req, res) => {
    const { seatCount } = req.body;
  
    if (!seatCount || typeof seatCount !== 'number' || seatCount <= 0) {
      return res.status(400).send('Invalid seat count');
    }
  
    if (seatCount > 7) {
      return res.status(400).send('Cannot book more than 7 seats');
    }
  
    try {
      // getting avialble seats
      const availableSeats = await Seat.find({ isBooked: false }).sort('seatNumber').limit(seatCount);
  
      if (availableSeats.length < seatCount) {
        return res.status(400).send('Not enough seats available');
      }
  
      const seatNumbers = availableSeats.map(seat => seat.seatNumber);
  
      // Update seats to booked
      await Seat.updateMany(
        { seatNumber: { $in: seatNumbers } },
        { $set: { isBooked: true } }
      );
  
      res.send({ message: 'Seats booked successfully', seatNumbers });

  
    } catch (error) {
      console.error('Error in booking seats:', error);
      res.status(500).send('Server error');
    }
  });
  

// here we are getting to know whether seats are aviable or not
app.get('/seats', async (req, res) => {
  const seats = await Seat.find({});
  res.send(seats);
});

// initializing server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
