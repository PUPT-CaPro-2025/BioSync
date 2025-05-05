# BioSync
BioSync is a biometrics-based scheduling and attendance monitoring system designed to streamline user authentication, class schedules, and attendance tracking using fingerprint and facial recognition technologies.

## Features
- 🔐 Secure biometric authentication (fingerprint and face recognition)
- 🗓️ Dynamic schedule management per student
- 🧑‍🎓 Attendance monitoring with real-time tracking
- 📦 Integrated with AWS for storage and deployment
- 🌐 Web-based UI (Angular) and RESTful API (Spring Boot)

## Project Structure
- **BioSync.UI** – Frontend (Angular)
- **BioSync.API** – Backend (Spring Boot)
- **BioSync.FacialService** – Microservice for facial detection (Python/Flask)
- **AWS Services** – S3, EC2, RDS, IAM for cloud integration

## Installation

### Prerequisites
- Node.js 18+
- Angular CLI
- Java 17+
- Maven
- Docker (optional for containerization)
- Python 3.10+ (for facial service)
- AWS CLI (for deployment)

### Setup
1. **Clone the repository:**
```bash
git clone https://github.com/your-org/biosync.git
cd biosync
```

2. **Frontend:**
```bash
cd BioSync.UI
npm install
ng serve
```

3. **Backend:**
```bash
cd BioSync.API
./mvnw spring-boot:run
```

4. **Facial Recognition Service:**
```bash
cd BioSync.FacialService
pip install -r requirements.txt
python app.py
```

## Testing

### Backend Testing
BioSync's backend uses a comprehensive testing strategy with:

- **JUnit 5** - Testing framework for Java applications
- **Mockito** - Mocking framework for unit tests

### Test Coverage Goals
- Unit tests: 80%+ code coverage
- Integration tests: All API endpoints

## AWS Integration
BioSync uses the following AWS services:
- S3 – for storing profile and biometric images
- RDS (PostgreSQL) – for database hosting
- EC2 – for deploying backend and facial recognition services
- IAM – for secure access control and service permissions

## CI/CD Pipeline

BioSync uses GitHub Actions for continuous integration and deployment

## Deployment Notes
- Backend and services are containerized and deployed via GitHub Actions.
- Static Angular files are served via Nginx on EC2.
- Facial recognition microservice is accessible through internal routing.

## Credentials and Access
For AWS credentials, secrets, and access permissions, please contact the BioSync team:
- 📧 biosyncteam@gmail.com