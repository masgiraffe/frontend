import * as React from 'react';
import { alpha } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select, SelectChangeEvent,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { User } from './interfaces/user';

interface TableProps {
  issues: User[];
  URL: string;
  getData: () => Promise<User[]>;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  // if the values are numbers, compare them directly
  if (typeof a[orderBy] === 'number' && typeof b[orderBy] === 'number') {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
  }
  // if orderBy "role" order in the following way ["STAFF", "STUDENT"]
  if (orderBy === 'role') {
    const statusOrder = ['STAFF', 'STUDENT'];
    if (statusOrder.indexOf(String(b[orderBy])) < statusOrder.indexOf(String(a[orderBy]))) {
      return -1;
    }
    if (statusOrder.indexOf(String(b[orderBy])) > statusOrder.indexOf(String(a[orderBy]))) {
      return 1;
    }
  }
  // If orderBy is "firstName" or "lastName," order alphabetically
  if (orderBy === 'firstName' || orderBy === 'lastName') {
    if (String(b[orderBy]).toLowerCase() < String(a[orderBy]).toLowerCase()) {
      return -1;
    }
    if (String(b[orderBy]).toLowerCase() > String(a[orderBy]).toLowerCase()) {
      return 1;
    }
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
    a: { [key in Key]: number | string | null },
    b: { [key in Key]: number | string | null },
  ) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  return array.slice().sort(comparator);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof User;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'firstName',
    numeric: true,
    disablePadding: false,
    label: 'First Name',
  },
  {
    id: 'lastName',
    numeric: true,
    disablePadding: false,
    label: 'Last Name',
  },
  {
    id: 'email',
    numeric: false,
    disablePadding: false,
    label: 'Email',
  },
  {
    id: 'role',
    numeric: false,
    disablePadding: false,
    label: 'Role',
  },
];

