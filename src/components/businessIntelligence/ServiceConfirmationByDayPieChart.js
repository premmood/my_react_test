import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { DateTime } from 'luxon';
import { Segment } from 'semantic-ui-react';

const ServiceConfirmationByDayPieChart = ({ data }) => {
    const getDayOfWeek = (dateStr) => {
        const date = DateTime.fromISO(dateStr);
        return date.toFormat('cccc');
    };

    const dataByDay = data.reduce((acc, curr) => {
        const dayOfWeek = getDayOfWeek(curr.date);
        acc[dayOfWeek] = (acc[dayOfWeek] || 0) + 1;
        return acc;
    }, {});

    // Define the order of the days
    const daysOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const chartData = daysOrder.map(day => ({
        id: day,
        value: dataByDay[day] || 0,
    }));

    return (
        <Segment basic>
            <h2>Busiest days of the week</h2>
            <div style={{ height: '40vh' }}>
                <ResponsivePie
                    data={chartData}
                margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                innerRadius={0.5}
                padAngle={0.7}
                cornerRadius={3}
                activeOuterRadiusOffset={8}
                borderWidth={1}
                borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
                arcLinkLabelsSkipAngle={10}
                arcLinkLabelsTextColor="#333333"
                arcLinkLabelsThickness={2}
                arcLinkLabelsColor={{ from: 'color' }}
                arcLabelsSkipAngle={10}
                arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
                legends={[]}
            />
            </div>
        </Segment>
    );
};

export default ServiceConfirmationByDayPieChart;
