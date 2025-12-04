import React, { createContext, useContext, useState } from 'react';

const PrintingContext = createContext();

export const usePrintingContext = () => useContext(PrintingContext);

export const PrintingProvider = ({ children }) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [ setDocumentTitle ] = useState('DefaultTitle'); // Default title

  // Update the document title
  const updateDocumentTitle = (title) => {
    setDocumentTitle(title);
    if (document.title) {
      document.title = title; // Set the document's title
    }
  };
  // // console.log('PrintingContext value:', { isPrinting, setIsPrinting, setDocumentTitle: updateDocumentTitle });

  return (
    <PrintingContext.Provider value={{ isPrinting, setIsPrinting, setDocumentTitle: updateDocumentTitle }}>
      {children}
    </PrintingContext.Provider>
  );
};
