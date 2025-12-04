import React from 'react';
import { ResponsiveLine } from '@nivo/line';
import { Segment } from 'semantic-ui-react';
import { DateTime } from 'luxon';

const ServiceConfirmationDailyLineChart = ({ data }) => {
    if (!data || data.length === 0) {
        return <Segment><h2>Daily Confirmation Rate</h2><p>No data available</p></Segment>;
    }

    const mostRecentDate = data.reduce((latest, curr) => {
        const currentDate = DateTime.fromISO(curr.date);
        return latest > currentDate ? latest : currentDate;
    }, DateTime.fromISO(data[0].date));

    const cutoffDate = mostRecentDate.minus({ days: 30 });
    const filteredData = data.filter(item => DateTime.fromISO(item.date) >= cutoffDate);

    const dataByDate = filteredData.reduce((acc, curr) => {
        const date = curr.date;
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {});

    // Find the maximum number of confirmations in a single day
    const maxConfirmations = Math.max(...Object.values(dataByDate));

    const chartDataArray = Object.keys(dataByDate).map(date => ({
        x: date,
        y: dataByDate[date]
    })).sort((a, b) => new Date(a.x) - new Date(b.x));

    const chartData = [{ id: "per Day", data: chartDataArray }];

    const CustomTooltip = ({ point }) => (
        <div style={{ background: 'white', padding: '9px 12px', border: '1px solid #ccc' }}>
            {`${point.data.yFormatted} confirmation(s) on ${point.data.xFormatted}`}
        </div>
    );

    const CustomPointLayer = ({ points, xScale, yScale }) => {
        return (
            <g>
                {points.map(point => (
                    <text
                        key={point.id}
                        x={point.x}
                        y={point.y - 12} // adjust for desired offset
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                            fill: '#000',
                            fontSize: '12px'
                        }}
                    >
                        {Math.round(point.data.yFormatted)}
                    </text>
                ))}
            </g>
        );
    };

    return (
        <Segment basic>
            <h2>Activity over the last 30 Days</h2>
            <div style={{ height: '20vh' }}>
                <ResponsiveLine
                    data={chartData}
                    layers={['grid', 'markers', 'areas', 'crosshair', 'lines', 'slices', 'mesh', CustomPointLayer, 'legends']}
                    margin={{ top: 30, right: 40, bottom: 50, left: 20 }}
                    xScale={{ type: 'point' }}
                    yScale={{ type: 'linear', min: 0, max: maxConfirmations, stacked: true, reverse: false }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={null}
                    axisLeft={null}
                    lineWidth={5}
                    pointSize={15}
                    pointColor={{ theme: 'background' }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: 'serieColor' }}
                    pointLabelYOffset={-12}
                    curve="monotoneX"
                    useMesh={true}
                    enableArea={true}
                    tooltip={CustomTooltip}
                    legends={[]}
                />
            </div>
        </Segment>
    );
};

export default ServiceConfirmationDailyLineChart;
