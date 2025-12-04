import React from 'react';
import { Icon, Divider } from 'semantic-ui-react';
import Markdown from 'react-markdown';
// // console.log(`Markdown Widget Mounted`);

const MarkdownWidget = ({ icon, configuration, isPreview, widgetId }) => {
  // // console.log(`In Markdown Widget Function`);
  const markdownContent = configuration ? configuration : '';
  const shouldDisplayIcon = widgetId !== 5 && widgetId !== 6 && widgetId !== 7 ; // Don't display icon for widget IDs 5 or 6 or 7

  return (
    <div style={{ textAlign: 'center' }}>
      {shouldDisplayIcon && icon && <Icon size='huge' name={icon} />}
      <Divider hidden/>
      {isPreview
        ? <div style={{ padding: '0' }}><Markdown>{markdownContent}</Markdown></div>
        : <div style={{ border: '1px solid #ddd', padding: '1em' }}><Markdown>{markdownContent}</Markdown></div>
      }
    </div>
  );
};

export default MarkdownWidget;
