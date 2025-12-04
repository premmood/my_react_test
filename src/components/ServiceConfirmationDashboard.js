import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

const ServiceConfirmationDashboard = () => {
    // Sample data
    const data = [
        { country: 'USA', value: Math.floor(Math.random() * 100) + 1 },
        { country: 'Germany', value: Math.floor(Math.random() * 100) + 1 },
        { country: 'France', value: Math.floor(Math.random() * 100) + 1 },
        { country: 'Canada', value: Math.floor(Math.random() * 100) + 1 },
        { country: 'Australia', value: Math.floor(Math.random() * 100) + 1 },
    ];
    

    return (
        <div style={{ height: 250 }}>
            <ResponsiveBar
                data={data}
                keys={['value']}
                indexBy="country"
                margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                padding={0.3}
                valueScale={{ type: 'linear' }}
                indexScale={{ type: 'band', round: true }}
                colors={{ scheme: 'nivo' }}
                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'country',
                    legendPosition: 'middle',
                    legendOffset: 32
                }}
                axisLeft={{
                    tickSize: 5,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: 'value',
                    legendPosition: 'middle',
                    legendOffset: -40
                }}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                legends={[
                    {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                            {
                                on: 'hover',
                                style: {
                                    itemOpacity: 1
                                }
                            }
                        ]
                    }
                ]}
                animate={true}
                motionStiffness={90}
                motionDamping={15}
            />
        </div>
    );
};

export default ServiceConfirmationDashboard;