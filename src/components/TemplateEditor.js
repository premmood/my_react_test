import React, { useState, useEffect } from 'react';
import { useUser } from '../UserContext'; // Import useUser hook
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Dropdown, Message, Modal, Button, Input, Card, Grid, Icon, Segment, Header, Container, Divider } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper';
// import { widgetData } from './widgets/WidgetData';
import DateWidget from './widgets/DateWidget';
import ImageWidget from './widgets/ImageWidget';
import MapWidget from './widgets/MapWidget';
import MarkdownWidget from './widgets/MarkdownWidget';
import QRCodeWidget from './widgets/QRCodeWidget';

/* const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);

  // Remove the item from the source
  const [removedItem] = sourceClone.splice(droppableSource.index, 1);

  // Add the item to the destination
  destClone.splice(droppableDestination.index, 0, removedItem);

  return { sourceClone, destClone };
}; */

const reorder = (list, startIndex, endIndex) => {
  const newList = Array.from(list);
  const [movedItem] = newList.splice(startIndex, 1);
  newList.splice(endIndex, 0, movedItem);
  return newList;
};

const TemplateEditor = ({ onSave, refreshTrigger, markdownContent, selectedWidgetId }) => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [grid, setGrid] = useState(Array(3).fill(Array(3).fill(null))); // Initialize grid with null values
  const [qrCodeData, setQrCodeData] = useState(null);  // New state for QR code data
  const [isLoading, setIsLoading] = useState(true); // New loading state
  const [logoUrl, setLogoUrl] = useState(null);
  const [isGridModified, setIsGridModified] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('Default Template');


  const { orgId } = useUser(); // Use the useUser hook to access orgId

  const fetchTemplates = async () => {
    try {
      const fetchedTemplates = await apiWrapper.getAllTemplates();
      setTemplates(fetchedTemplates.map(template => ({ key: template.id, text: template.name, value: template.layoutConfig })));
      if (fetchedTemplates.length > 0) {
        setSelectedTemplate(fetchedTemplates[0].name); // Set default template
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  useEffect(() => {
    // // // console.log("useEffect triggered");
    fetchTemplates();
    const fetchTemplatesAndWidgets = async () => {
      try {
        const fetchedTemplates = await apiWrapper.getAllTemplates();
        if (fetchedTemplates.length > 0) {
          setTemplates(fetchedTemplates.map(template => ({ key: template.id, text: template.name, value: template.layoutConfig })));
          initializeGrid(fetchedTemplates[0].layoutConfig);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplatesAndWidgets();

    const initializeGrid = async () => {
      try {
        const widgetResponse = await apiWrapper.getWidgets();
        const templateResponse = await apiWrapper.getAllTemplates(); // Fetch all templates

        const template = templateResponse[0]; // Assuming we're interested in the first template
        const layoutConfig = JSON.parse(template.layoutConfig).grid; // Parse the layoutConfig JSON

        // Create a new grid layout based on the template
        const newGrid = layoutConfig.map(row =>
          row.map(cell => widgetResponse.find(widget => widget.id === cell.widgetId))
        );

        setGrid(newGrid);
        // Determine which widgets are not in the grid to populate the gallery
        const usedWidgetIds = layoutConfig.flat().map(cell => cell.widgetId);
        setGalleryItems(widgetResponse.filter(widget => !usedWidgetIds.includes(widget.id)));

      } catch (error) {
        console.error('Error initializing grid:', error);
      }
    };
    initializeGrid();

    const fetchQRCodeData = async () => {
      setIsLoading(true);
      try {
        const response = await apiWrapper.getAllQRCodes({ orgId });
        const qrCodes = response.data;

        if (qrCodes && qrCodes.length > 0) {
          setQrCodeData(qrCodes); // Store all QR code details
          // Fetch the QR code image for the first QR code
          fetchFirstQRCodeImage(qrCodes[0].id);
        } else {
          setQrCodeData('placeholder');
        }
      } catch (error) {
        console.error('Error fetching QR codes:', error);
        setQrCodeData('placeholder');
      } finally {
        setIsLoading(false);
      }
    };



    const fetchLogoUrl = async () => {
      try {
        const response = await apiWrapper.getLogo();
        //// // console.log(`Response.data`,response)
        setLogoUrl(response.logoUrl);
      } catch (error) {
        console.error('Error fetching logo:', error);
      }
    };


    initializeGrid();
    fetchQRCodeData();
    fetchLogoUrl();

  }, [refreshTrigger, orgId]);

  const initializeGrid = async (layoutConfig) => {
    const layout = JSON.parse(layoutConfig).grid;

    // Ensure widgetResponse is fetched before mapping
    const widgetResponse = await apiWrapper.getWidgets();

    const newGrid = layout.map(row =>
      row.map(cell => cell ? widgetResponse.find(widget => widget.id === cell.widgetId) : null)
    );

    setGrid(newGrid);
  };



  // Find the QR Code widget and set the initial grid with it in the middle cell
  const onDragEnd = (result) => {
    const { source, destination } = result;

    // Early return if no destination or trying to move the QR code
    if (!destination || (source.droppableId.includes('cell') && source.droppableId === `cell-1x1`)) {
      return;
    }

    if (source.droppableId === 'gallery' && destination.droppableId.includes('cell')) {
      // Moving from gallery to grid
      handleMoveGalleryToGrid(source, destination);
    } else if (source.droppableId.includes('cell') && destination.droppableId === 'gallery') {
      // Moving from grid to gallery
      handleMoveGridToGallery(source, destination);
    } else if (source.droppableId.includes('cell') && destination.droppableId.includes('cell')) {
      // Swapping within the grid
      handleSwapWithinGrid(source, destination);
    } else if (source.droppableId === 'gallery' && destination.droppableId === 'gallery') {
      // Reordering within the gallery
      handleReorderGallery(source, destination);
    }
    setIsGridModified(true);
  };

  const handleMoveGalleryToGrid = (source, destination) => {
    // // // console.log("Gallery items before move:", galleryItems);
    // // // console.log("Source index:", source.index);

    const item = galleryItems[source.index];
    // // // console.log("Item to move:", item);

    const [row, col] = destination.droppableId.split('-')[1].split('x').map(Number);
    // // // console.log(`Destination cell: [${row}, ${col}]`);

    // Check if the destination cell is in the middle column or contains a locked widget
    if (item.isLocked || row === 1 || col === 1) {
      // // // console.log("Destination cell is in the middle column or contains a locked widget. Aborting move.");
      return; // Prevent move if destination is middle column or contains a locked widget
    }

    if (grid[row][col]) {
      // // // console.log("Destination cell is not empty. Aborting move.");
      return; // If destination cell is not empty, do nothing
    }

    const newGrid = grid.map(row => [...row]);
    newGrid[row][col] = item;
    // // // console.log("New grid after adding item:", newGrid);
    setGrid(newGrid);

    const newGalleryItems = galleryItems.filter((_, idx) => idx !== source.index);
    // // // console.log("New gallery items after removal:", newGalleryItems);
    setGalleryItems(newGalleryItems);
  };



  const handleMoveGridToGallery = (source, destination) => {
    // // // console.log("Moving item from grid to gallery");

    const [row, col] = source.droppableId.split('-')[1].split('x').map(Number);
    // // // console.log(`Source cell: [${row}, ${col}]`);

    const item = grid[row][col];
    // // // console.log("Item to move:", item);

    // Check if the item is locked or in the middle column
    if (item.isLocked || row === 1 || col === 1) {
      // // // console.log("Item is locked or in the middle column. Aborting move.");
      return; // Prevent moving if item is locked or in the middle column
    }

    const newGrid = grid.map(row => [...row]);
    newGrid[row][col] = null;
    // // // console.log("New grid after removing item:", newGrid);
    setGrid(newGrid);

    const newGalleryItems = [...galleryItems];
    newGalleryItems.splice(destination.index, 0, item);
    // // // console.log("New gallery items after adding item:", newGalleryItems);
    setGalleryItems(newGalleryItems);
  };



  const handleSwapWithinGrid = (source, destination) => {
    const [sourceRow, sourceCol] = source.droppableId.split('-')[1].split('x').map(Number);
    const [destRow, destCol] = destination.droppableId.split('-')[1].split('x').map(Number);

    const sourceItem = grid[sourceRow][sourceCol];
    const destItem = grid[destRow][destCol];

    // Check if the source or destination item is locked or in the middle column
    if ((sourceItem && sourceItem.isLocked) || (destItem && destItem.isLocked) || sourceRow === 1 || destRow === 1 || sourceCol === 1 || destCol === 1) {
      // // // console.log("Either source or destination item is locked or in the middle column. Aborting swap.");
      return; // Prevent swap if either item is locked or in the middle column
    }

    const newGrid = [...grid];
    newGrid[sourceRow][sourceCol] = destItem;
    newGrid[destRow][destCol] = sourceItem;
    setGrid(newGrid);
  };


  const handleReorderGallery = (source, destination) => {
    const reorderedGalleryItems = reorder(galleryItems, source.index, destination.index);
    setGalleryItems(reorderedGalleryItems);
  };

  const handleModalToggle = () => setIsModalOpen(prev => !prev);

  /*   const handleTemplateChange = (e, { value }) => {
      const selectedTemplate = templates.find(template => template.value === value);
      if (selectedTemplate) {
        setSelectedTemplate(selectedTemplate.text);
        initializeGrid(selectedTemplate.value);
      }
    };
   */
  const handleSaveAsNewTemplate = async () => {
    if (!newTemplateName) {
      setSuccessMessage('Please enter a template name');
      setShowSuccessMessage(true);
      return;
    }

    const newTemplateConfig = {
      name: newTemplateName,
      layoutConfig: JSON.stringify({ grid: grid.map(row => row.map(cell => cell ? { widgetId: cell.id, widgetConfigId: cell.configId } : null)) }),
      isActive: true
    };

    try {
      await apiWrapper.createNewTemplate(newTemplateConfig.name, newTemplateConfig.layoutConfig);
      setSuccessMessage('Template saved successfully!');
      setShowSuccessMessage(true);
      setIsGridModified(false);
      setIsModalOpen(false);
      setNewTemplateName('');
      setTimeout(() => setShowSuccessMessage(false), 2000);
      await fetchTemplates(); // Refresh templates list
    } catch (error) {
      console.error('Error saving template:', error);
      setSuccessMessage('Error saving template');
      setShowSuccessMessage(true);
    }
  };

  const renderGrid = () => {
    const fixedHeight = '200px'; // Set a fixed height for all grid items
    const fixedWidth = '225px'; // Set a fixed width for all grid items

    return grid.map((row, rowIndex) => (
      <Grid.Row key={rowIndex}>
        {row.map((cell, colIndex) => {
          const isMiddleColumn = colIndex === 1;
          const isMiddleRow = rowIndex === 1;
          const isDragDisabled = (cell && cell.isLocked) || isMiddleRow || isMiddleColumn;
          return (
            <Grid.Column key={`${rowIndex}-${colIndex}`}>
              <Droppable droppableId={`cell-${rowIndex}x${colIndex}`} isDropDisabled={isDragDisabled}>
                {(provided, snapshot) => (
                  <Segment
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      ...getListStyle(snapshot.isDraggingOver, !cell),
                      height: fixedHeight, // Apply the fixed height here
                      width: fixedWidth, // Apply the fixed width here
                      display: 'flex', // Use flex to center content vertically
                      alignItems: 'center', // Center content vertically
                    }}
                  >
                    {cell ? (
                      <Draggable key={cell.id.toString()} draggableId={cell.id.toString()} index={0} isDragDisabled={isDragDisabled}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                          >
                            {renderItem(cell)}
                          </div>
                        )}
                      </Draggable>
                    ) : "Drop widget here"}
                    {provided.placeholder}
                  </Segment>
                )}
              </Droppable>
            </Grid.Column>
          );
        })}
      </Grid.Row>
    ));
  };


  // Temporarily hidden - fix later.

  /* const renderGallery = () => {
    // Check if galleryItems is defined and has items before filtering and mapping
    if (!galleryItems || galleryItems.length === 0) {
      return null; // Return null or some placeholder if galleryItems is not ready
    }
  
    // Assuming the QR Code widget is not to be displayed in the gallery
    const filteredGalleryItems = galleryItems.filter(item => item.type !== 'qrcode');
  
    return (
      <Droppable droppableId="gallery">
        {(provided, snapshot) => (
          <Segment
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={{
              ...getListStyle(snapshot.isDraggingOver),
            }}
          >
            {filteredGalleryItems.map((item, index) => (
              <Draggable key={item.id.toString()} draggableId={item.id.toString()} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...getItemStyle(snapshot.isDragging, provided.draggableProps.style), marginRight: '8px' }}
                  >
                    {renderItem(item)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </Segment>
        )}
      </Droppable>
    );
  }; */




  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: 'none',
    padding: 8,
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    padding: 8,
    background: isDraggingOver ? '#d3d3d3' : '#f0f0f0', // Dark grey when dragging over, lighter grey otherwise
    minHeight: '175px',
    // Add other styles as needed
  });

  const renderItem = (item) => (
    <Card
      centered
      raised
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '180px', // Set fixed height for widgets
        width: '180px', // Optional: set width to fill the container
        overflow: 'hidden' // Optional: prevent content from overflowing
      }}
    >
      <Card.Content textAlign='center'>
        <Icon size={'huge'} name={item.icon} />
        <Divider hidden />
        {item.content && <Card.Header style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.content}</Card.Header>}
        {item.isLocked && <Icon name='lock' />} {/* Display padlock icon if locked */}
      </Card.Content>
    </Card>
  );

  /*   const fetchFirstQRCodeData = async () => {
      try {
        // // // console.log("Calling getAllQRCodes API");
        // Fetch all QR codes with the logged on user's Org ID from user context.
        const response = await apiWrapper.getAllQRCodes({ orgId }); // Pass orgId to API call
        const qrCodes = response.data;
  
        if (qrCodes && qrCodes.length > 0) {
          // Fetch the payload for the first QR code
          const firstQRCodeId = qrCodes[0].id;
          const qrCodeResponse = await apiWrapper.generateQRCodeImage(firstQRCodeId);
          return qrCodeResponse.data; // Return the payload for the first QR code
        } else {
          return 'placeholder'; // No QR codes available, return 'placeholder'
        }
      } catch (error) {
        console.error('Error fetching first QR code:', error);
        return 'placeholder'; // In case of an error, return 'placeholder'
      }
    }; */

  const fetchFirstQRCodeImage = async (firstQRCodeId) => {
    try {
      const qrCodeResponse = await apiWrapper.generateQRCodeImage(firstQRCodeId);
      setQrCodeData(prevData => {
        return prevData.map(qrCode => qrCode.id === firstQRCodeId
          ? { ...qrCode, qrCodeUrl: qrCodeResponse.data.urlToEmbed }
          : qrCode);
      });
    } catch (error) {
      console.error('Error fetching QR code image:', error);
    }
  };


  const renderWidget = (widget) => {
    // Check if markdownContent is defined before calling toString
    /*     const content = markdownContent ? markdownContent.toString() : '';
     */
    switch (widget.type) {
      case 'date':
        return <DateWidget configuration={widget.configuration} />;
      case 'image':
        if (widget.type === 'image') {
          // // // console.log(`Rendering Logo Widget:`, logoUrl);
          return <ImageWidget logoUrl={logoUrl} />;
        }
        break;
      case 'map':
        if (widget.type === 'map') {
          // Use the latitude and longitude from the first QR code for the MapWidget
          // // // console.log(`QR Code Data from Map Case:`,qrCodeData)
          if (widget.type === 'map') {
            // Render the MapWidget with the first QR code's latitude and longitude
            return isLoading || !qrCodeData || qrCodeData === 'placeholder'
              ? <Segment basic>Loading map...</Segment>
              : <MapWidget latitude={qrCodeData[0].latitude} longitude={qrCodeData[0].longitude} />;
          }
        }
        break;
      case 'markdown':
        return <MarkdownWidget
          icon={widget.icon}
          configuration={widget.configuration}
          isPreview={true}
          widgetId={widget.id} // Pass the widgetId to the MarkdownWidget
        />;
      case 'qrcode':
        // Use the fetched QR code data for the QR code widget
        if (widget.type === 'qrcode') {
          const firstQRCode = qrCodeData && qrCodeData[0];
          return isLoading || !firstQRCode || firstQRCode === 'placeholder' || !firstQRCode.qrCodeUrl
            ? <div>Loading QR Code...</div>
            : <QRCodeWidget qrCodeUrl={firstQRCode.qrCodeUrl} />;
        }
        break;
      default:
        return null;  // Render nothing for unrecognized types
    }
  };


  const renderA4Page = () => {
    const totalHeight = 842; // Total height of the A4 container in pixels
    const headerHeight = 100; // Fixed height for the header
    const headerFooterHeight = (totalHeight - headerHeight) * 0.25; // Adjust the header/footer height based on the new header
    const bodyHeight = (totalHeight - headerHeight) * 0.5; // 50% height for the body
    const cellPadding = '0.5'; // Set the desired padding value

    return (
      <Grid.Column width={8} textAlign='center'>
        <Header as='h2'>PDF Template: {selectedTemplate}</Header>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Segment
            raised
            vertical
            padded='very'
            style={{
              minHeight: totalHeight + 'px',
              width: '595px',
              padding: '25px',
              background: 'white',
              transform: 'scale(0.9)',
              // transformOrigin might be adjusted or removed based on your layout needs
            }}
          >
            {/* Fixed header for didgUgo branding */}
            <Header style={{ color: '#ffffff', height: `${headerHeight}px`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000', fontSize: '24px', fontWeight: 'bold' }}>
              Scan the didgUgo QR Code to Confirm You've Completed the Job
            </Header>
            {/* The rest of the A4 page content */}
            <Container style={{ width: '100%' }}>
              <Grid columns='equal'>
                {grid.map((row, rowIndex) => {
                  let rowHeight = rowIndex === 1 ? bodyHeight : headerFooterHeight;

                  return (
                    <Grid.Row key={rowIndex} style={{ height: rowHeight + 'px' }}>
                      {row.map((widget, colIndex) => {
                        let columnWidth = colIndex === 1 ? 10 : 3;
                        let cellStyle = {
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '100%',
                          padding: cellPadding,
                        };

                        // Adjust style for Map Widget
                        if (widget && widget.type === 'map' && colIndex === 1) {
                          cellStyle = {
                            ...cellStyle,
                            width: '100%', // Map widget takes full width in the middle column
                          };
                        }

                        return (
                          <Grid.Column key={`${rowIndex}-${colIndex}`} width={columnWidth} style={cellStyle}>
                            {widget && renderWidget(widget)}
                          </Grid.Column>
                        );
                      })}
                    </Grid.Row>
                  );
                })}
              </Grid>
            </Container>
          </Segment>
        </div>
      </Grid.Column>
    );
  };

  // Custom focus style
  const customFocusStyle = {
    backgroundColor: '#e8f0fe', // Light blue background
    borderColor: '#2185d0', // Semantic UI primary color
    outline: 'none',
    boxShadow: '0 0 0 0.2rem rgba(33, 133, 208, 0.25)',
  };
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Modal open={isModalOpen} onClose={handleModalToggle}>
        <Modal.Header>Save As New Template</Modal.Header>
        <Modal.Content>
          <Input
            placeholder="Enter template name"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            style={{ ...customFocusStyle }}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleModalToggle}>Cancel</Button>
          <Button positive onClick={handleSaveAsNewTemplate}>Save</Button>
        </Modal.Actions>
      </Modal>
      {isGridModified && (
        <Button size='big' color='black' onClick={() => setIsModalOpen(true)}>
          Save as New Template
        </Button>
      )}
      {isGridModified && (
        <Divider hidden />
      )}
      {showSuccessMessage && (
        <Message positive={successMessage.includes('successfully')} negative={successMessage.includes('Error')}>
          {successMessage}
        </Message>
      )}
      <Segment>
        <Grid>
          <Grid.Row>
            <Grid.Column width={8}>
              <Dropdown
                placeholder='Select PDF Template'
                fluid
                selection
                options={templates}
                value={selectedTemplate}
                onChange={(e, { value }) => {
                  const selectedTemplate = templates.find(template => template.value === value);
                  if (selectedTemplate) {
                    setSelectedTemplate(selectedTemplate.text);
                    initializeGrid(selectedTemplate.value);
                  }
                }}
                style={{ ...customFocusStyle }}
              />
              <Header as='h2' textAlign='center'>Drag and Drop Grid to Create New PDF Template</Header>
              <Grid container centered columns={3}>
                {renderGrid()}
              </Grid>
            </Grid.Column>
            <Grid.Column width={8} textAlign='center'>
              {renderA4Page()}
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    </DragDropContext>
  );
};

export default TemplateEditor;