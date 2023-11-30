import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import axios from 'axios';

const ManageQuiz = (props) => {
    const { data, quiz } = props;
    const { course } = quiz;
    const { course_code, course_id, course_name, quizzes_info } = course;
    const { teacher_info, courses_info } = data;

    const { teacher_id } = teacher_info;

    const { start_time, start_date, duration } = quizzes_info[0];
    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState(null);
    const [isUpdated, setIsUpdated] = useState(false);
    const [startDate, setStartDate] = useState(start_date);
    const [startTime, setStartTime] = useState(start_time);
    const [dur, setDuration] = useState(duration);


    useEffect(() => {
        // Make API call to get quiz details and set the questions state
        const fetchQuizDetails = async () => {
            try {
                const end_point = `http://localhost:8000/quiz/student/${course_id}/questions/`;

                const response = await axios.get(end_point);
                console.log(response.data, '= response');
                const { questions } = response.data;
                console.log(questions, '= questions');
                setQuestions(questions);
            } catch (error) {
                setError(error);
            }
        };
        fetchQuizDetails();
    }, []);


    const renderCorrectAnswerField = (questionIndex, numberOfChoices, questionType) => {
        if (questionType === 'multipleChoice') {
            return (
                <Form.Control as="select" name={`correctAnswer${questionIndex + 1}`} required>
                    {[...Array(Number(numberOfChoices))].map((_, index) => (
                        <option key={index} value={`option${questionIndex + 1}_${index + 1}`}>
                            Option {index + 1}
                        </option>
                    ))}
                </Form.Control>
            );
        } else {
            return (
                <>
                    {[...Array(Number(numberOfChoices))].map((_, index) => (
                        <Form.Check
                            key={index}
                            type="checkbox"
                            label={`Option ${index + 1}`}
                            name={`correctAnswer${questionIndex + 1}`}
                            value={`option${questionIndex + 1}_${index + 1}`}
                        />
                    ))}
                </>
            );
        }
        return null;
    };

    const renderQuestionForm = () => {
        const questionCards = [];

        for (let i = 0; i < questions.length; i++) {
            const numberOfChoices = questions[i]?.options.length || 2;
            const questionType = questions[i]?.type || 'multipleChoice';

            questionCards.push(
                <Card key={i} className="mb-3">
                    <Card.Body>
                        <h5>Question {i + 1}</h5>
                        <Form.Group controlId={`questionType${i + 1}`}>
                            <Form.Label>Type of Question:</Form.Label>
                            <Form.Control
                                as="select"
                                name={`questionType${i + 1}`}
                                onChange={(e) => handleQuestionTypeChange(i, e.target.value)}
                                defaultValue={questionType}
                                required
                            >
                                <option value="multipleChoice">Multiple Choice</option>
                                <option value="multipleAnswer">Multiple Answer</option>
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId={`numberOfChoices${i + 1}`}>
                            <Form.Label>Number of Choices:</Form.Label>
                            <Form.Control
                                type="number"
                                min="2"
                                max="4"
                                defaultValue={numberOfChoices}
                                name={`numberOfChoices${i + 1}`}
                                onChange={(e) => handleNumberOfChoicesChange(i, e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId={`question${i + 1}`}>
                            <Form.Label>Question:</Form.Label>
                            <Form.Control type="text" defaultValue={questions[i]?.question} name={`question`} required />
                        </Form.Group>
                        {[...Array(Number(numberOfChoices))].map((_, index) => (
                            <Form.Group key={index} controlId={`option${i + 1}_${index + 1}`}>
                                <Form.Label>Option {index + 1}:</Form.Label>
                                <Form.Control type="text" defaultValue={questions[i]?.options[index]} name={`option${i + 1}_${index + 1}`} required />
                            </Form.Group>
                        ))}
                        <Form.Group controlId={`correctAnswer${i + 1}`}>
                            <Form.Label>Correct Answer:</Form.Label>
                            {renderCorrectAnswerField(i, numberOfChoices, questionType)}
                        </Form.Group>
                    </Card.Body>
                </Card>
            );
        }

        return questionCards;
    };

    const handleQuestionTypeChange = (questionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            type: value,
        };
        setQuestions(updatedQuestions);
    };

    const handleNumberOfChoicesChange = (questionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex] = {
            ...updatedQuestions[questionIndex],
            numberOfChoices: value,
        };
        setQuestions(updatedQuestions);
    };

    const handleQuizSubmit = async (e) => {
        e.preventDefault();

        const updatedQuizContent = [];
        for (let i = 0; i < questions.length; i++) {
            const controlId = `questionType${i + 1}`;
            const type = e.target[controlId]?.value || 'multipleChoice';
            const numberOfChoices = e.target[`numberOfChoices${i + 1}`]?.value || 2;
            const question = e.target[`question${i + 1}`]?.value || '';
            const options = Array.from({ length: numberOfChoices }, (_, j) => e.target[`option${i + 1}_${j + 1}`]?.value || '');
            let correctAnswer = e.target[`correctAnswer${i + 1}`]?.value || '';
            if (type === 'multipleChoice') {
                correctAnswer = correctAnswer.split("_")[1];
                const answer = options[Number(correctAnswer) - 1];

                updatedQuizContent.push({
                    question,
                    options,
                    correct_answer: answer,
                    type,
                });
            }
            else {
                correctAnswer = correctAnswer.split(',').map(Number);
                const answer = [];
                for (let j = 0; j < correctAnswer.length; j++) {
                    const eachAnswer = options[j];
                    answer.push(eachAnswer);
                }

                updatedQuizContent.push({
                    question,
                    options,
                    correct_answer: answer,
                    type,
                });
            }
        }

        const updatedQuizData = {
            teacher_id,
            course_id,
            quiz_content: updatedQuizContent,
            start_time,
            start_date,
            dur,
        };

        try {
            const response = await axios.put(
                `http://127.0.0.1:8000/quiz/update/${course_id}/${teacher_id}/`,
                updatedQuizData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(response.data, '=success call');
            setIsUpdated(true);

            setTimeout(() => {
                setIsUpdated(false);
            }, 2000);

        } catch (err) {
            setError(err);
            console.log(err, '=err');
        }
    };


    if (questions.length == 0) {
        return (<h4>Loading..</h4>)
    }

    if (error) {
        return (
            <div className='alert alert-danger'>
                Looks like you faced an error while trying to edit the quiz. Please try again at a later time.
            </div>
        );
    }


    return (
        <Container className="mt-5 p-4" style={{ background: '#FFF7F0', borderRadius: '10px' }}>
            <h2 className="mb-4">Update Quiz</h2>

            {isUpdated ? (<div className="alert alert-success">{`Quiz updated Successfully`}</div>) : null}

            <Form onSubmit={handleQuizSubmit}>
                <div className="row">
                    <div className='col-md-6'>
                        <Form.Group controlId="startDate">
                            <Form.Label>Start Date:</Form.Label>
                            <Form.Control type="date" defaultValue={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="startTime">
                            <Form.Label>Start Time:</Form.Label>
                            <Form.Control type="time" defaultValue={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                        </Form.Group>
                        <Form.Group controlId="duration">
                            <Form.Label>Duration (in minutes):</Form.Label>
                            <Form.Control type="number" min="1" defaultValue={dur} onChange={(e) => setDuration(e.target.value)} required />
                        </Form.Group>
                    </div>
                    <div className='col-md-6'>
                        {renderQuestionForm()}
                        <Button variant="primary" type="submit">
                            Update Quiz
                        </Button>
                    </div>
                </div>

            </Form>
        </Container>
    );
};

export default ManageQuiz;