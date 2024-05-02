import * as React from 'react';
import { ButtonProps } from '@mui/material';
import Button from '../components/Button';
import defer from './defer';

interface FormButtonProps {
  // eslint-disable-next-line
  disabled?: boolean;
  // eslint-disable-next-line
  mounted?: boolean;
}

function FormButton<C extends React.ElementType>(
  props: FormButtonProps & ButtonProps<C, { component?: C }>,
) {
  const { disabled, mounted, ...others } = props;
  return (
    <Button
      disabled={!mounted || !!disabled}
      type="submit"
      variant="contained"
        // eslint-disable-next-line
      {...others}
    />
  );
}
export default defer(FormButton);
