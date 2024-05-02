import * as React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import Box, { BoxProps as MuiBoxProps } from '@mui/material/Box';
import Typography from '../components/Typography';

interface FormFeedbackProps extends MuiBoxProps {
  // eslint-disable-next-line
  error?: boolean;
  // eslint-disable-next-line
  success?: boolean;
}

const BoxStyled = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'error' && prop !== 'success',
})<FormFeedbackProps>(({ theme, error, success }) => ({
  padding: theme.spacing(2),
  ...(error && {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.dark,
  }),
  ...(success && {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.dark,
  }),
}));

function FormFeedback(
  props: React.HTMLAttributes<HTMLDivElement> & FormFeedbackProps,
) {
  const {
    className, children, error, success, ...others
  } = props;

  return (
      // eslint-disable-next-line
      <BoxStyled error={error} success={success} className={className} {...others}>
        <Typography color="inherit">{children}</Typography>
      </BoxStyled>
  );
}

export default FormFeedback;
