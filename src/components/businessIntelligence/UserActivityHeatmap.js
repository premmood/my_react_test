import React from 'react';
import { ResponsiveHeatMap } from '@nivo/heatmap';
import { DateTime } from 'luxon';

const UserActivityHeatmap = () => {
    // Temporary hardcoded data with missing data points
    const data = [
        { timestamp: 1672548000000 }, // 2023-01-30 08:00:00
        { timestamp: 1672548000000 }, // 2023-01-30 08:00:00 (duplicate)
        { timestamp: 1672562400000 }, // 2023-01-30 12:00:00
        { timestamp: 1672627200000 }, // 2023-01-31 08:00:00
        // Missing data points for other hours...
    ];

    const heatmapData = processDataForHeatmap(data);

    if (!heatmapData || heatmapData.length === 0) {
        console.error("Heatmap data is empty or undefined.");
        return null;
    }

    return (
        <div style={{ height: '25vh' }}>
            <ResponsiveHeatMap
                data={heatmapData}
                keys={Array.from({ length: 24 }, (_, i) => i.toString())}
                indexBy="day"
                margin={{ top: 100, right: 60, bottom: 60, left: 60 }}
                forceSquare={true}
                axisTop={{ orient: 'top', tickSize: 5, tickPadding: 5, tickRotation: -90, legend: '', legendOffset: 36 }}
                axisRight={null}
                axisBottom={null}
                axisLeft={{ orient: 'left', tickSize: 5, tickPadding: 5, tickRotation: 0, legend: 'Day of the Week', legendPosition: 'middle', legendOffset: -40 }}
                cellOpacity={0.85}
                cellBorderColor={{ from: 'color', modifiers: [['darker', 0.4]] }}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.8]] }}
                defs={[
                    {
                        id: 'lines',
                        type: 'patternLines',
                        background: 'inherit',
                        color: 'rgba(0, 0, 0, 0.1)',
                        size: 4,
                        padding: 1,
                        stagger: true
                    }
                ]}
                fill={[{ id: 'lines' }]}
                animate={true}
                motionStiffness={80}
                motionDamping={9}
                hoverTarget="cell"
                cellHoverOthersOpacity={0.25}
            />
        </div>
    );
};

function processDataForHeatmap(data) {
    const counts = {};
    for (let day = 0; day < 7; day++) {
        counts[day] = Array(24).fill(null);
    }

    data.forEach(item => {
        const dateTime = DateTime.fromMillis(item.timestamp);
        if (dateTime.isValid) {
            const dayOfWeek = dateTime.weekday - 1;
            const hour = dateTime.hour;
            counts[dayOfWeek][hour] = (counts[dayOfWeek][hour] || 0) + 1;
        }
    });

    const heatmapData = Object.keys(counts).map(day => {
        const dayData = { day };
        counts[day].forEach((count, hour) => {
            dayData[hour.toString()] = count;
        });
        return dayData;
    });

    return heatmapData;
}

export default UserActivityHeatmap;
