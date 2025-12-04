import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Segment, Dropdown, Header, Input } from 'semantic-ui-react';
import { DateTime } from 'luxon';
import apiWrapper from './apiWrapper';
import ServiceConfirmationByDayPieChart from './components/businessIntelligence/ServiceConfirmationByDayPieChart';
import ServiceConfirmationMonthlyBarChart from './components/businessIntelligence/ServiceConfirmationMonthlyBarChart';
import ServiceConfirmationDailyLineChart from './components/businessIntelligence/ServiceConfirmationDailyLineChart';

const Dashboard = () => {
    const [actualData, setActualData] = useState([]);
    const [qrCodes, setQrCodes] = useState([]);
    const [selectedQrCode, setSelectedQrCode] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const transformDataForCharts = useCallback((data) => {
        return data
            .filter(item => !selectedQrCode || (item.QRCode && item.QRCode.id === selectedQrCode))
            .map(item => {
                const date = DateTime.fromISO(item.createdAt).toFormat('yyyy-MM-dd');
                const userEmail = item.User.email.replace(/(.{2})(.*)(?=@)/, (match, p1, p2) => p1 + '*'.repeat(p2.length));
                const confirmations = 1;
                const timestamp = DateTime.fromISO(item.createdAt).toMillis();
                return { date, user_email: userEmail, confirmations, timestamp };
            });
    }, [selectedQrCode]);

    const fetchData = useCallback(async () => {
        const data = await apiWrapper.getDashboardData(startDate, endDate, selectedQrCode);
        setActualData(transformDataForCharts(data));

        const qrCodeMap = new Map();
        data.forEach(item => {
            if (item.QRCode && item.QRCode.id) {
                qrCodeMap.set(item.QRCode.id, item.QRCode);
            }
        });
        setQrCodes(Array.from(qrCodeMap.values()).sort((a, b) => a.id - b.id));
    }, [selectedQrCode, startDate, endDate, transformDataForCharts]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const qrCodeOptions = qrCodes.map(qrCode => ({
        key: qrCode.id,
        text: qrCode.location,
        value: qrCode.id
    }));

    const onDateChange = (setDateFunction) => (event) => {
        setDateFunction(event.target.value);
    };

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event) => {
        event.stopPropagation();
        setSearchTerm(event.target.value);
    };

    const onQrCodeSelect = (value) => {
        setSelectedQrCode(value);
    };

    const selectedQrCodeLocation = qrCodes.find(qr => qr.id === selectedQrCode)?.location || 'Choose a QR Code and Date Range to Filter the Dashboards';

    const handleKeyDown = (event) => {
        if (event.key === ' ') {
            event.stopPropagation();
        }
    };

    // Custom focus style
    const customFocusStyle = {
        backgroundColor: '#e8f0fe', // Light blue background
        borderColor: '#2185d0', // Semantic UI primary color
        outline: 'none',
        boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)',
    };

    return (
        <div className='ui segment basic fluid'>
            <Header as='h2' textAlign='center'>{selectedQrCodeLocation}</Header>
            <Grid container>
                <Grid.Row>
                    <Grid.Column width={8} verticalAlign='bottom'>
                        <Segment basic textAlign='center'>
                            <Header as='h3' >Filter by QR Code</Header>
                            <Dropdown
                                text='Select QR Code'
                                icon='qrcode'
                                floating
                                labeled
                                button
                                placeholder='Select QR Code'
                                fluid
                                className='icon'
                                style={{ ...customFocusStyle }}
                            >
                                <Dropdown.Menu>
                                    <div className='ui icon search input' onClick={(e) => e.stopPropagation()}>
                                        <i className='search icon' />
                                        <input
                                            type='text'
                                            placeholder='Search QR Codes...'
                                            onChange={handleSearchChange}
                                            onKeyDown={handleKeyDown}
                                        />
                                    </div>
                                    <Dropdown.Divider />
                                    <Dropdown.Header icon='qrcode' content='QR Codes' />
                                    <Dropdown.Menu scrolling>
                                        {qrCodeOptions
                                            .filter(option => option.text.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(option => (
                                                <Dropdown.Item
                                                    key={option.key}
                                                    text={option.text}
                                                    value={option.value}
                                                    onClick={() => onQrCodeSelect(option.value)}
                                                />
                                            ))
                                        }
                                    </Dropdown.Menu>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Segment>
                    </Grid.Column>
                    <Grid.Column width={8} verticalAlign='bottom'>
                        <Segment basic textAlign='center'>
                            <Header as='h3'>Filter by Start and End Dates</Header>
                            <div style={{ paddingBottom: '10px' }}> {/* Add padding to the container */}
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={onDateChange(setStartDate)}
                                    style={{ ...customFocusStyle, width: '100%' }}  // Ensure width is 100%
                                />
                            </div>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={onDateChange(setEndDate)}
                                style={{ ...customFocusStyle, width: '100%' }}  // Ensure width is 100%
                            />
                        </Segment>
                    </Grid.Column>
                </Grid.Row>
            </Grid>

            <Header as='h2' textAlign='center'>Service Confirmation Statistics</Header>
            <Grid container>
                <Grid.Row>
                    <Grid.Column width={9}>
                        <ServiceConfirmationMonthlyBarChart data={actualData} />
                        <ServiceConfirmationDailyLineChart data={actualData} />
                    </Grid.Column>
                    <Grid.Column width={7}>
                        <ServiceConfirmationByDayPieChart data={actualData} />
                    </Grid.Column>
                </Grid.Row>
            </Grid>
        </div>
    );
};

export default Dashboard;
