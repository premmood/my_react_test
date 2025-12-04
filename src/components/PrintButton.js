// PrintButton.js
import React from 'react';
import { Button } from 'semantic-ui-react';
import ReactToPrint from 'react-to-print';
import { usePrintingContext } from '../PrintingContext';
// PrintButton.js
const PrintButton = ({ printComponentRef, documentTitle }) => {
  const { setIsPrinting } = usePrintingContext();

  const handleBeforePrint = () => {
    setIsPrinting(true);
    if (document.title) {
      document.title = documentTitle; // Set the document's title before printing
    }
  };

  const handleAfterPrint = () => {
    setIsPrinting(false);
    // Optionally reset the document title after printing
  };

  return (
    <ReactToPrint
      trigger={() => <Button primary>Print</Button>}
      content={() => printComponentRef.current}
      onBeforePrint={handleBeforePrint}
      onAfterPrint={handleAfterPrint}
    />
  );
};


export default PrintButton;
