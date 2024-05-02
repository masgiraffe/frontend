import * as React from 'react';
import dayjs from 'dayjs';
import { alpha } from '@mui/material/styles';
// import CheckIcon from '@mui/icons-material/Check';
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
  FormControlLabel,
  IconButton,
  Paper,
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
import { DatePicker } from '@mui/x-date-pickers';
import { visuallyHidden } from '@mui/utils';
import { Equipment, DateInfo } from './interfaces/equipment.js';

interface TableProps {
  equipment: Equipment[];
  URL: string;
  getData: () => Promise<Equipment[]>;
}

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (
    a: { [key in Key]: number | string | DateInfo | null },
    b: { [key in Key]: number | string | DateInfo | null },
  ) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
  return array.slice().sort(comparator);
}

interface HeadCell {
  disablePadding: boolean;
  id: keyof Equipment;
  label: string;
  numeric: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    numeric: true,
    disablePadding: false,
    label: 'ID',
  },
  {
    id: 'name',
    numeric: true,
    disablePadding: false,
    label: 'Name',
  },
  {
    id: 'equipmentType',
    numeric: false,
    disablePadding: false,
    label: 'Equipment Type',
  },
  {
    id: 'location',
    numeric: false,
    disablePadding: false,
    label: 'Location',
  },
];

const DEFAULT_ORDER = 'asc';
const DEFAULT_ORDER_BY = 'id';
const DEFAULT_ROWS_PER_PAGE = 10;

