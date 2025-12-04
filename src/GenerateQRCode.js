import React, { useState, useEffect, useRef } from 'react';
import apiWrapper from './apiWrapper';
import { useUser } from './UserContext';
import SmallMap from './components/SmallMap';
import MapWithGeocoder from './components/MapWithGeocoder';
import { Container, Divider, Dropdown, Modal, Button, Icon, Transition, Card, Input } from 'semantic-ui-react';
import CSVUploadComponent from './components/CSVUploadComponent'; // Import the CSV upload component
import A4PrintPreview from './components/A4PrintPreview';
import { PrintingProvider } from './PrintingContext';
import PrintButton from './components/PrintButton';

const GenerateQRCode = () => {
  const [qrCodeList, setQrCodeList] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [confirmModalIsOpen, setConfirmModalIsOpen] = useState(false);
  const [currentQRCodeId, setCurrentQRCodeId] = useState(null);
  const { orgId } = useUser();
  // const [selectedTags, setSelectedTags] = useState({});
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const { userId } = useUser();

  const printComponentRef = useRef();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState('');
  const [testingQRCodeId, setTestingQRCodeId] = useState(null); // State to track which QR code is being tested

  // Refresh QR codes without fetching tags
  const refreshQRCodes = async () => {
    try {
      const response = await apiWrapper.getAllQRCodes({ orgId });
      setQrCodeList(response.data);
    } catch (error) {
      console.error('An error occurred while fetching QR codes:', error);
    }
  };

  useEffect(() => {
    // Fetch QR codes without fetching tags
    const fetchQRCodes = async () => {
      try {
        const response = await apiWrapper.getAllQRCodes({ orgId });
        setQrCodeList(response.data);
      } catch (error) {
        console.error('An error occurred while fetching QR codes:', error);
      }
    };

    fetchQRCodes();
  }, [orgId]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const fetchedTemplates = await apiWrapper.getAllTemplates();
        setTemplates(fetchedTemplates);
        if (fetchedTemplates.length > 0) {
          setSelectedTemplate(fetchedTemplates[0].layoutConfig);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
      }
    };

    fetchTemplates();
  }, []);

  const generateQRCodeImageAndOpenModal = async (qrCodeId) => {
    try {
      openModal(qrCodeId);
    } catch (error) {
      console.error('An error occurred while generating the QR Code Image:', error);
    }
  };

  const deleteQRCode = async (qrCodeId) => {
    try {
      await apiWrapper.deleteQRCode(qrCodeId);
      setQrCodeList(prevList => prevList.filter(item => item.id !== qrCodeId));
      closeConfirmModal();
    } catch (error) {
      console.error('An error occurred while deleting the QR Code:', error);
    }
  };

  const openModal = (qrCodeId) => {
    setCurrentQRCodeId(qrCodeId);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setCurrentQRCodeId(null);
    setModalIsOpen(false);
  };

  const openConfirmModal = (qrCodeId) => {
    setCurrentQRCodeId(qrCodeId);
    setConfirmModalIsOpen(true);
  };

  const closeConfirmModal = () => {
    setCurrentQRCodeId(null);
    setConfirmModalIsOpen(false);
  };

  const filteredQRCodes = qrCodeList.filter(qrCode =>
    qrCode.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNewQRCodeClick = () => {
    setShowMapSection(true);
  };

  const handleImportAddressesClick = () => {
    setShowCSVUpload(!showCSVUpload);
    setShowMapSection(false);
  };

  const handleAddressSubmit = async (location) => {
    const { geometry, place_name } = location;
    try {
      const response = await apiWrapper.createQRCode({
        orgId,
        location: place_name,
        latitude: geometry.coordinates[1],
        longitude: geometry.coordinates[0],
      });
      const newQRCode = response.data;
      setQrCodeList(prevList => [...prevList, newQRCode]);
      setCurrentQRCodeId(newQRCode.id);
    } catch (error) {
      console.error('An error occurred while creating the new QR Code:', error);
    }
  };


  const [showMapSection, setShowMapSection] = useState(false);

  const selectedQRCodeData = qrCodeList.find(qrCode => qrCode.id === currentQRCodeId);
  const documentTitle = selectedQRCodeData ? formatTitle(selectedQRCodeData.location) : 'DefaultTitle';
  function formatTitle(title) {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  const firstQRCodeId = Math.min(...qrCodeList.map(qrCode => qrCode.id));


  const handleTestConfirmation = async (qrCode) => {
    setTestingQRCodeId(qrCode.id);
    setTestSuccessMessage('Service Confirmation Test Started...');
    try {
      const testConfirmationPayload = {
        userId: userId,
        qrCodeId: qrCode.id,
        location: qrCode.location,
        serviceType: 'Test Service',
        status: 'Admin Test',
      };

      const response = await apiWrapper.createServiceConfirmation(testConfirmationPayload);

      if (response.status === 201) {
        setTestSuccessMessage('Test Service Confirmation submitted successfully. Check the "Dashboards" or "Confirmations" screen to see the result.');
        setTimeout(() => {
          setTestSuccessMessage('');
          setTestingQRCodeId(null);
        }, 3000);
      } else {
        setTestingQRCodeId(null);
      }
    } catch (error) {
      console.error('An error occurred during the test confirmation:', error);
      setTestingQRCodeId(null);
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
    <PrintingProvider>
      <div className="ui center aligned basic segment">
        <div className="ui text container">
          <h1>Your didgUgo QR Codes</h1>
          <p>These are the QR Codes that you have created for your client's homes</p>
          <div className="ui basic divider"></div>
          <div className="ui search">
            <div className="ui icon input" style={{ ...customFocusStyle }}>
              <Input
                className="prompt"
                type="text"
                placeholder="Search QR codes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="search icon" />
            </div>
          </div>
          <div className="ui divider"></div>
          <button className="ui black big button tour-qr-create-button" onClick={handleCreateNewQRCodeClick}>Create New QR Codes</button>
          <button className="ui black big button tour-qr-import-button" onClick={handleImportAddressesClick}>Import Addresses</button>
        </div>
        <div className="ui divider"></div>
        {showCSVUpload && (
          <div>
            <CSVUploadComponent onProcessingComplete={refreshQRCodes} />
            <div className="ui divider"></div>
            <button className="ui black big button" onClick={() => setShowCSVUpload(false)}>Hide Import</button>
            <div className="ui divider"></div>
          </div>
        )}
        {showMapSection && (
          <div>
            <MapWithGeocoder onLocationSubmit={handleAddressSubmit} />
            <div className="ui divider"></div>
            <button className="ui black big button" onClick={() => setShowMapSection(false)}>Hide Map</button>
            <div className="ui divider"></div>
          </div>
        )}
        {testSuccessMessage && <div className="ui positive message">{testSuccessMessage}</div>}
        <Container className="center aligned fluid">
          <Card.Group>
            {filteredQRCodes.map(qrCode => (
              <Card style={{ minHeight: '250px', minWidth: '350px' }} key={qrCode.id}>
                <SmallMap latitude={qrCode.latitude} longitude={qrCode.longitude} />
                <Card.Content>
                  <Card.Header style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {qrCode.location}
                  </Card.Header>
                  <Divider />
                  <Card.Meta>
                    <div className="ui four buttons">
                      <Button color='green' onClick={() => generateQRCodeImageAndOpenModal(qrCode.id)}>Print QR</Button>
                      <Button
                        color='orange'
                        onClick={() => handleTestConfirmation(qrCode)}
                        disabled={testingQRCodeId === qrCode.id} // Disable only the button of the QR code being tested
                      >
                        Test QR
                      </Button>
                      <Button
                        color='red'
                        onClick={() => openConfirmModal(qrCode.id)}
                        disabled={qrCode.id === firstQRCodeId}  // Disable delete for the first QR code
                      >
                        Delete
                      </Button>
                    </div>
                  </Card.Meta>
                </Card.Content>
              </Card>
            ))}
          </Card.Group>
        </Container>
        {/* QR Code Display Modal */}
        <Modal dimmer='blurring' open={modalIsOpen} onClose={closeModal} size='small'>
          <Modal.Header>This is your didgUgo Custom QR Code</Modal.Header>
          <Modal.Actions>
            <PrintButton printComponentRef={printComponentRef} documentTitle={documentTitle} />
            <Button color='black' onClick={closeModal}>Close</Button>
          </Modal.Actions>
          <Modal.Content>
            <Dropdown
              placeholder='Select Template'
              fluid
              selection
              options={templates.map(template => ({ key: template.id, text: template.name, value: template.layoutConfig }))}
              value={selectedTemplate}
              onChange={(e, { value }) => setSelectedTemplate(value)}
              style={{ ...customFocusStyle }}
            />
            <Divider />
            {selectedQRCodeData && (
              <div id='printableArea'>
                <A4PrintPreview
                  ref={printComponentRef}
                  selectedTemplateConfig={selectedTemplate}
                  qrCodeData={selectedQRCodeData}
                  qrCodeId={currentQRCodeId} // Add this line to pass the specific QR code ID
                />
              </div>
            )}
          </Modal.Content>
        </Modal>
        {/* Confirmation Modal */}
        <Transition visible={confirmModalIsOpen} animation='fly up' duration={500}>
          <Modal open={confirmModalIsOpen} onClose={closeConfirmModal} size='tiny'>
            <Modal.Header>
              <Icon name='archive' />
              Confirm Deletion
            </Modal.Header>
            <Modal.Content>
              <p>Are you sure you want to delete this QR code?</p>
            </Modal.Content>
            <Modal.Actions>
              <Button basic color='red' onClick={() => deleteQRCode(currentQRCodeId)}>
                <Icon name='remove' /> Yes, please delete
              </Button>
              <Button color='green' onClick={closeConfirmModal}>
                <Icon name='checkmark' /> No, take me back
              </Button>
            </Modal.Actions>
          </Modal>
        </Transition>
      </div>
    </PrintingProvider>
  );
};

export default GenerateQRCode;