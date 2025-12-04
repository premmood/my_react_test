import React, { useState, useEffect } from 'react';
import { Segment, Dropdown, Divider, Form, Grid, Header, TextArea, Button, Input, Image } from 'semantic-ui-react';
import apiWrapper from '../apiWrapper';
import Markdown from 'react-markdown';

const WidgetConfiguration = ({ onSave }) => {
  const [widgets, setWidgets] = useState([]);
  const [widgetConfigIds, setWidgetConfigIds] = useState({});
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');
  // const [showConfiguration, setShowConfiguration] = useState(true);

  // States for Image Configurator
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // New function to fetch and update widgets
  const fetchAndUpdateWidgets = async () => {
    try {
      const fetchedWidgets = await apiWrapper.getWidgets();
      // Filter out widgets with 'NOT EDITABLE' in their configuration
      const editableWidgets = fetchedWidgets.filter(widget => widget.configuration !== 'NOT EDITABLE');

      const widgetOptions = editableWidgets.map(widget => ({
        key: widget.id,
        text: widget.content,
        value: widget.id,
        type: widget.type,
        description: widget.configuration,
        icon: widget.icon
      }));

      const configIds = fetchedWidgets.reduce((acc, widget) => {
        acc[widget.id] = widget.widgetConfigId;
        return acc;
      }, {});

      setWidgets(widgetOptions);
      setWidgetConfigIds(configIds);
    } catch (error) {
      console.error('Failed to fetch widgets:', error);
    }
  };

  useEffect(() => {
    fetchAndUpdateWidgets();
  }, []);

  const handleSaveMarkdown = async () => {
    const widgetConfigId = widgetConfigIds[selectedWidget.value];
    if (widgetConfigId && markdownContent) {
      try {
        await apiWrapper.updateWidgetConfiguration(widgetConfigId, { content: markdownContent });
        await fetchAndUpdateWidgets(); // Refresh the widgets list after successful save
        onSave();
      } catch (error) {
        console.error('Error updating configuration:', error);
      }
    } else {
      console.error('Missing widget configuration data or content');
    }
  };

  // Define the function to handle dropdown changes
  const handleWidgetChange = (e, { value }) => {
    const widget = widgets.find(w => w.value === value);
    setSelectedWidget(widget);

    if (widget && widget.type === 'markdown') {
      setMarkdownContent(widget.description);
      // onMarkdownChange(widget.description, widget.value);
    }
  };

  // Define the function to handle textarea changes
  const handleContentChange = (e, { value }) => {
    setMarkdownContent(value);
    if (selectedWidget) {
      // onMarkdownChange(value, selectedWidget.value);
    }
  };

/*   const handleToggleConfiguration = () => {
    setShowConfiguration(prevShow => !prevShow);
  };
 */

  // Function to handle file selection
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Function to handle image upload
  const handleUploadLogo = async () => {
    if (selectedFile) {
      const formData = new FormData();
      //// // console.log(selectedFile)
      formData.append('logo', selectedFile);
      try {
        //// // console.log(formData)
        // // console.log(`Before API Call in Component:`,[...formData])
        await apiWrapper.uploadLogo(formData);
        onSave(); // Notify parent component of the upload
        // Clear the selected file and preview URL
        setSelectedFile(null);
        setPreviewUrl(null);
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
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
    <Segment>
      <Header as='h2'>Select a Widget to Upload your Logo and Customise your PDF Text</Header>
      <Dropdown
        placeholder='Select Widget'
        fluid
        selection
        options={widgets}
        onChange={handleWidgetChange}
        style={{ fontSize: '1.2em', color: '#000000', ...customFocusStyle }}
      />
      <Divider />
      {selectedWidget && selectedWidget.type === 'markdown' && (
        <Form>
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column>
                <Form.Field>
                  <Header as='h3'>Edit Text</Header>
                  <TextArea
                    placeholder='Enter Markdown content here...'
                    value={markdownContent}
                    onChange={handleContentChange}
                    style={{ maxHeight: 50, ...customFocusStyle }}
                  />
                </Form.Field>
              </Grid.Column>
              <Grid.Column>
                <Form.Field>
                  <Header as='h3'>Preview</Header>
                  <Segment style={{ minHeight: 50 }}>
                    <Markdown>{markdownContent}</Markdown>
                  </Segment>
                </Form.Field>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <Divider />
          <Button.Group>
            <Button onClick={handleSaveMarkdown} primary>Save Configuration</Button>
            <Button.Or />
            <Button onClick={() => setSelectedWidget(null)}>Hide Configuration</Button>
          </Button.Group>
        </Form>
      )}
      {selectedWidget && selectedWidget.type === 'image' && (
        <Form>
          <Form.Field>
            <label>Upload Logo</label>
            <Input type='file' onChange={handleFileChange} accept='image/*' style={{ ...customFocusStyle }} />
          </Form.Field>
          {previewUrl && (
            <Segment>
              <Image src={previewUrl} size='small' centered />
            </Segment>
          )}
          <Divider />
          <Button.Group>
            <Button onClick={handleUploadLogo} primary>Upload Logo</Button>
            <Button.Or />
            <Button onClick={() => setSelectedWidget(null)}>Hide Configuration</Button>
          </Button.Group>
        </Form>
      )}
    </Segment>
  );  
};

export default WidgetConfiguration;
