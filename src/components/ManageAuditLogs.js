import React, { useState, useEffect } from 'react';
import apiWrapper from '../apiWrapper';
import { Input } from 'semantic-ui-react';

const ManageAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loadData, setLoadData] = useState(false); // State to trigger data load

  const fetchAuditLogs = async (start, end) => {
    try {
      const response = await apiWrapper.getAuditLogsForOrg(start, end);
      setAuditLogs(response.data);
    } catch (error) {
      console.error('An error occurred while fetching audit logs:', error);
      setAuditLogs([]);
    }
  };

  useEffect(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const formattedStartDate = thirtyDaysAgo.toISOString().split('T')[0];
    const formattedEndDate = new Date().toISOString().split('T')[0];

    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    setLoadData(true); // Trigger initial data load
  }, []);

  useEffect(() => {
    if (loadData && startDate && endDate) {
      fetchAuditLogs(startDate, endDate);
      setLoadData(false); // Reset load trigger
    }
  }, [loadData, startDate, endDate]);

  const handleDateChange = (setDate) => (event) => {
    setDate(event.target.value);
    setLoadData(true); // Trigger data load on date change
  };

  const filteredLogs = searchTerm
    ? auditLogs.filter(log =>
      log.ActionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.Details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ObjectOrFunction.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : auditLogs;

  // Custom focus style
  const customFocusStyle = {
    backgroundColor: '#e8f0fe', // Light blue background
    borderColor: '#2185d0', // Semantic UI primary color
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)',
  };

  return (
    <div className="ui center aligned fluid basic segment">
      <div className="ui text container">
        <h1>Audit Logs</h1>
        <p>Manage your audit logs here.</p>
        <div className="ui search">
          <div className="ui icon input" style={{ ...customFocusStyle }}>
            <Input
              className="prompt"
              type="text"
              placeholder="Filter logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="search icon" />
          </div>
        </div>
        <div className="ui divider"></div>
        <div className="ui large form">
          <div className="two fields">
            <div className="field">
              <label>Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={handleDateChange(setStartDate)}
                style={{ ...customFocusStyle }}
              />
            </div>
            <div className="field">
              <label>End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={handleDateChange(setEndDate)}
                style={{ ...customFocusStyle }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="ui basic fluid segment">
        {filteredLogs.length > 0 ? (
          <table className="ui celled table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User ID</th>
                <th>Action Type</th>
                <th>Details</th>
                {/*                 <th>IP Address</th> */}
                {/*                 <th>Relevant Detail</th> */}
                <th>Object/Function</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.Timestamp).toLocaleString()}</td>
                  <td>{log.UserID}</td>
                  <td>{log.ActionType}</td>
                  <td>{log.Details}</td>
                  {/*                   <td>{log.IPAddress}</td> */}
                  {/*                   <td>{log.RelevantDetail}</td> */}
                  <td>{log.ObjectOrFunction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div><h3>No Audit Logs are available for the selected date range.</h3></div>
        )}
      </div>
    </div>
  );
};

export default ManageAuditLogs;
