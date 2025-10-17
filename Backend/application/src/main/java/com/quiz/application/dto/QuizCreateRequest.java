package com.quiz.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizCreateRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    @NotBlank(message = "Topic is required")
    private String topic;
    
    private String difficultyLevel = "MEDIUM";
    
    private Integer timeLimitMinutes;
    
    private Integer passingScore;

    private List<QuestionInQuizCreateRequest> questions;
}
