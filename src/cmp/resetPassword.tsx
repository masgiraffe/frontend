import React, { useState, useEffect } from 'react';
import { Field, Form, FormSpy } from 'react-final-form';
import Box from '@mui/material/Box';
import Typography from './modules/components/Typography';
import RFTextField from './modules/form/RFTextField';
import FormButton from './modules/form/FormButton';
import FormFeedback from './modules/form/FormFeedback';
import withRoot from './modules/withRoot';

interface ResetPasswordProps {
  token: string;
}

function ResetPassword({ token }: ResetPasswordProps) {
  const [requestStatus, setRequestStatus] = useState('idle');

  const handleSubmit = (values: Record<string, string>) => {
    setRequestStatus('loading');
    fetch('https://urepair.me/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword: values.password,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to reset password');
        }
        return response.json();
      })
      .then(() => {
        setRequestStatus('success');
      })
      .catch((err) => {
        setRequestStatus('failure');
        console.error('There was a problem with the fetch operation: ', err);
      });
  };

  // ...

  useEffect(() => {
    if (requestStatus === 'success' || requestStatus === 'failure') {
      // Clear token query from URL after 3 seconds
      const timeoutId = setTimeout(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, document.title, url.toString());
        // Reload the page
        window.location.reload();
      }, 3000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    return () => {};
  }, [requestStatus]);

  return (
    <>
      <Typography variant="h3" gutterBottom marked="center" align="center">
        Reset your password
      </Typography>
      <Form onSubmit={handleSubmit}>
        {({ handleSubmit: handleSubmit2, submitting }) => (
          <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
            <Field
              autoFocus
              component={RFTextField}
              disabled={submitting || requestStatus === 'loading'}
              fullWidth
              label="New password"
              margin="normal"
              name="password"
              required
              size="large"
              type="password"
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
              disabled={submitting || requestStatus === 'loading'}
              size="large"
              color="secondary"
              fullWidth
            >
              {requestStatus === 'loading' && 'In progress…'}
              {requestStatus === 'success' && 'Success!'}
              {requestStatus === 'failure' && 'Failure, try again!'}
              {requestStatus === 'idle' && 'Reset Password'}
            </FormButton>
          </Box>
        )}
      </Form>
    </>
  );
}
// @ts-ignore
function ResetPasswordWithRoot(props) {
  return <ResetPassword {...props} />;
}
export default withRoot(ResetPasswordWithRoot);
