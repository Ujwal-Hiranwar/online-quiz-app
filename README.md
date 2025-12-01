# Online Quiz Application - Project Documentation

**Project ID:** 65HIBKJS
**Intern Name:** Ujwal Hiranwar

## 1. Introduction

**Project Overview and Purpose**

This document provides a detailed overview of the Online Quiz Application, a full-stack
web application developed as part of the InnoByte Services internship project. The
application is designed to be a robust platform for creating, managing, and taking quizzes
online. It features distinct roles for regular users and administrators, a secure
authentication system, and real-time feedback on quiz performance. The application is also
containerized using docker for ease of deployment.

**Key Features and Functionality**

- **User Authentication:** Secure user registration and login system using JWT (JSON Web Tokens).
- **Role-Based Access Control:** Separate dashboards and permissions for USER and ADMIN roles.
- **Quiz Management (Admin):** Admins can create, update, and delete quizzes, manage quiz topics, difficulty levels, and time limits.
- **Question Management (Admin):** Admins can add, edit, and delete questions (both single and multiple choice) within each quiz.
- **Quiz Taking (User):** Users can browse available quizzes, take them within a timed environment, and submit their answers. He can also get feedback on every question just after submitting the question and He will get final score after finishing the test.
- **Scoring and Results:** Automatic scoring upon quiz completion with detailed results, including score, percentage, and correct/incorrect answers.
- **Quiz History:** Users can view their past quiz attempts and track their performance over time.
- **Leaderboards:** Global and quiz-specific leaderboards to foster a competitive environment.

**Target Audience**

- **Students/Users:** Individuals looking to test their knowledge on various subjects.
- **Quiz Administrators/Educators:** Users responsible for creating and managing the
    quiz content.


**Technologies Used**

- **Backend:**
    - Java 17
    - Spring Boot 3.x
    - Spring Security (with JWT)
    - Spring Data JPA (Hibernate)
    - MySQL 8.x
    - Maven
- **Frontend:**
    - React.js
    - Tailwind CSS
    - Axios (for API communication)
- **Deployment:**
    - Docker
    - Vercel (Frontend)

## 2. System Requirements

**Hardware Requirements**

- **Processor:** 2 GHz Dual-Core (or equivalent) minimum
- **RAM:** 4 GB minimum, 8 GB recommended
- **Storage:** 10 GB of free space

**Software Requirements**

- **Operating System:** Windows, macOS, or a modern Linux distribution.
- **Java Development Kit (JDK):** Version 17 or higher.
- **Build Tool:** Apache Maven 3.6+
- **Database:** MySQL Server 8.x
- **Containerization:** Docker (for container-based deployment)
- **Web Browser:** A modern web browser like Google Chrome, Firefox, or Edge.
- **IDE (Optional):** IntelliJ IDEA or VS Code with Java extensions.

## 3. Installation & Setup Instructions

There are two ways to set up and run the application: using Docker (recommended for ease
of use) or building from the source code.

**Option 1: Install and Run using Docker**

This is the simplest way to get the application running.


1. **Prerequisites:** Ensure you have Docker installed and running on your system.
2. **Run the Container:** Execute the following command in your terminal. This command will pull the image from Docker Hub and start the application.

