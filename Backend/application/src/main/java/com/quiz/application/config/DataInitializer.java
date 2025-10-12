package com.quiz.application.config;

import com.quiz.application.entity.*;
import com.quiz.application.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!test")
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private QuizRepository quizRepository;
    
    @Autowired
    private QuestionRepository questionRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Check if admin exists
        if (!userRepository.existsByUsername("admin")) {
            // Create admin user
            User admin = User.builder()
                    .username("admin")
                    .email("admin@quiz.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .role(User.Role.ADMIN)
                    .active(true)
                    .build();
            userRepository.save(admin);
            
            // Create a test user
            User testUser = User.builder()
                    .username("testuser")
                    .email("test@quiz.com")
                    .password(passwordEncoder.encode("test123"))
                    .firstName("Test")
                    .lastName("User")
                    .role(User.Role.USER)
                    .active(true)
                    .build();
            userRepository.save(testUser);
            
            // Create sample quiz
            Quiz quiz = Quiz.builder()
                    .title("Java Basics Quiz")
                    .description("Test your knowledge of Java fundamentals")
                    .topic("Java")
                    .difficultyLevel(Quiz.DifficultyLevel.MEDIUM)
                    .timeLimitMinutes(30)
                    .passingScore(70)
                    .active(true)
                    .createdBy(admin)
                    .build();
            quiz = quizRepository.save(quiz);
            
            // Create sample question
            Question question1 = Question.builder()
                    .questionText("What is the default value of a boolean variable in Java?")
                    .questionType(Question.QuestionType.SINGLE_CHOICE)
                    .points(10)
                    .questionOrder(1)
                    .explanation("The default value of a boolean variable is false")
                    .quiz(quiz)
                    .build();
            
            QuestionOption opt1 = QuestionOption.builder()
                    .optionText("true")
                    .isCorrect(false)
                    .optionOrder(1)
                    .build();
            
            QuestionOption opt2 = QuestionOption.builder()
                    .optionText("false")
                    .isCorrect(true)
                    .optionOrder(2)
                    .build();
            
            QuestionOption opt3 = QuestionOption.builder()
                    .optionText("0")
                    .isCorrect(false)
                    .optionOrder(3)
                    .build();
            
            QuestionOption opt4 = QuestionOption.builder()
                    .optionText("null")
                    .isCorrect(false)
                    .optionOrder(4)
                    .build();
            
            question1.addOption(opt1);
            question1.addOption(opt2);
            question1.addOption(opt3);
            question1.addOption(opt4);
            
            questionRepository.save(question1);
            
            System.out.println("Sample data initialized successfully!");
            System.out.println("Admin credentials - Username: admin, Password: admin123");
            System.out.println("Test user credentials - Username: testuser, Password: test123");
        }
    }
}
