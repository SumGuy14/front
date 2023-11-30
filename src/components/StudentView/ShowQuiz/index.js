import { useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import QuizSubmit from '../SuccessQuizSubmit';
import QuizTimer from '../QuizTimer/index';

function ShowQuiz(props) {
    const { quizData, student_id } = props;
    const { quizInfo, subject } = quizData;
    // console.log(quizInfo, '= quiz info');
    // console.log(subject, '=subject');


    const [finalSubmission, setFinalSubmission] = useState(null);
    const { course_id, course_name, quizzes_info } = subject;
    const { start_date, start_time, duration } = quizzes_info[0];
    const { questions } = quizInfo;
    // console.log(questions, '=questions');

    const handleAnswerChange = (questionIndex, optionIndex) => {
        const questionName = questions[questionIndex]?.question;
        const answerChosen = questions[questionIndex]?.options[optionIndex];
        const type = questions[questionIndex]?.type;
        console.log(type, '= type of question')
        setAnswers((prevAnswers) => {
            // console.log(prevAnswers, '= previous answers array')
            const updatedAnswers = [...prevAnswers];

            // Check if the question is already present in updatedAnswers
            const existingAnswerIndex = updatedAnswers.findIndex((ans) => ans.question === questionName);

            if (existingAnswerIndex !== -1) {
                // If the question is present, update the chosen_option
                if (type == 'multipleChoice') {
                    updatedAnswers[existingAnswerIndex].chosen_option = answerChosen;
                }
                // multiple answer type
                else {
                    // i need to first check if the selected item by user already is in the existing answer
                    if (!updatedAnswers[existingAnswerIndex].chosen_option.includes(answerChosen)) {
                        updatedAnswers[existingAnswerIndex].chosen_option.push(answerChosen)
                    }
                }
            } else {
                // If the question is not present, add a new answer

                // if type of question is multiple answer, then i use array for answer chosen
                if (type == 'multipleChoice') {
                    updatedAnswers.push({
                        question: questionName,
                        chosen_option: answerChosen,
                    });
                } else {
                    updatedAnswers.push({
                        question: questionName,
                        chosen_option: [answerChosen],
                    })
                }

            }

            return updatedAnswers;
        });
    };

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();

            const requestBody = { answers: answers.flat() };
            console.log(requestBody, '= final request to send');
            // make call to backend for sending q/a to api
            const endpoint = `http://127.0.0.1:8000/quiz/student/${course_id}/${student_id}/answers/`

            const res = await axios.post(endpoint, requestBody);

            console.log(res.data);
            setFinalSubmission({ data: res.data, flag: true })
        } catch (err) {
            setFinalSubmission({ flag: false, data: err });
            console.log(err);
        }


    };

    const [answers, setAnswers] = useState([]);

    const renderInput = (questionIndex, optionIndex) => {
        const inputType = questions[questionIndex]?.type === 'multipleChoice' ? 'radio' : 'checkbox';

        return (
            <Form.Check
                key={optionIndex}
                type={inputType}
                label={questions[questionIndex]?.options[optionIndex]}
                onChange={() => handleAnswerChange(questionIndex, optionIndex)}
                name={inputType === 'radio' ? `question-${questionIndex}` : undefined}
                className="mb-2" // Add margin between options
            />
        );
    };

    // means user has submitted the responses
    if (finalSubmission?.flag) {
        // render another component that shows the student his score and average etc.
        return (
            <QuizSubmit finalSubmission={finalSubmission} />
        )
    }

    return (
        <>
            <h4 className="mt-4 mb-4">Quiz for {course_name}</h4>
            <QuizTimer startTime={`${start_date} ${start_time}`} duration={duration} />
            <Container>
                {(finalSubmission?.flag == false) ? <div className='alert alert-danger'>
                    Error Occured while trying to submit your responses
                </div> : null}
                <Form onSubmit={handleSubmit}>
                    {questions.map((question, questionIndex) => (
                        <div key={questionIndex}>
                            <h4>{question.question}</h4>
                            <Form.Group as={Row}>
                                {question.options.map((option, optionIndex) => (
                                    <Col key={optionIndex} xs={12} md={6}>
                                        {renderInput(questionIndex, optionIndex)}
                                    </Col>
                                ))}
                            </Form.Group>
                        </div>
                    ))}
                    <Button variant="primary" type="submit">
                        Submit
                    </Button>
                </Form>
            </Container>
        </>
    );

}

export default ShowQuiz;