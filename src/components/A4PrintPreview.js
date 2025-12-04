import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Segment, Header, Container } from 'semantic-ui-react';
import MapWidget from './widgets/MapWidget'; // Adjust import path as needed
import QRCodeWidget from './widgets/QRCodeWidget'; // Adjust import path as needed
import MarkdownWidget from './widgets/MarkdownWidget'; // Adjust import path as needed
import ImageWidget from './widgets/ImageWidget'; // Adjust import path as needed
import DateWidget from './widgets/DateWidget'; // Adjust import path as needed
import apiWrapper from '../apiWrapper'; // Ensure this is the correct path to your API wrapper

const A4PrintPreview = React.forwardRef(({ selectedTemplateConfig, qrCodeData, qrCodeId }, ref) => {
  const [grid, setGrid] = useState([]);
  const [allWidgets, setAllWidgets] = useState([]);
  // const [qrCodeDataState, setQrCodeDataState] = useState(qrCodeData);
  const [localQRCodeData, setLocalQRCodeData] = useState(qrCodeData);
  const [logoUrl, setLogoUrl] = useState(null); // Local state to store logo URL
  // // console.log(`A4PP: A4PP called with this selectedTemplateConfig: `,selectedTemplateConfig)
  // // console.log(`A4PP: A4PP called with this qrCodeData: `,qrCodeData)
  // // console.log(`A4PP: A4PP called with this qrCodeId: `,qrCodeId)
  const fetchLogoUrl = async () => {
    // // console.log(`A4PP: FetchingLogoUrl`);
    try {
      const response = await apiWrapper.getLogo();
      // // // console.log(`Logo URL Fetched:`, response.logoUrl)
      setLogoUrl(response.logoUrl); // Update the state with the fetched logo URL
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  useEffect(() => {
    fetchLogoUrl(); // Fetch logo URL when component mounts
  }, []); // Empty dependency array to run only once

  const fetchSpecificQRCodeImage = useCallback(async (id) => {
    try {
      const response = await apiWrapper.generateQRCodeImage(id);
      const qrCodeImageUrl = response.data.urlToEmbed;
      setLocalQRCodeData(prevData => ({ ...prevData, qrCodeUrl: qrCodeImageUrl }));
    } catch (error) {
      console.error('Error fetching QR code image:', error);
    }
  }, [setLocalQRCodeData]); // useCallback depends on setLocalQRCodeData
  
  useEffect(() => {
    if (qrCodeId) {
      fetchSpecificQRCodeImage(qrCodeId);
    }
  }, [qrCodeId, fetchSpecificQRCodeImage]); // useEffect depends on qrCodeId and fetchSpecificQRCodeImage  

  useEffect(() => {
    // Fetch all widgets
    const fetchWidgets = async () => {
      try {
        const widgetResponse = await apiWrapper.getWidgets();
        // // // console.log("Fetched Widgets:", widgetResponse); // Debug log
        setAllWidgets(widgetResponse);
      } catch (error) {
        console.error('Error fetching widgets:', error);
      }
    };

    fetchWidgets();
  }, []);

  useEffect(() => {
    const initializeGrid = () => {
      if (selectedTemplateConfig && allWidgets.length > 0) {
        const layoutConfig = JSON.parse(selectedTemplateConfig).grid;
        const newGrid = layoutConfig.map(row =>
          row.map(cell => cell ? allWidgets.find(widget => widget.id === cell.widgetId) : null)
        );
        // // // console.log("Initialized Grid:", newGrid); // Debug log
        setGrid(newGrid);
      }
    };

    initializeGrid();
  }, [selectedTemplateConfig, allWidgets]);


  const renderWidget = (widget) => {
    // // // console.log(`Rendering Widget:`, widget)
    switch (widget.type) {
      case 'qrcode':
        // // console.log(`About to send this URL to QR Code widget:`, localQRCodeData.qrCodeUrl)
        return <QRCodeWidget qrCodeUrl={localQRCodeData.qrCodeUrl} />;
      case 'map':
        // // console.log(`About to send this latitude to Map widget:`, qrCodeData.latitude)
        return <MapWidget latitude={qrCodeData.latitude} longitude={qrCodeData.longitude} />;
      case 'markdown':
        // // console.log(`About to open Markdown widget`)
        return <MarkdownWidget
          icon={widget.icon}
          configuration={widget.configuration}
          isPreview={true}
          widgetId={widget.id} // Pass the widgetId to the MarkdownWidget
        />;
      case 'image':
        // // // console.log(`Logo URL being sent to widget:`, logoUrl);
        // // console.log(`About to send this logoUrl to Image widget:`, logoUrl)
        return <ImageWidget logoUrl={logoUrl} />;
      case 'date':
        // // console.log(`About to open Date widget`)
        return <DateWidget />;
      // Add more cases for other widget types
      default:
        // // console.log(`Doing a default case statement`)
        return null;
    }
  };

  const renderA4Page = () => {
    const totalHeight = 842; // Total height of the A4 container in pixels
    const headerHeight = 100; // Fixed height for the header
    const headerFooterHeight = (totalHeight - headerHeight) * 0.25; // Adjust the header/footer height
    const bodyHeight = (totalHeight - headerHeight) * 0.5; // 50% height for the body
    const cellPadding = '0.5'; // Set the desired padding value

    return (
      <Segment
      raised
      vertical
      padded='very'
      style={{
        minHeight: `${totalHeight}px`,
        width: '595px',
        padding: '25px',
        background: 'white',
        alignItems: 'center'
      }}
    >
        {/* Fixed header for branding */}
          <Header textAlign='center' style={{ color: '#ffffff', height: `${headerHeight}px`, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000', fontSize: '24px', fontWeight: 'bold' }}>
            Scan the didgUgo QR Code to Confirm You've Completed the Job
          </Header>
          {/* The rest of the A4 page content */}
          <Container style={{ width: '100%' }}>
            <Grid columns='equal'>
              {grid.map((row, rowIndex) => {
                let rowHeight = rowIndex === 1 ? bodyHeight : headerFooterHeight;
                return (
                  <Grid.Row key={rowIndex} style={{ height: `${rowHeight}px` }}>
                    {row.map((widget, colIndex) => {
                      let columnWidth = colIndex === 1 ? 10 : 3;
                      let cellStyle = {
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        padding: cellPadding,
                      };

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
    );
  };

  return (
<div ref={ref} style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      width: '100%', 
      height: '100%', 
      padding: '0px', // Add some padding around the content 
    }}>
      {renderA4Page()}
    </div>
  );
});

export default A4PrintPreview;
