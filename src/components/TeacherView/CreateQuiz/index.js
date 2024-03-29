// CreateQuiz.js

import React, { useState } from 'react';
import { Form, Button, Container, Card } from 'react-bootstrap';
import axios from 'axios';

// helper function to convert the time to AM-PM to send backend 
function convertTo12HourFormat(time24) {
    // Split the input time string into hours and minutes
    var [hours, minutes] = time24.split(':');

    // Convert hours to a 12-hour format
    var hours12 = (hours % 12) || 12;

    // Determine whether it's AM or PM
    var meridiem = hours < 12 ? 'AM' : 'PM';

    // Create the 12-hour format time string
    var time12 = hours12 + ':' + minutes + ' ' + meridiem;

    return time12;
}

const CreateQuiz = (props) => {

    const { data } = props;

    console.log(data, '=from props');

    const { teacher_info, courses_info } = data;
    const { student_id } = teacher_info; // this will give me the teacher_id to send backend
    const { course_id } = courses_info[0]; // this will give me the course id to send backend

    console.log(course_id, '=course')

    const [finalData, setFinalData] = useState(null);
    const [error, setError] = useState(null)

    const [startTime, setStartTime] = useState('');
    const [startDate, setStartDate] = useState('');
    const [duration, setDuration] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState(10);
    const [questions, setQuestions] = useState([]);


    const handleQuizSubmit = async (e) => {
        e.preventDefault()

        // this is where all these will go into , q&a, options
        const quiz_content = [];

        for (let index = 0; index < numberOfQuestions; index++) {
            const controlId = `questionType${index + 1}`;
            const type = e.target[controlId]?.value || 'multipleChoice';
            const numberOfChoices = e.target[`numberOfChoices${index + 1}`]?.value || 2;
            const question = e.target[`question${index + 1}`]?.value || '';
            const options = Array.from({ length: numberOfChoices }, (_, i) => e.target[`option${index + 1}_${i + 1}`]?.value || '');
            let correctAnswer = e.target[`correctAnswer${index + 1}`]?.value || '';

            console.log(correctAnswer);

            if (type == 'multipleAnswer') {
                correctAnswer = correctAnswer.split(',').map(Number); // this will give array of indices where i need to locate the right answer
                const answer = [];
                for (let i = 0; i < correctAnswer.length; i++) {
                    const eachAnswer = options[i];
                    answer.push(eachAnswer);
                }

                console.log(answer, '= answers to tht question')

                quiz_content.push({
                    question,
                    options,
                    correct_answer: answer
                })
            }
            if (type == 'multipleChoice') {
                correctAnswer = correctAnswer.split("_")[1]; // this will give the indice where correct answer is located
                const answer = options[Number(correctAnswer) - 1]

                console.log([answer], '=answer to the question')

                quiz_content.push({
                    question,
                    options,
                    correct_answer: answer
                })
            }

        }

        // the request body for the backend
        const quizData = {
            teacher_id: student_id,
            course_id: course_id,
            quiz_content,
            start_time: convertTo12HourFormat(startTime),
            start_date: startDate,
            duration: `${duration}`
        };

        console.log(quizData)

        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/quiz/teacher/create/',
                quizData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(response.data, '=success call');
            setFinalData(response.data.message)
        } catch (err) {
            setError(err)
            console.log(err, '=err');
        }
    }


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
        } else if (questionType === 'multipleAnswer') {
            return <Form.Control type="text" placeholder={`Enter correct answer`} name={`correctAnswer${questionIndex + 1}`} required />;
        }

        return null;
    };

    const renderQuestionForm = () => {
        const questionCards = [];

        for (let i = 0; i < numberOfQuestions; i++) {
            const numberOfChoices = questions[i]?.numberOfChoices || 2;
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
                            <Form.Control type="text" placeholder="Enter the question" name={`question`} required />
                        </Form.Group>
                        {[...Array(Number(numberOfChoices))].map((_, index) => (
                            <Form.Group key={index} controlId={`option${i + 1}_${index + 1}`}>
                                <Form.Label>Option {index + 1}:</Form.Label>
                                <Form.Control type="text" placeholder={`Enter option ${index + 1}`} name={`option${i + 1}_${index + 1}`} required />
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

    if (error) {
        return (<div className='alert alert-danger'>
            Looks like you faced an error while trying to create the quiz. Please try again at a later time.
        </div>)
    }

    if (finalData) {
        return (<h4>
            {finalData}
        </h4>)
    }

    return (
        <Container>
            <Form onSubmit={handleQuizSubmit}>

                <Form.Group controlId="startDate">
                    <Form.Label>Start Date:</Form.Label>
                    <Form.Control type="date" onChange={(e) => setStartDate(e.target.value)} required />
                </Form.Group>

                <Form.Group controlId="startTime">
                    <Form.Label>Start Time:</Form.Label>
                    <Form.Control type="time" onChange={(e) => setStartTime(e.target.value)} required />
                </Form.Group>

                <Form.Group controlId="duration">
                    <Form.Label>Duration (in minutes):</Form.Label>
                    <Form.Control type="number" min="1" onChange={(e) => setDuration(e.target.value)} required />
                </Form.Group>

                <Form.Group controlId="numberOfQuestions">
                    <Form.Label>Number of Questions:</Form.Label>
                    <Form.Control type="number" onChange={(e) => setNumberOfQuestions(e.target.value)} required />
                </Form.Group>

                {renderQuestionForm()}

                <Button variant="primary" type="submit">
                    Create Quiz
                </Button>
            </Form>
        </Container>
    );
};

export default CreateQuiz;
