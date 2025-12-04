import React, { useState, useEffect } from 'react';
import apiWrapper from './apiWrapper';
import { Table, Container, Header, Button, Form, Divider, Segment, Icon, Input, Loader } from 'semantic-ui-react';

const ManageServiceConfirmations = () => {
  const [confirmations, setConfirmations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadData, setLoadData] = useState(false); // State to trigger data load
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading status

  const fetchServiceConfirmations = async (start, end) => {
    setIsLoading(true); // Set loading to true before fetching data
    try {
      const response = await apiWrapper.getServiceConfirmationsForOrg(start, end);
      setConfirmations(response.data);
    } catch (error) {
      console.error('An error occurred while fetching service confirmations:', error);
      setConfirmations([]);
    } finally {
      setIsLoading(false); // Set loading to false after fetching data
    }
  };

  // Initial data fetch
  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedStartDate = thirtyDaysAgo.toISOString().split('T')[0];
    const formattedEndDate = new Date().toISOString().split('T')[0];

    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    setLoadData(true); // Trigger initial data load
  }, []);

  // Watcher for loadData
  useEffect(() => {
    if (loadData && startDate && endDate) {
      fetchServiceConfirmations(startDate, endDate);
      setLoadData(false); // Reset load trigger
    }
  }, [loadData, startDate, endDate]);

  // Rest of your component logic...

  // Function to handle the date change
  const handleDateChange = (setDate) => (event) => {
    setDate(event.target.value);
    setLoadData(true); // Trigger data load on date change
  };

  /*   // Function for manual data refresh (if needed)
    const refreshData = () => {
      setLoadData(true); // Trigger data load on refresh
    }; */

  const filteredConfirmations = searchTerm
    ? confirmations.filter(confirmation =>
      confirmation.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      confirmation.User.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (confirmation.QRCode && confirmation.QRCode.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      confirmation.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : confirmations;

  const handleExportClick = async () => {
    try {
      await apiWrapper.exportServiceConfirmationsToCSV(startDate, endDate);
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  // Function to handle sorting
  const handleSort = (sortKey) => {
    if (sortColumn !== sortKey) {
      setSortColumn(sortKey);
      setSortDirection('ascending');
      return;
    }
    setSortDirection(sortDirection === 'ascending' ? 'descending' : 'ascending');
  };

  const tableHeaders = [
    { display: 'ID', prop: 'id', sortKey: 'id' },
    { display: 'User Email', prop: 'User.email', sortKey: 'User.email' },
    { display: 'QR Code Location', prop: 'QRCode.location', sortKey: 'QRCode.location' },
    { display: 'Created At', prop: 'createdAt', sortKey: 'createdAt' },
    { display: 'Status', prop: 'status', sortKey: 'status' },
    { display: 'Service Type', prop: 'serviceType', sortKey: 'serviceType' },
  ];


  // Function to apply sorting
  const applySort = (confirmations) => {
    if (!sortColumn || !sortDirection) return confirmations;

    return [...confirmations].sort((a, b) => {
      // For nested properties like User.email, QRCode.location
      const aValue = sortColumn.includes('.') ? getNestedProp(a, sortColumn) : a[sortColumn];
      const bValue = sortColumn.includes('.') ? getNestedProp(b, sortColumn) : b[sortColumn];

      if (aValue == null || bValue == null) {
        return aValue == null ? 1 : -1;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'ascending' ? aValue - bValue : bValue - aValue;
      } else if (new Date(aValue) instanceof Date && !isNaN(new Date(aValue)) &&
        new Date(bValue) instanceof Date && !isNaN(new Date(bValue))) {
        return sortDirection === 'ascending' ? new Date(aValue) - new Date(bValue) : new Date(bValue) - new Date(aValue);
      } else {
        return sortDirection === 'ascending' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
      }
    });
  };

  // Helper function to access nested properties
  const getNestedProp = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };



  // Apply sorting to filteredConfirmations
  const sortedConfirmations = applySort(filteredConfirmations);

  // Custom focus style
  const customFocusStyle = {
    backgroundColor: '#e8f0fe', // Light blue background
    borderColor: '#2185d0', // Semantic UI primary color
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)',
  };

  return (
    <div className='ui container fluid'>
      <Container fluid className="center aligned">
        <Header as='h1'>Service Confirmations</Header>
        <p>Manage your service confirmations here.</p>
        <Divider />
        <Segment basic>
          <Input
            icon='search'
            placeholder="Filter events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              ...customFocusStyle,
              // borderRadius: '10px', // Rounded corners
            }} // Inline custom focus style with rounded corners
          />
          <Divider />

          <Form size='large'>
            <Form.Group widths='equal'>
              <Form.Input
                fluid
                label='Start Date'
                type='date'
                value={startDate}
                onChange={handleDateChange(setStartDate)}
                style={{ ...customFocusStyle }} // Inline custom focus style
              />
              <Form.Input
                fluid
                label='End Date'
                type='date'
                value={endDate}
                onChange={handleDateChange(setEndDate)}
                style={{ ...customFocusStyle }} // Inline custom focus style
              />
            </Form.Group>
          </Form>
        </Segment>
        <Divider />

        <Button onClick={handleExportClick} size='big' color='black'>
          Export to CSV
        </Button>

        <Segment basic>
        {isLoading ? (
          <Loader active inline='centered'>Loading...</Loader>
        ) : sortedConfirmations.length > 0 ? (
          <Table celled sortable>
              <Table.Header>
                <Table.Row>
                  {tableHeaders.map((header) => (
                    <Table.HeaderCell
                      key={header.prop}
                      sorted={sortColumn === header.sortKey ? sortDirection : null}
                      onClick={() => handleSort(header.sortKey)}
                    >
                      {header.display}
                      {sortColumn === header.sortKey && <Icon name={sortDirection === 'ascending' ? 'caret up' : 'caret down'} />}
                    </Table.HeaderCell>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {sortedConfirmations.map((confirmation) => (
                  <Table.Row key={confirmation.id}>
                    <Table.Cell>{confirmation.id}</Table.Cell>
                    <Table.Cell>{confirmation.User.email}</Table.Cell>
                    <Table.Cell>{confirmation.QRCode ? confirmation.QRCode.location : "NOTE: QR Code Deleted"}</Table.Cell>
                    <Table.Cell>{new Date(confirmation.createdAt).toLocaleString()}</Table.Cell>
                    <Table.Cell>{confirmation.status}</Table.Cell>
                    <Table.Cell>{confirmation.serviceType}</Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          ) : (
            <Header as='h3'>No Service Confirmation events are available for the selected date range.</Header>
          )}
        </Segment>
      </Container>
    </div>
  );

};

export default ManageServiceConfirmations;