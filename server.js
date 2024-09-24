const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cors());

// MySQL Database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '@YoGeSh87',
    database: 'feedback_system'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

// Student and Teacher Login API
app.post('/login', (req, res) => {
    const { username, password, role } = req.body;

    // Check if login is for student or teacher based on role
    if (role === 'student') {
        const query = 'SELECT * FROM students WHERE username = ? AND password = ?';
        db.query(query, [username, password], (err, results) => {
            if (err) {
                res.status(500).json({ success: false, message: 'Error logging in' });
            } else if (results.length > 0) {
                res.status(200).json({ success: true, user: results[0], role: 'student' });
            } else {
                res.status(401).json({ success: false, message: 'Invalid student credentials' });
            }
        });
    } else if (role === 'teacher') {
        const query = 'SELECT * FROM teachers WHERE email = ? AND password = ?'; // Using email instead of username
        db.query(query, [username, password], (err, results) => {
            if (err) {
                res.status(500).json({ success: false, message: 'Error logging in' });
            } else if (results.length > 0) {
                res.status(200).json({ success: true, user: results[0], role: 'teacher' });
            } else {
                res.status(401).json({ success: false, message: 'Invalid teacher credentials' });
            }
        });
    } else {
        res.status(400).json({ success: false, message: 'Invalid role' });
    }
});


// Fetch Teachers API
app.get('/teachers', (req, res) => {
    const query = 'SELECT * FROM teachers';
    db.query(query, (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching teachers' });
        } else {
            res.json(results);
        }
    });
});

// Submit Feedback API
app.post('/submit-feedback', (req, res) => {
    const { teacher_id, student_id, feedback_text } = req.body;

    const query = 'INSERT INTO feedback (teacher_id, student_id, feedback_text) VALUES (?, ?, ?)';
    db.query(query, [teacher_id, student_id, feedback_text], (err) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error submitting feedback' });
        } else {
            res.status(200).json({ success: true, message: 'Feedback submitted successfully' });
        }
    });
});

// View Feedback API (For Teachers)
app.get('/view-feedback/:teacher_id', (req, res) => {
    const teacher_id = req.params.teacher_id;

    const query = 'SELECT feedback_text, created_at FROM feedback WHERE teacher_id = ?';
    db.query(query, [teacher_id], (err, results) => {
        if (err) {
            res.status(500).json({ success: false, message: 'Error fetching feedback' });
        } else {
            res.json(results);
        }
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
