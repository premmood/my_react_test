import React, { useState } from 'react';
import TemplateEditor from './components/TemplateEditor';
import WidgetConfiguration from './components/WidgetConfiguration';
import { Divider } from 'semantic-ui-react';

const ParentComponent = () => {
  // const [savedWidgets, setSavedWidgets] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [markdownContent ] = useState('');  // State for markdown content
  const [selectedWidgetId ] = useState(null); // State for selected widget ID

  const handleWidgetSave = (widgetId) => {
    setRefreshTrigger(widgetId);
  };

  // Update this function to handle markdown content changes
  /* const handleMarkdownChange = (content, widgetId) => {
    setMarkdownContent(content);
    setSelectedWidgetId(widgetId);
  }; */

  const handleWidgetConfigurationSave = () => {
    setRefreshTrigger(prev => !prev); // Toggle the refreshTrigger to force an update
};


  return (
    <div className="ui center aligned basic segment">
      {/* Your UI elements */}
      <div className="ui text container">
        <h1>Customise Your PDF Template</h1>
        <p>Update your PDF template settings here. Drag and Drop the widgets into the layout you want for your printed QR Codes</p>
      </div>
      <Divider />
      <WidgetConfiguration onSave={handleWidgetConfigurationSave} />
      <TemplateEditor
        onSave={handleWidgetSave}
        refreshTrigger={refreshTrigger}
        markdownContent={markdownContent}
        selectedWidgetId={selectedWidgetId}
      />
    </div>
  );
};

export default ParentComponent;
