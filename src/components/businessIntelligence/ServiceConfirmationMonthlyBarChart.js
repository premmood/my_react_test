import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { Segment } from 'semantic-ui-react';
import { DateTime } from 'luxon';

const ServiceConfirmationMonthlyBarChart = ({ data }) => {
    // Step 1: Sort the data by date in ascending order
    const sortedData = [...data].sort((a, b) => {
        const dateA = DateTime.fromISO(a.date);
        const dateB = DateTime.fromISO(b.date);
        return dateA - dateB;
    });

    // Step 2: Filter the data to include only the most recent 6 months
    const currentDate = DateTime.local();
    const sixMonthsAgo = currentDate.minus({ months: 6 });
    const filteredData = sortedData.filter((item) => {
        const date = DateTime.fromISO(item.date);
        return date >= sixMonthsAgo;
    });

    // Step 3: Aggregate data by month
    const dataByMonth = filteredData.reduce((acc, curr) => {
        const date = DateTime.fromISO(curr.date);
        const formattedDate = date.toFormat('LLL yyyy'); // Format date for display
        acc[formattedDate] = (acc[formattedDate] || 0) + curr.confirmations;
        return acc;
    }, {});

    // Step 4: Modify the chartData to include sorted and filtered data
    const chartData = Object.keys(dataByMonth).map(key => ({
        month: key,
        confirmations: dataByMonth[key],
    }));

    // Step 5: Generate random colors from the Nivo default color scheme
    // Nivo default color scheme
    const nivoDefaultColors = [
        '#a1cfff', '#f47560', '#dd63e3', '#ffab00', '#00c8d4', '#a7ff83', '#738e98',
    ];

    // Create a map of months to colors
    const monthColorMap = {};
    chartData.forEach((item, index) => {
        const colorIndex = index % nivoDefaultColors.length;
        monthColorMap[item.month] = nivoDefaultColors[colorIndex];
    });


    return (
        <Segment basic>
            <h2>Monthly Tracking</h2>
            <div style={{ height: '30vh' }}>
                <ResponsiveBar
                    data={chartData}
                    keys={['confirmations']}
                    indexBy="month"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={(bar) => monthColorMap[bar.indexValue]}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Month',
                        legendPosition: 'middle',
                        legendOffset: 32
                    }}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: 'Confirmations',
                        legendPosition: 'middle',
                        legendOffset: -40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    animate={true}
                    motionStiffness={90}
                    motionDamping={15}
                />
            </div>
        </Segment>
    );
};

export default ServiceConfirmationMonthlyBarChart;