```
Docker command : docker run -d -p 8081:8081 -e DB_URL="your_database_url" -e
DB_USERNAME="your_database_username" -e
DB_PASSWORD="your_database_password" ujwalhiranwar/online-quiz-application:v
```
```
You have to add your own database credentials in this command.
```
3. **Access the Application:** The backend will be running and accessible at
    [http://localhost:8081.](http://localhost:8081.)
4. **Access the frontend by clicking below link and you are ready to use it.**

```
Frontend Application link : https://online-quizz-frontend.vercel.app/
```
**Option 2: Install and Run from Source (Git Clone)**

This method is for developers who want to run the application from the source code.

1. **Prerequisites:** Ensure you have JDK 17, Maven, and MySQL, Git installed.
2. **Clone the Repository:**
    Git clone command: git clone https://github.com/Ujwal-Hiranwar/online-quiz-backend.git
3. **Database Setup:**
    - Make sure your MySQL server is running.
    - Create the database and a dedicated user by executing the following SQL Queries CREATE DATABASE quiz_application;
4. **Configure the Backend:**
    - Navigate to
       Backend/application/src/main/resources/application.properties.
    - Update the spring.datasource.url, spring.datasource.username, and spring.datasource.password properties to match your MySQL setup.
    - Add URL “jdbc:mysql://localhost:3306/quiz_application” name and add your other mysql credentials like USERNAME and PASSWORD
5. **Run the Backend:**
    - Open a terminal in the Backend/application directory.
    - Run the following Maven command
       mvn spring-boot:run
    - The backend will start on port 8081.
6. **Run the Frontend:**
    - The frontend will be accessible at https://online-quizz-frontend.vercel.app/ and will connect to the backend.


## 4. Database Schema

The application uses a relational database schema to store all its data. The core entities are:

- **User:** Stores user account information, including credentials and roles.
- **Quiz:** Stores information about each quiz, such as title, topic, and difficulty.
- **Question:** Represents a single question within a quiz.
- **QuestionOption:** Stores the possible answers for a multiple-choice question.
- **QuizAttempt:** Records a user's attempt at a particular quiz.
- **UserAnswer:** Stores the specific option(s) a user selected for a question during an attempt.

## 5. User Guide

**For Regular Users**

1. **Registration:**
    - Navigate to the “Sign Up” page.
    - Fill in your details (username, email, password).
    - Click “Sign Up” to create your account.


2. **Login:**
    - Navigate to the “Login” page.
    - Enter your credentials and click “Login”.
3. **Taking a Quiz:**
    - From your dashboard, browse the list of available quizzes.
    - Click “Start Quiz” on the quiz you wish to take.
    - Answer each question. The timer will be visible if the quiz is timed.
    - Submit the quiz once you are finished.


4. **Viewing Results:**
    - After submitting a quiz, you will be redirected to the results page.
    - Here you can see your score, percentage, and a summary of correct/incorrect answers.

**For Administrators**

1. **Creating a Quiz:**
    - From the admin dashboard, navigate to the “Manage Quizzes” tab.
    - Click “Create New Quiz”.
    - Fill in the quiz details (title, topic, etc.) and save.


2. **Managing Questions:**
    - After creating a quiz, click “Manage Questions”.
    - On the question management page, click “Add Question”.
    - Fill in the question text, options, select the correct answer(s), and save.
    - You can edit or delete existing questions from this page.


3. **Leaderboard feature** : users can see how better they have performed In the leaderboard.


## 6. Architecture & Design

The backend follows a classic **layered architecture** , which promotes separation of concerns and makes the application easier to maintain and scale.

- **Controller Layer (/controller):** Exposes the REST API endpoints. It handles incoming HTTP requests, validates them, and delegates the business logic to the Service Layer.
- **Service Layer (/service):** Contains the core business logic of the application. It orchestrates calls to the Repository Layer and implements the main functionalities like creating quizzes, calculating scores, etc.
- **Repository Layer (/repository):** Responsible for all data access. It uses Spring Data JPA to interact with the database, providing a clean abstraction over database operations.
- **Entity Layer (/entity):** Defines the JPA entities that are mapped to the database tables.
- **DTO Layer (/dto):** Data Transfer Objects are used to transfer data between the client and the server, preventing direct exposure of JPA entities.
- **Security Layer (/security):** Handles authentication and authorization using Spring Security and JWT.

This design follows the **Model-View-Controller (MVC)** pattern, where Spring Boot acts as the Controller and Model, and the React frontend serves as the View.

## 7. Code Documentation

**Package Structure**

The backend source code is organized into the following packages under
com.quiz.application:

- config: Spring configuration classes (e.g., SecurityConfig, JpaConfig).
- controller: REST controllers for handling API requests.
- dto: Data Transfer Objects for API request/response bodies.
- entity: JPA entity classes representing database tables.
- exception: Custom exception classes and a global exception handler.
- repository: Spring Data JPA repository interfaces.
- security: JWT-based security components (JwtTokenProvider,
    UserDetailsService, etc.).
- service: Service classes containing the application's business logic.

**Key Classes**

- **QuizController.java** : Handles all HTTP requests related to quizzes (create, fetch,
    delete).


- **QuizService.java** : Implements the business logic for quiz management.
- **Quiz.java** : The JPA entity representing a quiz.
- **AuthController.java** : Manages user registration and login endpoints.
- **AuthService.java** : Contains the logic for user authentication and token generation.
- **JwtAuthenticationFilter.java** : A filter that intercepts incoming requests to
    validate the JWT token and set up the Spring Security context.

## 8. Security Implementation

Security is a critical component of this application.

- **Authentication:** The application uses **JWT (JSON Web Tokens)** for stateless authentication. When a user logs in, a signed JWT is generated and sent to the client. This token must be included in the Authorization header of all subsequent requests to protected endpoints.
- **Authorization:** Spring Security is used to enforce authorization rules. Endpoints are protected based on user roles (USER, ADMIN) using method-level security (@PreAuthorize) and request matchers in SecurityConfig.
- **Password Security:** User passwords are never stored in plain text. They are securely hashed using the **BCrypt hashing algorithm** before being saved to the database.
- **Data Validation:** Input from clients is validated at the DTO level using jakarta.validation annotations (e.g., @NotBlank, @Email) to prevent invalid or malicious data from entering the system.

## 9. Features Implemented

- **User Features:**
    - User Registration and Login
    - View All Active Quizzes
    - Search and Filter Quizzes
    - Take Quiz with Timer
    - View Instant Quiz Results
    - View Quiz History
    - View Quiz-Specific Leaderboards


- **Admin Features:**
    - Admin Dashboard with Application Statistics
    - Full CRUD (Create, Read, Update, Delete) for Quizzes
    - Full CRUD for Questions within a Quiz

## 10. Assumptions & Limitations

**Assumptions**

- It is assumed that the user has a stable internet connection.


- The application is designed for modern web browsers; compatibility with older browsers is not guaranteed.
- The user provides valid and correct information during registration.

**Limitations**

- The application does not currently support different question types beyond single and multiple choice (e.g., fill-in-the-blanks, true/false).
- The user interface is functional but basic; it is not designed for extensive customization.
- There is no functionality for users to reset their passwords via email.
- Not integration of AI (Artificial Intelligence) so that admin can add question based on topic and number of questions within few seconds.

**Potential Future Improvements**

- Implement password reset functionality.
- Add support for more question types.
- Add integration of AI to add questions automatically based on topic.
- Enhance the admin dashboard with more detailed analytics and charts.
- Allow users to create and share their own quizzes.
- Add pagination to quiz and leaderboard lists to improve performance with large datasets.
