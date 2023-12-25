import express from 'express';
import multer from 'multer';
import cors from 'cors';
import vision from '@google-cloud/vision';
import mongoose from 'mongoose';
import IdCard from './schema/Model.js';
import dotenv from 'dotenv';
dotenv.config();

// Parse Google Cloud credentials from environment variables
const CREDENTIALS = JSON.parse(JSON.stringify( {
    "type": "service_account",
    "project_id": "mystical-magnet-409110",
    "private_key_id": "858c719b0e6acb4c3fc8ed38746ada318f047cd9",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDHVBJKbGjfCADm\n1bGRdFTCTq15GiimwaRfO1qLo5R7VLjn14bspOy09I/GK7nXZg1Bv9dXVrR3WULb\n+8cXTUoztN7M12vPCrr/NqTHDphNnAycGUWYh0VwPcn0RSAUGZFxgaLb9p3oQlfP\nTE2OUHj+NCXMMub8iK+q26LrupOg+M4sqGL3h2HtnN5yYwYT7y/SodLr5J9lI1vz\nBGN8DWvi3f8VXspV2sGvJ7udge45akG/6BuO9IhjYisw7czLA84E+p7n0/5VI3D5\nicrO8kbrkveg+ASWMeGPVGvrnl84NNbTsJ37e+k8cSNqKzO3QtERvile1YEZGIKU\nhUGdO5K9AgMBAAECggEAEpv0OzOE1PGz19kyg0Bnm15qDqjVC8B/Xo61hNzoQ11l\nB+wUwiohmUFN3PP/HS9/ZFiLO7GyFoRkXBJVA4VpPIuR03D3NTSswZ/x4U2pBXHg\nsYAggb17S5/RJ3d+p7G9ZOnz8PJEysbK2OUoRnWX3i+zKa3E5+XA9MQdoUFhgAEg\nUA0cfUP0e/Y39ajliviKZaWLqaAqO8P3F69QupsOTkgcyBPVFSWzC8Amsq4sQ6VS\n4MSGynxwUMF5FOXwTEL1f2mCty1I9Ho6rpqg3S8BWvZLcQdeTs8WeUtua6yG964k\nHOUh4iWtd4yg969y4jVoKBL/qKczC3BuEDxVA6IA0QKBgQDtDs6AnI49Vbr4WM8/\ngPHmGx9pC0KwIF2AQjMl0wnHrZoKkk0NM5yl6heRLNmEEV9JWAStAaAM5bCY/pN2\n3f+LaaR4Y6AGvmaddTlzfmhsmRjsDv+IM1D0qu9Sl2ElJNyULpeuZzeCYIM76/9c\ncjzkOpnj7Z4GaRPcfsUzac24qQKBgQDXQXs4AfXTvYe8eVBcyVYkMvuMnmK4Rb9x\nDep5Y/yYVQvtpGlIcSRDlTs+F1WNX2TXpBnCUNxzaF0qP/M7nu6OHO/DCICHh4q3\nPWGqD8vKoifFLmYNNYcv3M4L33xmWthnrA22BB/u5LY2zxgMK40YkHeGFEY9mEu2\n5djwpGWx9QKBgQDa9v1JkNJV1zVfpfCw8LL/3/eweIU92HdlPECwZHG5LiKGN0LS\nueSs4ECqiSnVspI4VgPjpgenQhZQC348oqwjow4XYbZz5DU2pgvOIWnlPbjmeqgP\nr47MoIN0330M6TKR8UOMBa0hUXKGy+NRCfgyu+pfvaFkvHRrC/GtHsK2GQKBgQCG\nE4Zhk28AbXx/m/y/XrUmJQ9kPj91UhR1odpbtDjg1ZBxfEgL1FVnNyvIeBZU0Ydp\nfhCBZYZ66BWnvF+P0mX65PE+xSvxvy5bBoOvvtkMJUaqXkU4kw/acylwYcsFoi5L\nHPMJXbZaQeFxcDslUXc4Rrv8KuK5eQQoLzCaa3vghQKBgQCliuwabm6h7iyMua+U\nh11PHSiueNHQxWkT1EWs1NWVcAIRYWWz0ITaf0G9FL/5vS5Tmq30u9yCQTttSPx3\nDzEmYeNiQ7+YFwBzhA7L2GgHQ+WN+orFxYSjh3/9EkTn7MGOuqpwjepXDMNThtr8\nUe7jIsXRvk9p3LMPRrqZZDTHIg==\n-----END PRIVATE KEY-----\n",
    "client_email": "ocr-thai@mystical-magnet-409110.iam.gserviceaccount.com",
    "client_id": "111806263100274034020",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/ocr-thai%40mystical-magnet-409110.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}
))

