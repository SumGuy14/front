// import { useState } from "react";
// import { Card, Row, Col, NavLink, Button } from "react-bootstrap";
// import CreateQuiz from "./CreateQuiz";
// import ManageQuiz from "./ManageQuiz";
// import axios from "axios";

// function TeacherView(props) {

//     const [quiz, setQuiz] = useState(null)

//     async function handleDelete(data) {
//         console.log('here in the delete');
//         console.log('here data', data);
//         const { courses_info, teacher_info } = data;
//         const { course_id } = courses_info[0];

//         const { student_id } = teacher_info;
//         console.log(student_id)
//         const end_point = `http://127.0.0.1:8000/quiz/delete/${course_id}/`

//         try {
//             const response = await axios.delete(end_point,
//                 {
//                     data: {
//                         course_id,
//                         teacher_id: student_id
//                     }
//                 })
//             console.log(response);

//         } catch (err) {
//             console.log(err);
//         }
//     }

//     function handleCourseClickTeacher(clickedCourse) {
//         console.log(clickedCourse)
//     }

//     function handleQuiz(clickedCourse) {
//         const isQuiz = (clickedCourse.quizzes_info.length > 0) ? true : false;

//         if (isQuiz) {
//             // Edit Quiz Component needs to be rendered
//             setQuiz({
//                 course: clickedCourse,
//                 is_edit: true
//             })
//         }
//         else {
//             //create quiz component will be rendered
//             setQuiz({
//                 course: clickedCourse,
//                 is_edit: false
//             })
//         }
//     }

//     const { data } = props;
//     console.log(data, '=from props')
//     const { courses_info } = data;

//     console.log(courses_info, '= courses info');

//     if (quiz) {

//         if (!quiz.is_edit) {
//             return (<CreateQuiz data={data} />)
//         }
//         if (quiz.is_edit) {
//             // is is_edit is true
//             return (
//                 <>
//                     <ManageQuiz data={data} quiz={quiz}/>
//                 </>
//             )
//         }
//     }

//     return (
//         <Row className="mt-3">
//             {courses_info.map((eachCourse, index) => (
//                 <Col key={index} md={4} className="mb-3">
//                     <Card onClick={() => handleCourseClickTeacher(eachCourse)}>
//                         <Card.Body>
//                             <Card.Title>{eachCourse.course_name}</Card.Title>
//                             <Card.Subtitle className="mb-2 text-muted">
//                                 Course Code: {eachCourse.course_code}
//                             </Card.Subtitle>
//                             <Card.Subtitle>
//                                 <button className="btn btn-outline-secondary" onClick={() => handleQuiz(eachCourse)}>
//                                     {(eachCourse.quizzes_info.length > 0) ? 'Manage Quiz' : 'Create Quiz'}
//                                 </button>
//                                 {(eachCourse.quizzes_info.length > 0) ? <Button variant="secondary" onClick={() => handleDelete(data)}>Delete Quiz</Button>
//                                     : null}
//                             </Card.Subtitle>
//                         </Card.Body>
//                     </Card>
//                 </Col>
//             ))}
//         </Row>
//     );
// }

// export default TeacherView;


// // TeacherView.js

import React, { useState } from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import CreateQuiz from './CreateQuiz';
import ManageQuiz from './ManageQuiz';
import axios from 'axios';

function TeacherView(props) {
  const [quiz, setQuiz] = useState(null);

  const { data, handleData } = props;
  const { courses_info } = data;

  async function handleDelete(data) {
    const { courses_info, teacher_info } = data;
    const { course_id } = courses_info[0];
    const { teacher_id } = teacher_info;

    const end_point = `http://127.0.0.1:8000/quiz/delete/${course_id}/${teacher_id}`;

    try {
      const response = await axios.delete(end_point, {
        data: {
          course_id,
          teacher_id
        },
      });
      const result = response.data;
      delete result['message'];

      // changing the original data so that it renders with updated dataset
      handleData(data);

      console.log(data,' = after update');

    } catch (err) {
      console.error(err);
    }
  }

  function handleCourseClickTeacher(clickedCourse) {
    console.log(clickedCourse);
  }

  function handleQuiz(clickedCourse) {
    const isQuiz = clickedCourse.quizzes_info.length > 0;

    if (isQuiz) {
      // Edit Quiz Component needs to be rendered
      setQuiz({
        course: clickedCourse,
        is_edit: true,
      });
    } else {
      // Create quiz component will be rendered
      setQuiz({
        course: clickedCourse,
        is_edit: false,
      });
    }
  }

  if (quiz) {
    if (!quiz.is_edit) {
      return <CreateQuiz data={data} quiz={quiz}/>;
    }
    if (quiz.is_edit) {
      return <ManageQuiz data={data} quiz={quiz} />;
    }
  }

  return (
    <Row className="mt-3">
      {courses_info.map((eachCourse, index) => (
        <Col key={index} md={4} className="mb-3">
          <Card onClick={() => handleCourseClickTeacher(eachCourse)} style={{ margin: '15px' }}>
            <Card.Body>
              <Card.Title>{eachCourse.course_name}</Card.Title>
              <Card.Subtitle className="mb-2 text-muted">
                Course Code: {eachCourse.course_code}
              </Card.Subtitle>
              <Card.Subtitle>
                <Button
                  variant="outline-secondary"
                  onClick={() => handleQuiz(eachCourse)}
                >
                  {eachCourse.quizzes_info.length > 0
                    ? 'Manage Quiz'
                    : 'Create Quiz'}
                </Button>
                {eachCourse.quizzes_info.length > 0 ? (
                  <Button
                    variant="secondary"
                    onClick={() => handleDelete(data)}
                  >
                    Delete Quiz
                  </Button>
                ) : null}
              </Card.Subtitle>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default TeacherView;
