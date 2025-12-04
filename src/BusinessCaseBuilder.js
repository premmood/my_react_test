import React, { useState, useEffect } from 'react';
import { Grid, Segment, Table, Form, Divider, Container, Statistic, Accordion, Header, Transition, Portal, Button, List, ListHeader, ListItem } from 'semantic-ui-react';
import { Range, getTrackBackground } from 'react-range';
import apiWrapper from './apiWrapper';

const BusinessCaseCalculator = () => {
    const [configData, setConfigData] = useState({});
    const [inputValues, setInputValues] = useState({});
    const [calculationResult, setCalculationResult] = useState(null);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [percentValues, setPercentValues] = useState([0.15, 0.6]); // Starting values for easy and medium (hard is calculated)
    const [visible, setVisible] = useState(true);
    const [isPortalOpen, setIsPortalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const config = await apiWrapper.getConfigData();

            const transformedConfigData = config.referenceData.reduce((acc, item) => {
                acc[item.key] = item;
                return acc;
            }, {});
            setConfigData(transformedConfigData);

            // Initial values from main sliders
            const initialValues = sliderOrder.reduce((acc, key) => {
                if (transformedConfigData[key]) {
                    acc[key] = transformedConfigData[key].value;
                }
                return acc;
            }, {});

            // Calculate initial values for easy, medium, hard from percentValues
            const [easy, mediumStart] = percentValues;
            const medium = mediumStart - easy;
            const hard = 1 - mediumStart;

            // Combine all initial values
            const combinedInitialValues = {
                ...initialValues,
                "VAR_PERCENT_EASY_LINE_ITEMS": easy,
                "VAR_PERCENT_MEDIUM_LINE_ITEMS": medium,
                "VAR_PERCENT_HARD_LINE_ITEMS": hard
            };

            // Perform the initial calculation with combined initial values
            const result = await apiWrapper.calculateCustomerValue(combinedInitialValues);
            setCalculationResult(result.data.result);
            setInputValues(combinedInitialValues);
        };
        fetchData();
    }, []);

    // Note: handlePercentSliderChange will still be needed for subsequent updates after the initial load



    const handleInputChange = (name, value) => {
        setVisible(false);
        setInputValues(prevValues => ({ ...prevValues, [name]: value }));
    };

    const handleSliderChangeComplete = async (name, newValue) => {
        try {
            // Update the state with the new values
            // Update the inputValues with the latest value
            const updatedValues = { ...inputValues, [name]: newValue };
            // Call API with updated values
            const result = await apiWrapper.calculateCustomerValue(updatedValues);
            // Trigger the transition
            setCalculationResult(result.data.result);
            setInputValues(updatedValues);
            setTimeout(() => {
                setVisible(true);
            }, 150); // The timeout should match the duration of the transition

        } catch (error) {
            console.error('API Error:', error);
        }
    };

    const handleAccordionClick = (e, titleProps) => {
        const { index } = titleProps;
        const newIndex = activeIndex === index ? -1 : index;
        setActiveIndex(newIndex);
    };
    // This function only updates the local state as the slider is dragged
    const handlePercentSliderChange = (values) => {
        setPercentValues(values);
        // Optionally, you can also update the input values for live preview
        // but without calling the API
        const [easy, mediumStart] = values;
        const medium = mediumStart - easy;
        const hard = 1 - mediumStart;
        setVisible(false);
        setInputValues({
            ...inputValues,
            "VAR_PERCENT_EASY_LINE_ITEMS": easy,
            "VAR_PERCENT_MEDIUM_LINE_ITEMS": medium,
            "VAR_PERCENT_HARD_LINE_ITEMS": hard
        });
    };

    // This function is called when the user has finished adjusting the slider
    const handlePercentSliderFinalChange = async (values) => {
        const [easy, mediumStart] = values;
        const medium = mediumStart - easy;
        const hard = 1 - mediumStart;

        const updatedValues = {
            ...inputValues,
            "VAR_PERCENT_EASY_LINE_ITEMS": easy,
            "VAR_PERCENT_MEDIUM_LINE_ITEMS": medium,
            "VAR_PERCENT_HARD_LINE_ITEMS": hard
        };

        // Call the API with the updated values
        const result = await apiWrapper.calculateCustomerValue(updatedValues);
        setTimeout(() => {
            setVisible(true);
        }, 150); setCalculationResult(result.data.result);
    };

    const sliderOrder = [
        "VAR_TOTAL_CLIENTS",
        "VAR_RATIO_OUTSOURCING_RATE",
        "VAR_FTE_LOADED_COST_ANNUALLY",
        "VAR_EASY_LINE_ITEM_PROCESSING_TIME",
        "VAR_MEDIUM_LINE_ITEM_PROCESSING_TIME",
        "VAR_HARD_LINE_ITEM_PROCESSING_TIME"
    ];

    const formatResultValue = (format, value) => {
        // console.log(`USING CASE: `, format, value)
        switch (format) {
            case 'currency':
                return `$${Number(value).toFixed(0)}`; // Rounded to 0 decimal places
            case 'percentage':
                return `${((value))}`; // Multiplied by 100 and rounded to 0 decimal places
            case 'number':
                return Number(value).toFixed(0); // Rounded to 0 decimal places
            default:
                return value;
        }
    };

    // Function to calculate the percentages
    const calculatePercentages = () => {
        const [easyValue, mediumValue] = percentValues;
        const easy = easyValue * 100; // Convert to percentage
        const medium = (mediumValue - easyValue) * 100;
        const hard = (1 - mediumValue) * 100;
        return { easy, medium, hard };
    };

    const { easy, medium, hard } = calculatePercentages();

    const sectionTitles = {
        "AdminEffort": "Administrative Effort Processing Invoices - Detailed Estimates",
        "TimeSavings": "Before and After Time Savings with didgUgo - Detailed Estimates",
        "ReturnOnInvestment": "Return on Investment Profile - Detailed Estimates"
    };

    const sliderStyle = {
        minHeight: '150px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
    };

    const labelStyle = {
        fontSize: '16px',
        fontWeight: 'bold',
        marginBottom: '30px',
        padding: '5px'
    };

    return (
        <div>
            <Container fluid>
                <Segment basic>
                    <Header as="h1">didgUgo Customer Value Planning Tool</Header>
                    <p>See your live business case revealed as you use the sliders to fine-tune for your organisation's profile.</p>
                    <Form>
                        <Grid>
                            <Grid.Row >
                                {/* Sliders Column (75% width) */}
                                <Grid.Column width={12}>
                                    <Segment>
                                        <Grid stackable columns={3}>
                                            {sliderOrder.map(key => {
                                                const config = configData[key];
                                                return config ? (
                                                    <Grid.Column key={key} style={sliderStyle}>
                                                        <Form.Field>
                                                            <label style={labelStyle}>{config.label}</label>
                                                            <Range
                                                                step={config.step}
                                                                min={config.min}
                                                                max={config.max}
                                                                values={[inputValues[key]]}
                                                                onChange={(values) => handleInputChange(key, values[0])}
                                                                onFinalChange={(values) => handleSliderChangeComplete(key, values[0])}
                                                                renderMark={({ props, index }) => (
                                                                    <div
                                                                      {...props}
                                                                      style={{
                                                                        ...props.style,
                                                                        height: '8px',
                                                                        width: '1px',
                                                                        backgroundColor: '#548BF4'
                                                                      }}
                                                                    />
                                                                  )}
                                                                renderTrack={({ props, children }) => (
                                                                    <div
                                                                        onMouseDown={props.onMouseDown}
                                                                        onTouchStart={props.onTouchStart}
                                                                        style={{
                                                                            ...props.style,
                                                                            height: '36px',
                                                                            display: 'flex',
                                                                            width: '100%'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            ref={props.ref}
                                                                            style={{
                                                                                height: '5px',
                                                                                width: '100%',
                                                                                borderRadius: '4px',
                                                                                background: getTrackBackground({
                                                                                    values: [inputValues[key]],
                                                                                    colors: ['#548BF4', '#ccc'],
                                                                                    min: config.min,
                                                                                    max: config.max
                                                                                }),
                                                                                alignSelf: 'center'
                                                                            }}
                                                                        >
                                                                            {children}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                renderThumb={({ props, isDragged }) => (
                                                                    <div
                                                                        {...props}
                                                                        style={{
                                                                            ...props.style,
                                                                            height: '42px',
                                                                            width: '42px',
                                                                            borderRadius: '4px',
                                                                            backgroundColor: '#FFF',
                                                                            display: 'flex',
                                                                            justifyContent: 'center',
                                                                            alignItems: 'center',
                                                                            boxShadow: '0px 2px 6px #AAA'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            style={{
                                                                                position: 'absolute',
                                                                                top: '-28px',
                                                                                color: '#fff',
                                                                                fontWeight: 'bold',
                                                                                fontSize: '14px',
                                                                                fontFamily: 'Arial,Helvetica Neue,Helvetica,sans-serif',
                                                                                padding: '4px',
                                                                                borderRadius: '4px',
                                                                                backgroundColor: '#548BF4'
                                                                            }}
                                                                        >
                                                                            {formatResultValue(config.format, inputValues[key])}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            />
                                                        </Form.Field>
                                                    </Grid.Column>
                                                ) : null;
                                            })}
                                            {/* Percent Slider for Easy, Medium, Hard */}
                                            {/* New Row for the Percent Slider */}
                                            <Grid.Row>
                                                <Grid.Column width={16}> {/* Spanning all columns */}
                                                    <Form.Field>
                                                        <label style={labelStyle}>Percentage of Easy, Medium, Hard Line Items</label>
                                                        <Header as="h4" style={{ marginBottom: '10px' }}> {/* Additional styling may be needed */}
                                                            Easy: {easy.toFixed(1)}%; Medium: {medium.toFixed(1)}%; Hard: {hard.toFixed(1)}%
                                                        </Header>
                                                        <Range
                                                            min={0}
                                                            max={1}
                                                            step={0.01}
                                                            count={2} // Two thumbs
                                                            values={percentValues}
                                                            onChange={handlePercentSliderChange}
                                                            onFinalChange={handlePercentSliderFinalChange}
                                                            renderTrack={({ props, children }) => (
                                                                <div
                                                                    onMouseDown={props.onMouseDown}
                                                                    onTouchStart={props.onTouchStart}
                                                                    style={{
                                                                        ...props.style,
                                                                        height: '36px',
                                                                        display: 'flex',
                                                                        width: '100%'
                                                                    }}
                                                                >
                                                                    <div
                                                                        ref={props.ref}
                                                                        style={{
                                                                            height: '5px',
                                                                            width: '100%',
                                                                            borderRadius: '4px',
                                                                            background: getTrackBackground({
                                                                                values: percentValues,
                                                                                colors: ['green', 'orange', 'red'], // easy, medium, hard
                                                                                min: 0,
                                                                                max: 1
                                                                            }),
                                                                            alignSelf: 'center'
                                                                        }}
                                                                    >
                                                                        {children}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            renderThumb={({ props, index, isDragged }) => (
                                                                <div
                                                                    {...props}
                                                                    style={{
                                                                        ...props.style,
                                                                        height: '42px',
                                                                        width: '42px',
                                                                        borderRadius: '4px',
                                                                        backgroundColor: '#FFF',
                                                                        display: 'flex',
                                                                        justifyContent: 'center',
                                                                        alignItems: 'center',
                                                                        boxShadow: '0px 2px 6px #AAA'
                                                                    }}
                                                                >
                                                                </div>
                                                            )}
                                                        />
                                                    </Form.Field>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                    </Segment>
                                </Grid.Column>
                                {/* Additional Statistics Column (25% width) */}
                                <Grid.Column width={4}>
                                    {calculationResult && (
                                        <Segment basic>
                                            <Portal
                                                closeOnTriggerClick
                                                trigger={
                                                    <Button
                                                        size='big'
                                                        negative={isPortalOpen}
                                                        positive={!isPortalOpen}
                                                        content={isPortalOpen ? 'Hide Assumptions' : 'Show Assumptions'}
                                                    />
                                                }
                                                onOpen={() => setIsPortalOpen(true)}
                                                onClose={() => setIsPortalOpen(false)}>
                                                <Segment inverted style={{ left: '15%', position: 'fixed', top: '20%', zIndex: 1000 }}>
                                                    <Header>didgUgo Value Model Built-In Assumptions and Notes</Header>
                                                    <List>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }}>Efficiency</ListHeader>
                                                            We conservatively estimate that Service Confirmation data shortens the time for you to audit an invoice by 70%. It is the equivalent of a valid goods receipt to match against each invoice line item.
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }}>Adoption Rate</ListHeader>
                                                            We conservatively estimate that 60% of your outsourced Service Delivery jobs will be confirmed with didgUgo by your sub-contractors.
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }}>FTE Hours</ListHeader>
                                                            We calculate using an average of 162.5 hours per month capacity per FTE (37.5 hours per week).
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }} r>Data Sample to Validate didgUgo Value Model</ListHeader>
                                                            n=2,376 Aged Care clients of whom 658 receive services via sub-contractors (invoiced).
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }}>Data Source</ListHeader>
                                                            Surveys of multiple providers across the sector, open data resources (GEN) and other industry benchmarks. Last revised: H1, 2024.
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }}>Calculation Notes</ListHeader>
                                                            In all cases, we use conservative assumptions to avoid over-stating benefit. Formulas and assumptions are peer reviewed before publishing.
                                                        </ListItem>
                                                        <ListItem>
                                                            <ListHeader style={{ color: '#fff' }}>Last Update to Value Model</ListHeader>
                                                            January, 2024
                                                        </ListItem>
                                                    </List>
                                                    {/* You can add more content or components here */}
                                                </Segment>
                                            </Portal>
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic size='small' color='black'>
                                                    <Statistic.Value>{Math.round(calculationResult?.ReturnOnInvestment?.calcReturnOnInvestmentPerMonth?.value * 100)}%</Statistic.Value>
                                                    <Statistic.Label>Estimated Return on Investment</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                            <Divider hidden />
                                            <Divider hidden />
                                            <Divider hidden />
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic size='small' color='black'>
                                                    <Statistic.Value>{Math.round(calculationResult?.ReturnOnInvestment?.calcEstimatedFTEReduction?.value * 100)}%</Statistic.Value>
                                                    <Statistic.Label>Estimated FTE Effort Reduction</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                            <Divider hidden />
                                            <Divider hidden />
                                            <Divider hidden />
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic size='small' color='black'>
                                                    <Statistic.Value>{calculationResult?.TimeSavings?.calcInvoicesPerMonth?.value.toFixed(0)}</Statistic.Value>
                                                    <Statistic.Label>Average # Invoices for Sub-Contractor Services Processed Monthly</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                        </Segment>
                                    )}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>
                    </Form>
                    {calculationResult && (
                        <Segment basic style={{ minHeight: '180px' }}>
                            <Grid columns={3} stackable>
                                <Grid.Row>
                                    <Grid.Column>
                                        {calculationResult && (
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic color='red'>
                                                    <Statistic.Value>${(calculationResult?.AdminEffort?.totalMonthlyCostBeforeDidgUgo?.value / 1000).toFixed(2)}k</Statistic.Value>
                                                    <Statistic.Label>Monthly Invoicing Cost Without didgUgo</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {calculationResult && (
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic color='green'>
                                                    <Statistic.Value>${(calculationResult?.ReturnOnInvestment?.calcTotalMonthlyNetCostWithDidgUgo?.value / 1000).toFixed(2)}k</Statistic.Value>
                                                    <Statistic.Label>Monthly Invoicing Cost With didgUgo (incl. subscription)</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {calculationResult && (
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic color='blue'>
                                                    <Statistic.Value>${(calculationResult?.ReturnOnInvestment?.calcTotalMonthlyNetGainWithDidgUgo?.value / 1000).toFixed(2)}k</Statistic.Value>
                                                    <Statistic.Label>Monthly Net Gain</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                                <Grid.Row>
                                    <Grid.Column>
                                        {calculationResult && (
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic color='red'>
                                                    <Statistic.Value>{calculationResult?.ReturnOnInvestment?.calcFTERequiredBeforeDidgUgo?.value.toFixed(1)}</Statistic.Value>
                                                    <Statistic.Label>Equivalent FTE Processing Invoices Without didgUgo</Statistic.Label>
                                                </Statistic>
                                            </Transition>
                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {calculationResult && (
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic color='green'>
                                                    <Statistic.Value>{calculationResult?.ReturnOnInvestment?.calcFTERequiredAfterDidgUgo?.value.toFixed(1)}</Statistic.Value>
                                                    <Statistic.Label>Equivalent FTE Processing Invoices With didgUgo</Statistic.Label>
                                                </Statistic>
                                            </Transition>

                                        )}
                                    </Grid.Column>
                                    <Grid.Column>
                                        {calculationResult && (
                                            <Transition visible={visible} animation='slide up' duration={150} transitionOnMount={true}>
                                                <Statistic color='blue'>
                                                    <Statistic.Value>{Number(formatResultValue('number', calculationResult?.AdminEffort?.calcHoursSavedWithDidgUgo?.value)).toFixed(0)}</Statistic.Value>
                                                    <Statistic.Label>Hours Saved With DidgUgo Every Month</Statistic.Label>
                                                </Statistic>
                                            </Transition>

                                        )}
                                    </Grid.Column>
                                </Grid.Row>
                            </Grid>
                        </Segment>
                    )}
                    <Divider />
                    {calculationResult && (
                        <Accordion fluid styled>
                            {Object.entries(calculationResult).map(([section, values], idx) => (
                                <div key={section}>
                                    <Accordion.Title
                                        active={activeIndex === idx}
                                        index={idx}
                                        onClick={handleAccordionClick}
                                    >
                                        {sectionTitles[section] || section}
                                    </Accordion.Title>
                                    <Accordion.Content active={activeIndex === idx}>
                                        <Segment>
                                            <Table celled>
                                                <Table.Header>
                                                    <Table.Row>
                                                        <Table.HeaderCell>Label</Table.HeaderCell>
                                                        <Table.HeaderCell>Value</Table.HeaderCell>
                                                    </Table.Row>
                                                </Table.Header>
                                                <Table.Body>
                                                    {Object.entries(values).map(([name, field]) => (
                                                        <Table.Row key={name}>
                                                            <Table.Cell>{field.label || name}</Table.Cell>
                                                            <Table.Cell>{formatResultValue(field.format, field.value)}</Table.Cell>
                                                        </Table.Row>
                                                    ))}
                                                </Table.Body>
                                            </Table>
                                        </Segment>
                                    </Accordion.Content>
                                </div>
                            ))}
                        </Accordion>
                    )}
                </Segment>
            </Container>
        </div>
    );
};

export default BusinessCaseCalculator;
