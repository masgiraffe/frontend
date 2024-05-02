import React from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import Box from '@mui/material/Box';
import Typography from './modules/components/Typography';
import { email, required } from './modules/form/validation';
import RFTextField from './modules/form/RFTextField';
import FormButton from './modules/form/FormButton';
import FormFeedback from './modules/form/FormFeedback';
import withRoot from './modules/withRoot';

function ForgotPassword() {
  const [sent, setSent] = React.useState(false);
  const [requestStatus, setRequestStatus] = React.useState('idle');

  const validate = (values: { [key: string]: string }) => {
    const errors = required(['email'], values);

    if (!errors.email) {
      const emailError = email(values.email);
      if (emailError) {
        errors.email = emailError;
      }
    }

    return errors;
  };

  const handleSubmit = (values: Record<string, string>) => {
    setRequestStatus('loading');
    setSent(true);
    const emailJson = {
      email: values.email,
    };
    fetch('https://urepair.me/forgot-password', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(emailJson),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        setRequestStatus('success');
        return response.json();
      })
      .then()
      .catch((error) => {
        // Handle the error here.
        setRequestStatus('failure');
        console.error('There was a problem with the fetch operation: ', error);
      })
      .finally(() => {
        // Reset the 'sent' state after the request is completed (whether success or failure)
        setSent(false);
      });
  };

  return (
    <>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Forgot your password?
      </Typography>
      <Typography variant="body2" align="center">
        Enter your email address below and we&apos;ll send you a link to reset your password.
      </Typography>
      <Form onSubmit={handleSubmit} validate={validate}>
        {({ handleSubmit: handleSubmit2, submitting }) => (
          <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
            <Field
              autoFocus
              autoComplete="email"
              component={RFTextField}
              disabled={submitting || sent}
              fullWidth
              label="Email"
              margin="normal"
              name="email"
              required
              size="large"
            />
            <FormFeedback />
            <FormSpy subscription={{ submitError: true }}>
              {({ submitError }) => (submitError ? (
                <FormFeedback error sx={{ mt: 2 }}>
                  {submitError}
                </FormFeedback>
              ) : null)}
            </FormSpy>
            <FormButton
              sx={{ mt: 3, mb: 2 }}
              disabled={submitting || sent}
              size="large"
              color="secondary"
              fullWidth
            >
              {requestStatus === 'loading' && 'In progress…'}
              {requestStatus === 'success' && 'Success!'}
              {requestStatus === 'failure' && 'Failure, contact support!'}
              {requestStatus === 'idle' && 'Send reset link'}
            </FormButton>
          </Box>
        )}
      </Form>
    </>
  );
}

export default withRoot(ForgotPassword);
