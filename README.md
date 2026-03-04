# University complaint system


The University Complaint System is a web-based platform designed to streamline and manage student complaints efficiently.
 It provides students with an interface to submit complaints, track their status, and allows admins to review, update,
 and manage complaints in real-time. The project leverages Node.js, Express, EJS templates, MySQL, and is hosted 
on AWS EC2 for cloud accessibility.

	Features

Student Features:

Register and login securely.

Submit complaints with title, description, and category.

View status of submitted complaints.



Admin Features:

Login with hardcoded admin credentials:

Email: hammad@example.com

Password: hammad123

View all complaints submitted by students.

Update complaint status (Pending → In Progress → Resolved).

Delete inappropriate or duplicate complaints.

Dashboard showing complaint summary (total, pending, resolved).

	General Features:

Responsive UI using Bootstrap 5.

Error handling and input validation.

Session-based authentication for security.

Timestamp for complaint submission .


	Technology & Services Used

Backend: Node.js, Express.js

Frontend: HTML, CSS, Bootstrap 5, EJS templates

Database: MySQL on AWS RDS (or local MySQL)

Hosting / Deployment: AWS EC2

Version Control: Git + GitHub

File storage: S3

permission : IAM roles



## How to Run Locally

1. Clone the repository:

``bash 
git clone https://github.com/your-username/university-complaint-system.git
cd university-complaint-system
``
2. Install dependencies:

npm install

3. Configure your MySQL database and update db.js with credentials.

4. Start the server:

``bash 
node server.js
``

4. Open your browser and go to:

http://localhost:3000




5.Open your browser and go to:

http://localhost:3000

-> Use the admin credentials to test admin features.