const CONFIG = {
    credentials: {
        private_key: CREDENTIALS.private_key,
        client_email: CREDENTIALS.client_email
    }
};

// Create a new Vision API client
const client = new vision.ImageAnnotatorClient(CONFIG);

const app = express();
const port = process.env.PORT || 3001;

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Enable CORS
app.use(cors());
app.use(express.json());

// Route to get all ID cards from the database
app.get('/idcards', async (req, res) => {
    try {
        const allIdCards = await IdCard.find();
        res.json(allIdCards);
    } catch (error) {
        console.error('Error retrieving ID cards from the database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to handle file upload and text extraction
app.post('/upload', upload.single('image'), (req, res) => {
    // Check if a file is provided in the request
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    const imageBuffer = req.file.buffer;

    // Function to detect text in the uploaded image
    const detectText = async (file_path) => {
        let [result] = await client.textDetection(file_path);

        // If text detection is unsuccessful, return an error response
        if (!result || !result.fullTextAnnotation || !result.fullTextAnnotation.text) {
            return res.status(400).json({ error: 'Failed to extract text from the provided image' });
        }

        const lines = result.fullTextAnnotation.text.split('\n');

        // Extract relevant information from the text
        const thaiNationalID = lines[1].trim();
        const name = lines[5].trim().substring(4).trim();
        const lastName = lines[6].trim().substring(10).trim();
        const DOB = lines[8].trim().substring(14).trim();
        const dateOfIssue = lines[14].trim();
        const dateOfExpiry = lines[21]?.trim();

        // Check if an ID card with the same ID already exists in the database
        const existingIdCard = await IdCard.findOne({ idNumber: thaiNationalID });

        if (existingIdCard) {
            return res.status(400).json({ error: 'ID card with the same ID already exists' });
        }

        // Create a new ID card entry
        const newIdCard = new IdCard({
            idNumber: thaiNationalID,
            name: name,
            lastName: lastName,
            dateOfBirth: DOB,
            dateOfIssue: dateOfIssue,
            dateOfExpiry: dateOfExpiry,
        });

        try {
            // Save the new ID card entry to the database
            const savedIdCard = await newIdCard.save();
            res.json(newIdCard);
            console.log('ID Card data saved to the database:', savedIdCard);
        } catch (error) {
            console.error('Error saving ID Card data to the database:', error.message);
        }
    };

    detectText(imageBuffer);
});

// Route to update an existing ID card entry by ID
app.put('/idcards/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;

    try {
        const updatedIdCard = await IdCard.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedIdCard) {
            return res.status(404).json({ error: 'ID card not found' });
        }

        res.json(updatedIdCard);
    } catch (error) {
        console.error('Error updating ID card in the database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Route to delete an existing ID card entry by ID
app.delete('/idcards/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const deletedIdCard = await IdCard.findByIdAndDelete(id);

        if (!deletedIdCard) {
            return res.status(404).json({ error: 'ID card not found' });
        }

        res.json(deletedIdCard);
    } catch (error) {
        console.error('Error deleting ID card from the database:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to establish a connection to the MongoDB database
const Connection = async () => {
    const URL = process.env.MONGO_URL;
    try {
        await mongoose.connect(process.env.MONGO_URL, { useUnifiedTopology: true, useNewUrlParser: true });
        console.log('Database Connected Successfully');
    } catch (error) {
        console.log('Error: ', error.message);
    }
};

Connection();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