const DEFAULT_ORDER = 'desc';
const DEFAULT_ORDER_BY = 'lastName';
const DEFAULT_ROWS_PER_PAGE = 10;

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, newOrderBy: keyof User) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort,
  } = props;
  const createSortHandler = (newOrderBy: keyof User) => (event: React.MouseEvent<unknown>) => {
    onRequestSort(event, newOrderBy);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            color="primary"
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{
              'aria-label': 'select all users',
            }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align="right"
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'desc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

interface EnhancedTableToolbarProps {
  numSelected: number;
  handleDelete: () => void;
  handleEdit: () => void;
  handleAdd: () => void;
}

function EnhancedTableToolbar(props: EnhancedTableToolbarProps) {
  const {
    numSelected, handleDelete, handleEdit, handleAdd,
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) => alpha(
            theme.palette.primary.main,
            theme.palette.action.activatedOpacity,
          ),
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected}
          {' '}
          selected
        </Typography>
      ) : (
        <Typography
          sx={{ flex: '1 1 100%' }}
          variant="h6"
          id="tableTitle"
          component="div"
        >
          Users
        </Typography>
      )}
      {numSelected === 0 ? (
        <Tooltip title="Add New">
          <IconButton onClick={handleAdd}>
            <AddIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {numSelected === 1 ? (
        <Tooltip title="Edit">
          <IconButton onClick={handleEdit}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      ) : null}
      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton onClick={handleDelete}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}

export default function EnhancedUserTable(props: TableProps) {
  const { issues, URL, getData } = props;
  const [rows, setRows] = React.useState<User[]>(issues);
  const [order, setOrder] = React.useState<Order>(DEFAULT_ORDER);
  const [orderBy, setOrderBy] = React.useState<keyof User>(DEFAULT_ORDER_BY);
  const [selected, setSelected] = React.useState<readonly string[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [visibleRows, setVisibleRows] = React.useState<User[] | null>(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_ROWS_PER_PAGE);
  const [paddingHeight, setPaddingHeight] = React.useState(0);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editFirstName, setEditFirstName] = React.useState('');
  const [editLastName, setEditLastName] = React.useState('');

  const [editRole, setEditRole] = React.useState('');
  const [newFirstName, setNewFirstName] = React.useState('');
  const [newLastName, setNewLastName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');

  const [newRole, setNewRole] = React.useState('');
  const [selectedRow, setSelectedRow] = React.useState<string>('');

  React.useEffect(() => {
    let rowsOnMount = stableSort(
      rows,
      getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY),
    );
    rowsOnMount = rowsOnMount.slice(
      0,
      DEFAULT_ROWS_PER_PAGE,
    );

    setVisibleRows(rowsOnMount as User[] | null);
  }, []);

  const handleRequestSort = React.useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof User) => {
      const isAsc = orderBy === newOrderBy && order === 'asc';
      let toggledOrder: Order;
      if (orderBy !== newOrderBy) {
        toggledOrder = 'desc';
      } else if (isAsc) {
        toggledOrder = 'desc';
      } else {
        toggledOrder = 'asc';
      } setOrder(toggledOrder);
      setOrderBy(newOrderBy);

      const sortedRows = stableSort(rows, getComparator(toggledOrder, newOrderBy));
      const newLastPage = Math.ceil(sortedRows.length / rowsPerPage) - 1;

      if (page === newLastPage) {
        setPage(newLastPage);
      } else {
        setPage(0);
      }

      const updatedRows = sortedRows.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage,
      );
      setVisibleRows(updatedRows as | User[] | null);
    },
    [order, orderBy, page, rowsPerPage],
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.email);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, name: string) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected: readonly string[] = [];

    if (selectedRow === name) {
      setSelectedRow('');
    } else {
      setSelectedRow(name);
    }

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, [name]);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = React.useCallback(
    (event: unknown, newPage: number) => {
      setPage(newPage);

      const sortedRows = stableSort(rows, getComparator(order, orderBy));
      const updatedRows = sortedRows.slice(
        newPage * rowsPerPage,
        newPage * rowsPerPage + rowsPerPage,
      );
      setVisibleRows(updatedRows as User[] | null);

      // Avoid a layout jump when reaching the last page with empty rows.
      const numEmptyRows = newPage > 0 ? Math.max(0, (1 + newPage) * rowsPerPage - rows.length) : 0;

      const newPaddingHeight = (dense ? 33 : 53) * numEmptyRows;
      setPaddingHeight(newPaddingHeight);
    },
    [order, orderBy, dense, rowsPerPage],
  );

  const handleChangeRowsPerPage = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const updatedRowsPerPage = parseInt(event.target.value, 10);
      setRowsPerPage(updatedRowsPerPage);

      setPage(0);

      const sortedRows = stableSort(rows, getComparator(order, orderBy));
      const updatedRows = sortedRows.slice(
        0,
        updatedRowsPerPage,
      );
      setVisibleRows(updatedRows as User[] | null);

      // There is no layout jump to handle on the first page.
      setPaddingHeight(0);
    },
    [order, orderBy],
  );

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (name: string) => selected.indexOf(name) !== -1;

  const handleDelete = async () => {
    // delete selected users
    await Promise.all(selected.map(async (user) => {
      await fetch(`${URL}/${user}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    }));
    // Call getData to refresh the data in the parent component
    const data = await getData();
    setSelected([]);
    // update the rows in the table
    setRows(data);
  };

  // refresh table when visible rows change
  React.useEffect(() => {
    const sortedRows = stableSort(rows, getComparator(order, orderBy));
    const updatedRows = sortedRows.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
    setVisibleRows(updatedRows as User[] | null);
  }, [rows]);

  const handleAdd = () => {
    setAddOpen(true);
  };

  const handleEdit = () => {
    // set the default values for the edit form
    const selectedUser = rows.find((user) => user.email === selected[0]) as User;
    setEditFirstName(selectedUser.firstName);
    setEditLastName(selectedUser.lastName);
    setEditRole(selectedUser.role);
    setEditOpen(true);
  };

  const editUser = async (firstName: string, lastName: string, email: string, role: string) => {
    const resFetch = await fetch(`${URL}/${email}`, { credentials: 'include' });
    const resFetchJSON = await resFetch.json();
    resFetchJSON.firstName = firstName;
    resFetchJSON.lastName = lastName;
    resFetchJSON.email = email;
    resFetchJSON.role = role;
    await fetch(`${URL}/${email}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(resFetchJSON),
    });
  };

  const newUser = async (
    firstName: string,
    lastName: string,
    email: string,
    role: string,
  ) => {
    const newUserBody = {
      firstName,
      lastName,
      email,
      role,
    };
    await fetch(URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newUserBody),
    });
  };

  const handleNewSubmit = async () => {
    setAddOpen(false);
    await newUser(
      newFirstName,
      newLastName,
      newEmail,
      newRole.toUpperCase(),
    );
    const data = await getData();
    setRows(data);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewRole('');
  };

  const handleEditSubmit = async () => {
    setEditOpen(false);
    await editUser(editFirstName, editLastName, selected[0], editRole);
    // Call getData to refresh the data in the parent component
    const data = await getData();
    setSelected([]);
    // update the rows in the table
    setRows(data);
    setEditFirstName('');
    setEditLastName('');
    setEditRole('');
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <EnhancedTableToolbar
          numSelected={selected.length}
          handleDelete={handleDelete}
          handleEdit={handleEdit}
          handleAdd={handleAdd}
        />
        <Dialog open={addOpen} PaperProps={{ sx: { width: '60%' } }}>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="FirstName"
              multiline
              rows={1}
              variant="outlined"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
            />
            <TextField
              label="LastName"
              multiline
              rows={1}
              variant="outlined"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
            />
            <TextField
              label="Email"
              multiline
              rows={1}
              variant="outlined"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <TextField
              label="Role"
              multiline
              rows={1}
              variant="outlined"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ padding: '16px' }}>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleNewSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog open={editOpen} PaperProps={{ sx: { width: '60%' } }}>
          <DialogTitle>Edit User</DialogTitle>
          <Box sx={{ width: '100%', height: '8px' }} />
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="FirstName"
              multiline
              rows={6}
              variant="outlined"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
            />
            <TextField
              label="LastName"
              multiline
              rows={6}
              variant="outlined"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
            />
            <FormControl variant="outlined" fullWidth>
              <InputLabel id="role-select-label">Role</InputLabel>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={editRole}
                label="Status"
                onChange={(e:SelectChangeEvent) => setEditRole(e.target.value)}
              >
                <MenuItem value="STAFF">Staff</MenuItem>
                <MenuItem value="STUDENT">Student</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ padding: '16px' }}>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={handleEditSubmit} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby="tableTitle"
            size={dense ? 'small' : 'medium'}
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {visibleRows
                ? visibleRows.map((row, index) => {
                  const isItemSelected = isSelected(row.email);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const isOpen = selectedRow === row.email;

                  return (
                    <React.Fragment key={row.lastName}>
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.email as unknown as string)}
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        selected={isItemSelected}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            color="primary"
                            checked={isItemSelected}
                            inputProps={{
                              'aria-labelledby': labelId,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          component="th"
                          id={labelId}
                          scope="row"
                          padding="none"
                          align="right"
                        >
                          {row.firstName}
                        </TableCell>
                        <TableCell align="right">{row.lastName}</TableCell>
                        <TableCell align="right">{row.email }</TableCell>
                        <TableCell align="right">{row.role}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                          <Collapse in={isOpen}>
                            <div style={{ padding: '16px 0' }}>
                              <Typography variant="h6" gutterBottom component="div">
                                {`User ${index + 1}`}
                              </Typography>
                              <Typography variant="body1" component="div" style={{ marginTop: '16px' }}>
                                <b>First Name:</b>
                                {' '}
                                {row.firstName}
                                {' '}
                                <br />
                                <br />
                                <b>Last Name:</b>
                                {' '}
                                {row.lastName}
                                {' '}
                                <br />
                                <br />
                                <b>Email:</b>
                                {' '}
                                {row.email}
                                <br />
                                <br />
                                <b>Role:</b>
                                {' '}
                                {row.role}
                              </Typography>
                            </div>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })
                : null}
              {paddingHeight > 0 && (
              <TableRow
                style={{
                  height: paddingHeight,
                }}
              >
                <TableCell colSpan={6} />
              </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      <FormControlLabel
        control={<Switch checked={dense} onChange={handleChangeDense} />}
        label="Dense padding"
      />
    </Box>
  );
}