interface EnhancedTableProps {
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, newOrderBy: keyof Equipment) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: string;
  rowCount: number;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const {
    onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort,
  } = props;
  const createSortHandler = (newOrderBy: keyof Equipment) => (event: React.MouseEvent<unknown>) => {
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
              'aria-label': 'select all equipment',
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
          Equipment
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
  const { equipment, URL, getData } = props;
  const [rows, setRows] = React.useState<Equipment[]>(equipment);
  const [order, setOrder] = React.useState<Order>(DEFAULT_ORDER);
  const [orderBy, setOrderBy] = React.useState<keyof Equipment>(DEFAULT_ORDER_BY);
  const [selected, setSelected] = React.useState<readonly number[]>([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(true);
  const [visibleRows, setVisibleRows] = React.useState<Equipment[] | null>(null);
  const [rowsPerPage, setRowsPerPage] = React.useState(DEFAULT_ROWS_PER_PAGE);
  const [paddingHeight, setPaddingHeight] = React.useState(0);
  const [addOpen, setAddOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editLastMaintenanceDate, setEditLastMaintenanceDate] = React.useState<DateInfo>();
  const [editLocation, setEditLocation] = React.useState('');
  const [newName, setNewName] = React.useState('');
  const [newLocation, setNewLocation] = React.useState('');
  const [newModel, setNewModel] = React.useState('');
  const [newManufacturer, setNewManufacturer] = React.useState('');
  const [newSerial, setNewSerial] = React.useState('');
  const [newEquipmentType, setNewEquipmentType] = React.useState('');
  const [newDateInstalled, setNewDateInstalled] = React.useState<DateInfo>();
  const [newLastMaintenanceDate, setNewLastMaintenanceDate] = React.useState<DateInfo>();
  const [selectedRow, setSelectedRow] = React.useState<number>(-1);

  React.useEffect(() => {
    let rowsOnMount = stableSort(
      rows,
      getComparator(DEFAULT_ORDER, DEFAULT_ORDER_BY),
    );
    rowsOnMount = rowsOnMount.slice(
      0,
      DEFAULT_ROWS_PER_PAGE,
    );

    setVisibleRows(rowsOnMount as Equipment[] | null);
  }, []);

  const handleRequestSort = React.useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Equipment) => {
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
      setVisibleRows(updatedRows as | Equipment[] | null);
    },
    [order, orderBy, page, rowsPerPage],
  );

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = rows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event: React.MouseEvent<unknown>, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: readonly number[] = [];

    if (selectedRow === id) {
      setSelectedRow(-1);
    } else {
      setSelectedRow(id);
    }

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, [id]);
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
      setVisibleRows(updatedRows as Equipment[] | null);

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
      setVisibleRows(updatedRows as Equipment[] | null);

      // There is no layout jump to handle on the first page.
      setPaddingHeight(0);
    },
    [order, orderBy],
  );

  const handleChangeDense = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDense(event.target.checked);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  const handleDelete = async () => {
    // delete selected equipment
    await Promise.all(selected.map(async (eq) => {
      await fetch(`${URL}/${eq}`, {
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
    setVisibleRows(updatedRows as Equipment[] | null);
  }, [rows]);

  const handleAdd = () => {
    setAddOpen(true);
  };

  const handleEdit = () => {
    // set the default values for the edit form
    const selectedEquipment = rows.find((eq) => eq.id === selected[0]) as Equipment;
    setEditName(selectedEquipment.name);
    setEditLastMaintenanceDate(selectedEquipment.lastMaintenanceDate);
    setEditLocation(selectedEquipment.location);
    setEditOpen(true);
  };

  const editEquipment = async (
    id: number,
    name: string,
    location: string,
    lastMaintenanceDate?: DateInfo,
  ) => {
    const resFetch = await fetch(`${URL}/${id}`, { credentials: 'include' });
    const resFetchJSON = await resFetch.json();
    resFetchJSON.name = name;
    resFetchJSON.lastMaintenanceDate = lastMaintenanceDate;
    resFetchJSON.location = location;
    await fetch(`${URL}/${id}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(resFetchJSON),
    });
  };

  const newEquipment = async (
    name: string,
    location: string,
    model: string,
    manufacturer: string,
    serialNumber: string,
    type: string,
    dateInstalled?: DateInfo,
    lastMaintenanceDate?: DateInfo,
  ) => {
    const newEquipmentBody = {
      name,
      dateInstalled,
      equipmentType: type,
      location,
      manufacturer,
      model,
      serialNumber,
      lastMaintenanceDate,
    };
    await fetch(URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(newEquipmentBody),
    });
  };

  const handleNewSubmit = async () => {
    setAddOpen(false);
    await newEquipment(
      newName,
      newLocation,
      newModel,
      newManufacturer,
      newSerial,
      newEquipmentType,
      newDateInstalled,
      newLastMaintenanceDate,
    );
    const data = await getData();
    setRows(data);
    setNewName('');
    setNewLocation('');
    setNewModel('');
    setNewManufacturer('');
    setNewSerial('');
    setNewEquipmentType('');
    setNewDateInstalled(undefined);
    setNewLastMaintenanceDate(undefined);
  };

  const handleEditSubmit = async () => {
    setEditOpen(false);
    await editEquipment(selected[0], editName, editLocation, editLastMaintenanceDate);
    // Call getData to refresh the data in the parent component
    const data = await getData();
    setSelected([]);
    // update the rows in the table
    setRows(data);
    setEditName('');
    setEditLastMaintenanceDate(undefined);
    setEditLocation('');
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
          <DialogTitle>Add New Equipment</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Name"
              multiline
              rows={1}
              variant="outlined"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <TextField
              label="Location"
              multiline
              rows={1}
              variant="outlined"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
            <TextField
              label="Model"
              multiline
              rows={1}
              variant="outlined"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
            />
            <TextField
              label="Manufacturer"
              multiline
              rows={1}
              variant="outlined"
              value={newManufacturer}
              onChange={(e) => setNewManufacturer(e.target.value)}
            />
            <TextField
              label="Serial Number"
              multiline
              rows={1}
              variant="outlined"
              value={newSerial}
              onChange={(e) => setNewSerial(e.target.value)}
            />
            <TextField
              label="Equipment Type"
              multiline
              rows={1}
              variant="outlined"
              value={newEquipmentType}
              onChange={(e) => setNewEquipmentType(e.target.value)}
            />
            <DatePicker
              label="Date Instaled"
              value={dayjs(`${newDateInstalled?.year}-${newDateInstalled?.month}-${newDateInstalled?.day}`)}
              onChange={(newValue) => setNewDateInstalled({
                month: typeof newValue?.month() === 'number' ? newValue.month() + 1 : undefined,
                year: newValue?.year(),
                day: newValue?.date(),
              })}
            />
            <DatePicker
              label="Last Maintenence Date"
              value={dayjs(`${newLastMaintenanceDate?.year}-${newLastMaintenanceDate?.month}-${newLastMaintenanceDate?.day}`)}
              onChange={(newValue) => setNewLastMaintenanceDate({
                month: typeof newValue?.month() === 'number' ? newValue.month() + 1 : undefined,
                year: newValue?.year(),
                day: newValue?.date(),
              })}
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
          <DialogTitle>Edit Equipment</DialogTitle>
          <Box sx={{ width: '100%', height: '8px' }} />
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <TextField
              label="Name"
              multiline
              rows={1}
              variant="outlined"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
            <DatePicker
              label="Last Maintenance Date"
              value={dayjs(`${editLastMaintenanceDate?.year}-${editLastMaintenanceDate?.month}-${editLastMaintenanceDate?.day}`)}
              onChange={(newValue) => setEditLastMaintenanceDate({
                month: typeof newValue?.month() === 'number' ? newValue.month() + 1 : undefined,
                year: newValue?.year(),
                day: newValue?.date(),
              })}
            />
            <TextField
              label="Location"
              multiline
              rows={1}
              variant="outlined"
              value={editLocation}
              onChange={(e) => setEditLocation(e.target.value)}
            />
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
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const isOpen = selectedRow === row.id;

                  return (
                    <React.Fragment key={row.id}>
                      <TableRow
                        hover
                        onClick={(event) => handleClick(event, row.id as unknown as number)}
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
                          {row.id}
                        </TableCell>
                        <TableCell align="right">{row.name }</TableCell>
                        <TableCell align="right">{row.equipmentType}</TableCell>
                        <TableCell align="right">{row.location}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                          <Collapse in={isOpen}>
                            <div style={{ padding: '16px 0' }}>
                              <Typography variant="h6" gutterBottom component="div">
                                <a href={`${URL}/qr/${row.id}`} target="_blank" rel="noreferrer">Generate QR Code</a>
                              </Typography>
                              <Typography variant="body1" component="div" style={{ marginTop: '16px' }}>
                                <b>Name:</b>
                                {' '}
                                {row.name}
                                {' '}
                                <br />
                                <br />
                                <b>Type:</b>
                                {' '}
                                {row.equipmentType}
                                <br />
                                <br />
                                <b>Model:</b>
                                {' '}
                                {row.model}
                                <br />
                                <br />
                                <b>Manufacturer:</b>
                                {' '}
                                {row.manufacturer}
                                <br />
                                <br />
                                <b>Location:</b>
                                {' '}
                                {row.location}
                                <br />
                                <br />
                                <b>Serial Number:</b>
                                {' '}
                                {row.serialNumber}
                                <br />
                                <br />
                                <b>Date Last Serviced:</b>
                                {' '}
                                {
                                  (row.lastMaintenanceDate !== undefined
                                   && 'month' in row.lastMaintenanceDate
                                   && 'day' in row.lastMaintenanceDate
                                   && 'year' in row.lastMaintenanceDate)
                                    ? `${row.lastMaintenanceDate.month}-${row.lastMaintenanceDate.day}-${row.lastMaintenanceDate.year}`
                                    : 'No date provided'
                                }
                                <br />
                                <br />
                                <b>Date Installed:</b>
                                {' '}
                                {
                                  (row.dateInstalled !== undefined
                                   && 'month' in row.dateInstalled
                                   && 'day' in row.dateInstalled
                                   && 'year' in row.dateInstalled)
                                    ? `${row.dateInstalled.month}-${row.dateInstalled.day}-${row.dateInstalled.year}`
                                    : 'No date provided'
                                }
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
