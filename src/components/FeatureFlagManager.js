import React, { useState, useEffect, useCallback } from 'react';
import { Tab, Card, Label, Button, Modal } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper';

const FeatureFlagManager = () => {
    const [featureFlags, setFeatureFlags] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFlag, setSelectedFlag] = useState(null);


    // Define your category-to-icon mapping object
    const categoryIcons = {
        'Management': 'configure',
        'Security': 'lock',
        'Functionality': 'settings',
        'Performance': 'line graph',
        'Content Management': 'folder open',
        'Personalisation': 'setting',
        'Integration': 'arrows alternate horizontal',
        'User Preferences': 'user',       
        // Add more category-to-icon mappings as needed
    };
      
    const fetchFeatureFlags = async () => {
        try {
            const response = await apiWrapper.getFeatureFlags();
            return response.data; // Assuming the response has the data in a 'data' field
        } catch (error) {
            console.error('Error fetching feature flags:', error);
            return []; // Return an empty array in case of an error
        }
    };

    const handleToggle = useCallback((flag) => {
        if (flag.featureSubGroup === 'Kill Switch' && !flag.isActiveToggle) {
            setSelectedFlag(flag);
            setIsModalOpen(true);
        } else {
            toggleFeatureFlag(flag);
        }
    }, []);
    
    const toggleFeatureFlag = async (flag) => {
        try {
            await apiWrapper.updateFeatureFlagStatus(flag.id, { isActiveToggle: !flag.isActiveToggle });
            setFeatureFlags(prevFlags =>
                prevFlags.map(prevFlag =>
                    prevFlag.id === flag.id
                        ? { ...prevFlag, isActiveToggle: !flag.isActiveToggle }
                        : prevFlag
                )
            );
        } catch (error) {
            console.error('Error toggling feature flag:', error);
        }
    };

    const handleModalConfirm = () => {
        toggleFeatureFlag(selectedFlag);
        setIsModalOpen(false);
        setSelectedFlag(null);
    };
    

    useEffect(() => {
        const initializeFeatureFlags = async () => {
            const flags = await fetchFeatureFlags();
            setFeatureFlags(flags);
        };

        initializeFeatureFlags();
    }, []);

    const renderPanes = () => {
        const groupedFlags = featureFlags.reduce((acc, flag) => {
          acc[flag.featureGroup] = acc[flag.featureGroup] || [];
          acc[flag.featureGroup].push(flag);
          return acc;
        }, {});
      
        const colors = [
            'black',
            'red',
            'purple',
            'green',
            'teal',
            'blue',
            'brown',
            'black',
          ];

        let colorIndex = 0; // Initialize the color index
      
        return Object.keys(groupedFlags).map((group) => {
          // Get the current color and increment the color index
          const color = colors[colorIndex];
          colorIndex = (colorIndex + 1) % colors.length; // Loop back to the start if we reach the end
      
          return {
            menuItem: group,
            render: () => (
                <Tab.Pane key={group}>
                    <div>
                        <h1>Configure Your <span style={{ color }}>{group}</span> Features</h1>
                    </div>
                    <div className="ui divider"></div>
                <Card.Group itemsPerRow={4}>
                  {groupedFlags[group].map((flag) => (
                    <Card key={flag.id} style={{ height: '250px', position: 'relative' }}>
                      <div className="ui center aligned basic segment">
                        <Label size='large' attached='top' icon={categoryIcons[group] || 'folder'} color={color}></Label>
                      </div>
                      <Card.Content style={{ height: '85%', overflow: 'auto' }}>
                        <Card.Header>{flag.longname}</Card.Header>
                        <Card.Meta>{flag.featureSubGroup}</Card.Meta>
                        <Card.Description>{flag.description}</Card.Description>
                      </Card.Content>
                      <div style={{ position: 'absolute', bottom: '10px', width: '100%', textAlign: 'center' }}>
                        <Button.Group>
                        <Button 
                            color={flag.isActiveToggle ? 'green' : null} 
                            active={flag.isActiveToggle} 
                            onClick={() => !flag.isActiveToggle && handleToggle(flag)}
                        >
                            On
                        </Button>
                        <Button.Or />
                        <Button 
                            color={!flag.isActiveToggle ? 'red' : null} 
                            active={!flag.isActiveToggle} 
                            onClick={() => flag.isActiveToggle && handleToggle(flag)}
                        >
                            Off
                        </Button>
                        </Button.Group>
                    </div>
                    </Card>
                  ))}
                </Card.Group>
              </Tab.Pane>
            ),
          };
        });
    };

    // Call renderPanes to render the tabs
    const panes = renderPanes();
    return (
        <>
            <Tab panes={panes} />
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                size='small'
            >
                <Modal.Header>Activate Kill Switch</Modal.Header>
                <Modal.Content>
                    <p>Are you sure you want to activate this Kill Switch?</p>
                </Modal.Content>
                <Modal.Actions>
                    <Button negative onClick={() => setIsModalOpen(false)}>
                        No
                    </Button>
                    <Button positive onClick={handleModalConfirm}>
                        Yes, I am sure
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    );
};

export default FeatureFlagManager;
