// QuizTimer.js
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';

const QuizTimer = ({ startTime, duration }) => {
    const [remainingTime, setRemainingTime] = useState(0);

    useEffect(() => {
        let intervalId;

        const calculateRemainingTime = () => {
            const currentTime = new Date();
            const endTime = new Date(new Date(startTime).getTime() + parseInt(duration, 10) * 60 * 1000);
            const timeDiff = endTime - currentTime;

            if (timeDiff > 0) {
                const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                setRemainingTime({ hours, minutes, seconds });
            } else {
                setRemainingTime({ hours: 0, minutes: 0, seconds: 0 });
                clearInterval(intervalId);
            }
        };

        // Update remaining time initially
        calculateRemainingTime();

        // Update remaining time every second
        intervalId = setInterval(calculateRemainingTime, 1000);

        // Clear the interval when the component is unmounted
        return () => clearInterval(intervalId);
    }, [startTime, duration]);

    const formatTime = (time) => (time < 10 ? `0${time}` : time);

    return (
        <div style={{ position: 'fixed', top: 0, right: 0, padding: '10px', background: 'white' }}>
            <Card>
                <Card.Body>
                    <Card.Title>Time Remaining</Card.Title>
                    <Card.Text>
                        {formatTime(remainingTime.hours)}:{formatTime(remainingTime.minutes)}:{formatTime(remainingTime.seconds)}
                    </Card.Text>
                </Card.Body>
            </Card>
        </div>
    );
};

export default QuizTimer;
