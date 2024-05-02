import { Button } from '@mui/material';
import React, { useState } from 'react';

interface NavProps {
  onValueChange: (arg0: boolean) => boolean;
}

export default function Nav(props: NavProps) {
  const { onValueChange } = props;
  const [isStaff, setIsStaff] = useState(true);
  const handleStaffChange = () => {
    setIsStaff(!isStaff);
    onValueChange(isStaff);
  };
  return (
    <Button
      size="large"
      variant="contained"
      onClick={handleStaffChange}
    >
      {isStaff ? 'User Report' : 'Staff Login'}
    </Button>
  );
}
