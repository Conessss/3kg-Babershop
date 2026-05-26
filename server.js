const express = require('express');
const mongoose = require('mongoose');

const app = express();

// ADD CORS HERE - before express.json()
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    // Intercept OPTIONS method and send a 200 OK response to pass the preflight check
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

// Middleware
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
const uri = "mongodb://myUser:lacerisaih2005@ac-ohfsial-shard-00-00.qa1oxhj.mongodb.net:27017,ac-ohfsial-shard-00-01.qa1oxhj.mongodb.net:27017,ac-ohfsial-shard-00-02.qa1oxhj.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-8oa07q-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(uri)
.then(() => console.log("Connected to MongoDB!"))
.catch((error) => console.log("Error:", error.message));

// Booking Schema
const bookingSchema = new mongoose.Schema({
    name: String,
    phone: String,
    date: String,
    time: String,
    service: String,
    branch: String,
    address: String,        
    visitType: String,
    details: String,
    createdAt: { type: Date, default: Date.now }
});

const Booking = mongoose.model('Booking', bookingSchema);

// ===== API ROUTES =====

// 1. Create a new booking
app.post('/api/bookings', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        const saved = await booking.save();
        res.json({ success: true, message: "Booking saved!", booking: saved });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 2. Get all bookings
app.get('/api/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// 3. Delete a booking
app.delete('/api/bookings/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        // Find the booking by ID and remove it from MongoDB
        const deletedBooking = await Booking.findByIdAndDelete(bookingId);

        if (!deletedBooking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        res.json({ success: true, message: 'Booking successfully deleted.' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 4. Update a booking
app.put('/api/bookings/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        
        // Find the booking by ID and update it with the new data from req.body
        const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId, 
            req.body, 
            { new: true } // This tells Mongoose to return the updated version
        );

        if (!updatedBooking) {
            return res.status(404).json({ success: false, message: 'Booking not found.' });
        }

        res.json({ success: true, message: 'Booking successfully updated.', booking: updatedBooking });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
// Start server
const PORT = process.env.PORT || 3000; // Updated to support Render's dynamic ports
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});