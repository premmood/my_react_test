import React, { useEffect, useState } from 'react';
import { Message, Loader, Button, Segment, Form, Input } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper';
import { useLocation, useNavigate } from 'react-router-dom';

const AdminEmailVerification = () => {
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState('');
    const [email, setEmail] = useState('');
    const [passwordValid, setPasswordValid] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [backendError, setBackendError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false); // New state variable


    useEffect(() => {
        setTimeout(() => {
            const verifyToken = async () => {
                const queryParams = new URLSearchParams(location.search);
                const token = queryParams.get('token');

                if (!token) {
                    setMessage('Invalid or missing token.');
                    setIsError(true);
                    setLoading(false);
                    return;
                }

                try {
                    const apiResponse = await apiWrapper.verifyAdminEmail(token);
                    setMessage('Email verification successful. Please set your password.');
                    setEmail(apiResponse.email);
                } catch (error) {
                    setMessage('Verification failed. Please try again or contact support.');
                    setIsError(true);
                } finally {
                    setLoading(false);
                }
            };

            verifyToken();
        }, 1500); // Delay the verification for 1.5 seconds
    }, [location]);


    const validatePassword = (password) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        const isValid = regex.test(password);
        setPasswordValid(isValid);
        return isValid;
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);

        if (!validatePassword(newPassword)) {
            setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character. It should be at least 8 characters long.');
        } else {
            setPasswordError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirmPassword = e.target.value;
        setConfirmPassword(newConfirmPassword);

        if (password !== newConfirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
        } else {
            setConfirmPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // // console.log('handleSubmit called');

        if (!passwordValid || password !== confirmPassword) {
            setIsError(true);
            setBackendError('');
            setIsSubmitting(false); // Re-enable the button if validation fails
            //// console.log('Password validation failed');
            return;
        }

        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');

        if (!token) {
            setIsError(true);
            setBackendError('Invalid or missing token.');
            return;
        }

        try {
            await apiWrapper.setAdminPassword({ token, password });
            setIsError(false);
            setTimeout(() => {
                setMessage('Password set successfully. Redirecting to sign-in...');
                setIsSubmitting(false); // Re-enable the button only after success message
                setTimeout(() => navigate('/signin'), 1000);
            }, 1500);
        } catch (error) {
            setBackendError('Failed to set password due to a server issue. Please try again.');
            setIsError(true);
            setIsSubmitting(false); // Re-enable the button in case of an error
        }
    };





    if (loading) {
        return <Loader active inline='centered'>Verifying...</Loader>;
    }

    const isButtonEnabled = passwordValid && password === confirmPassword;

    // Custom focus style
    const customFocusStyle = {
        backgroundColor: '#e8f0fe', // Light blue background
        borderColor: '#2185d0', // Semantic UI primary color
        outline: 'none',
        boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)',
    };



    return (
        <Segment basic textAlign='center'>
            {loading ? (
                <Loader active inline='centered'>Verifying...</Loader>
            ) : (
                <>
                    {!isError && !backendError && (
                        <>
                            <Message
                                success
                                header='Success'
                                content={message}
                            />
                            <Form onSubmit={handleSubmit}>
                                <input type="hidden" value={email} />

                                <Form.Field error={!!passwordError}>
                                    <label>New Password</label>
                                    <Input
                                        autoComplete="new-password"
                                        type="password"
                                        value={password}
                                        onChange={handlePasswordChange}
                                        icon={passwordValid ? 'check' : 'x'}
                                        iconPosition='left'
                                        style={passwordError ? undefined : { ...customFocusStyle }}
                                    />
                                    {passwordError && <Message error content={passwordError} />}
                                </Form.Field>

                                <Form.Field error={!!confirmPasswordError}>
                                    <label>Confirm Password</label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={handleConfirmPasswordChange}
                                        icon={confirmPassword && password === confirmPassword ? 'check' : 'x'}
                                        iconPosition='left'
                                        style={confirmPasswordError ? undefined : { ...customFocusStyle }}
                                    />
                                    {confirmPasswordError && <Message error content={confirmPasswordError} />}
                                </Form.Field>

                                <Button type='submit' primary disabled={!isButtonEnabled || isSubmitting}>
                                    {isSubmitting ? 'Setting Password...' : 'Set Password'}
                                </Button>
                            </Form>
                        </>
                    )}

                    {!isError && !backendError && !message && (
                        <Button size='big' primary onClick={() => navigate('/signin')}>
                            Sign In to didgUgo
                        </Button>
                    )}
                </>
            )}
        </Segment>
    );
};

export default AdminEmailVerification;