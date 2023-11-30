import React from 'react';
import { Container, Card } from 'react-bootstrap';

function QuizSubmit(props) {
    const { finalSubmission } = props;
    console.log(finalSubmission, '=final submission');
    const { data } = finalSubmission;

    const { percentage, final_score, correct_answers, total_questions } = data;

    return (
        <Container className="mt-5">
            <Card>
                <Card.Body>
                    <Card.Title className="mb-4">Thank you for taking the quiz!</Card.Title>
                    <Card.Text>
                        <p>Here are your stats:</p>
                        <p>Percentage: {percentage}%</p>
                        <p>Final Score: {final_score}/{total_questions}</p>
                        <p>Correct Answers: {correct_answers}</p>
                        <p>Total Questions: {total_questions}</p>
                    </Card.Text>
                </Card.Body>
            </Card>
        </Container>
    );
}

export default QuizSubmit;
