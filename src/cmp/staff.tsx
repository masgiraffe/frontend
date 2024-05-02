// import styles from '@/styles/Home.module.css';
import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import EnhancedTable from './table';
import EnhancedEquipmentTable from './equipmentTable';
import EnhancedUserTable from './userTable';
import { User } from './interfaces/user';
import { Equipment } from './interfaces/equipment';

interface Issue {
  id: number;
  equipmentId: number;
  status: string;
  dateReported: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  priority: string;
  description: string;
  assignedTo: string | null;
  dateResolved: {
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
  };
  resolutionDetails: string | null;
  notes: string | null;
}

interface IssueResponse {
  issue_table: Issue[];
}

interface UserResponse {
  user_table: User[];
}
export default function Staff() {
  const [data, setData] = useState(new Array<Issue>());
  const [equipment, setEquipment] = useState(new Array<Equipment>());
  const [hasData, setHasData] = useState(false);
  const [hasEquipment, setHasEquipment] = useState(false);
  const [activeTable, setActiveTable] = useState('issues');
  const [users, setUsers] = useState(new Array<User>());
  const [hasUsers, setHasUsers] = useState(false);
  const URL = 'https://urepair.me';

  const getData = async () => {
    const res = await fetch(`${URL}/issue`, { credentials: 'include' });
    const resJSON = await res.json() as IssueResponse;
    setData(resJSON.issue_table);
    setHasData(true);
    setActiveTable('issues');
    return Promise.resolve(resJSON.issue_table); // what does this do?
  };

  const getEquipment = async () => {
    const res = await fetch(`${URL}/equipment`, { credentials: 'include' });
    const resJSON = await res.json();
    resJSON.equipment_table.sort((a: Equipment, b: Equipment) => a.id - b.id);
    setEquipment(resJSON.equipment_table);
    setHasEquipment(true);
    setActiveTable('equipment');
    return Promise.resolve(resJSON.equipment_table);
  };

  const getUsers = async () => {
    const res = await fetch(`${URL}/user`, { credentials: 'include' });
    const resJSON = await res.json() as UserResponse;
    setUsers(resJSON.user_table);
    setHasUsers(true);
    setActiveTable('users');
    return Promise.resolve(resJSON.user_table); // what does this do?
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          alignItems: 'center',
          width: '100%',
          height: '100px',
          bgcolor: 'primary.secondary',
        }}
      >
        <Button
          size="large"
          variant={activeTable === 'issues' ? 'outlined' : 'contained'}
          onClick={getData}
        >
          Fetch Tickets
        </Button>
        <Button
          size="large"
          variant={activeTable === 'equipment' ? 'outlined' : 'contained'}
          onClick={getEquipment}
        >
          Fetch Equipment
        </Button>
        <Button
          size="large"
          variant={activeTable === 'users' ? 'outlined' : 'contained'}
          onClick={getUsers}
        >
          Fetch Users
        </Button>
      </Box>
      {hasData && activeTable === 'issues' && <EnhancedTable URL={`${URL}/issue`} issues={data} getData={getData} />}
      {hasEquipment && activeTable === 'equipment' && <EnhancedEquipmentTable URL={`${URL}/equipment`} equipment={equipment} getData={getEquipment} />}
      {hasUsers && activeTable === 'users' && <EnhancedUserTable URL={`${URL}/user`} issues={users} getData={getUsers} />}
    </>
  );
}
