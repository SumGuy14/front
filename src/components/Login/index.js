import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import TeacherView from '../TeacherView';
import StudentView from '../StudentView';
import axios from 'axios';

const LoginComponent = () => {
    const [formData, setFormData] = useState({
        email_id: '',
        password: '',
        is_teacher: false,
    });

    const [data, setData] = useState(null)
    const [err, setError] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async () => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/quiz/login/',
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log(response.data, '=info from the login component')
            setData(response.data);
        } catch (error) {
            setError(error);

            setTimeout(() => {
                setError(null);
            }, 2000)
            console.error('Login failed', error);
        }
    };

    if (formData.is_teacher && data && !err) {
        return <TeacherView data={data} handleData={setData}/>
    }
    if (!formData.is_teacher && data && !err) {
        return <StudentView data={data} />
    }

    return (
        <Container>
            <Form className="mt-5">
                <Form.Group controlId="formEmail">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email_id"
                        value={formData.email_id}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="formPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                    />
                </Form.Group>

                <Form.Group controlId="formIsTeacher" className="mb-3">
                    <Form.Check
                        type="checkbox"
                        label="I am a teacher"
                        name="is_teacher"
                        checked={formData.is_teacher}
                        onChange={(e) =>
                            setFormData({ ...formData, is_teacher: e.target.checked })
                        }
                    />
                </Form.Group>

                <Button variant="primary" onClick={handleLogin}>
                    Login
                </Button>

                <div className="mt-3">
                    {err ? <div className='alert alert-danger'>{err?.response?.data?.error}</div> : null}
                </div>
            </Form>
        </Container>
    );
};

export default LoginComponent;
