import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  //here are 3 hooks for 3 different functionalities
  //1. seats to keep track of the seats and storing seat data
  //2. seatCount for user input
  //3. this for message (whether booked, avialable or more)
  const [seats, setSeats] = useState([]);
  const [seatCount, setSeatCount] = useState(0);
  const [bookingStatus, setBookingStatus] = useState(''); 

  //it is returning the seat data when the components is loading or booking status is changed
  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const response = await axios.get('https://seat-reservation-binp.vercel.app/seats');
        setSeats(response.data);
      } catch (error) {
        console.error('Error fetching seats:', error);
      }
    };
    fetchSeats();
  }, [bookingStatus]); 

  console.log('Fetched Seats:', seats);
  //here it is handling the booking of the seats and updating the UI with its result
  const handleBooking = async () => {
    try {
      const response = await axios.post('https://seat-reservation-binp.vercel.app/bookSeats', { seatCount: Number(seatCount) });
      const bookedSeats = response.data.seatNumbers;
  
      setSeats(prevSeats =>
        prevSeats.map(seat =>
          bookedSeats.includes(seat.seatNumber)
            ? { ...seat, isBooked: true }
            : seat
        )
      );
      setBookingStatus(`Seats booked successfully: ${bookedSeats.join(', ')}`);
    } catch (error) {
      console.error('Booking error:', error.response?.data || error.message);
      if (error.response?.data === 'Not enough seats available') {
        setBookingStatus('Booking failed. Not enough seats available.');
      } else {
        setBookingStatus('Booking failed due to an unexpected error.');
      }
    }
  };

  //here it is reinitializing the booked seats simply it clears and reset in UI
  const handleReinitialize = async () => {
    try {
      const response = await axios.post('https://seat-reservation-binp.vercel.app/reinitializeSeats');
      setSeats(prevSeats =>
        prevSeats.map(seat => ({ ...seat, isBooked: false })) // Reset seat states in the UI
      );
      setBookingStatus(response.data);
    } catch (error) {
      console.error('Error reinitializing seats:', error);
      setBookingStatus('Failed to reinitialize seats');
    }
  };
  // this all what we are looking in our dispaly such as :-
  // -> dispalying seats
  // -> booking information
  // -> buttons for booking and reinitializing.
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-center">Seat Booking System</h1>

      <div className="grid grid-cols-7 gap-4">
        {seats.map((seat) => (
          <div
            key={seat.seatNumber}
            className={`w-12 h-12 flex items-center justify-center rounded-md text-white font-bold
              ${seat.isBooked ? 'bg-red-500' : 'bg-green-500'}`}
          >
            {seat.seatNumber}
          </div>
        ))}
      </div>

      {/* Seat availability information */}
      <div className="mt-4 text-lg font-semibold">
        Total Seats: 80
        <br />
        Booked Seats: {seats.filter(seat => seat.isBooked).length}
        <br />
        Available Seats: {seats.filter(seat => !seat.isBooked).length}
      </div>

      <div className="mt-8">
        <label className="block text-xl font-medium mb-2">Number of seats to book (max 7):</label>
        <input
          type="number"
          value={seatCount}
          onChange={(e) => setSeatCount(Math.min(80, Math.max(1, e.target.value)))}
          className="border rounded-md p-2 w-20 text-center"
        />
        <button
          onClick={handleBooking}
          className="ml-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Book Seats
        </button>
      </div>

      {/* Add Reinitialize Button */}
      <div className="mt-8">
        <button
          onClick={handleReinitialize}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          Reinitialize Seats
        </button>
      </div>

      {/* Display the booking status (success or failure message) */}
      {bookingStatus && (
        <div className="mt-4 text-lg font-semibold text-center text-red-500">
          {bookingStatus}
        </div>
      )}
    </div>
  );
}

export default App;
