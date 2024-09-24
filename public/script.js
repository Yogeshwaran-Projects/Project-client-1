// Login
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    if (data.success) {
        if (data.user.role === 'student') {
            window.location.href = '/feedback.html';
        } else if (data.user.role === 'teacher') {
            window.location.href = '/view_feedback.html';
        }
    } else {
        alert(data.message || 'Login failed');
    }
});

// Load teachers and populate the dropdown
if (document.getElementById('feedbackForm')) {
    window.onload = async function() {
        try {
            // Fetch teachers from the backend API
            const response = await fetch('/teachers');
            const teachers = await response.json();

            // Get the select element where teachers will be listed
            const teacherSelect = document.getElementById('teacherSelect');

            // Populate the select dropdown with teacher options
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;  // Set the teacher ID as value
                option.textContent = `${teacher.name} (${teacher.subject})`;  // Show name and subject
                teacherSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };
}


// Load teachers and submit feedback
if (document.getElementById('feedbackForm')) {
    window.onload = async function() {
        const response = await fetch('/teachers');
        const teachers = await response.json();

        const teacherSelect = document.getElementById('teacherSelect');
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.id;
            option.textContent = `${teacher.name} (${teacher.subject})`;
            teacherSelect.appendChild(option);
        });
    };

    document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const teacher_id = document.getElementById('teacherSelect').value;
        const feedback_text = document.getElementById('feedbackText').value;

        await fetch('/submit-feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacher_id, feedback_text, student_id: 1 })
        });

        alert('Feedback submitted');
    });
}

// View feedback for teachers
if (document.getElementById('feedbackTable')) {
    window.onload = async function() {
        const teacher_id = 1;  // Replace with dynamic teacher ID from login
        const response = await fetch(`/view-feedback/${teacher_id}`);
        const feedbackList = await response.json();

        const feedbackTable = document.getElementById('feedbackTable');
        feedbackList.forEach(feedback => {
            const row = feedbackTable.insertRow();
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            cell1.textContent = feedback.feedback_text;
            cell2.textContent = new Date(feedback.created_at).toLocaleString();
        });
    };
}
// View feedback API (for teachers)
app.get('/view-feedback/:username', (req, res) => {
    const username = req.params.username;

    // Fetch the teacher's ID based on username
    const queryTeacher = 'SELECT id FROM teachers WHERE username = ?';
    db.query(queryTeacher, [username], (err, teacherResults) => {
        if (err || teacherResults.length === 0) {
            return res.status(404).send('Teacher not found');
        }

        const teacher_id = teacherResults[0].id;
        const queryFeedback = 'SELECT feedback_text, created_at FROM feedback WHERE teacher_id = ?';
        db.query(queryFeedback, [teacher_id], (err, feedbackResults) => {
            if (err) {
                return res.status(500).send('Error fetching feedback');
            }
            res.json(feedbackResults);
        });
    });
});
