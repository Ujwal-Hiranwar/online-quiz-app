package com.quiz.application.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(callSuper = true, exclude = {"quiz", "options"})
@ToString(exclude = {"quiz", "options"})
public class Question extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String questionText;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private QuestionType questionType = QuestionType.SINGLE_CHOICE;
    
    @Column(nullable = false)
    private Integer points = 1;
    
    @Column(name = "question_order")
    private Integer questionOrder;
    
    @Column(columnDefinition = "TEXT")
    private String explanation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("optionOrder ASC")
    private List<QuestionOption> options = new ArrayList<>();
    
    public enum QuestionType {
        SINGLE_CHOICE, MULTIPLE_CHOICE
    }
    
    public void addOption(QuestionOption option) {
        options.add(option);
        option.setQuestion(this);
    }
    
    public void removeOption(QuestionOption option) {
        options.remove(option);
        option.setQuestion(null);
    }
}
