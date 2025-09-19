import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create the ApplicationContext
const ApplicationContext = createContext();

export const useApplicationContext = () => {
  return useContext(ApplicationContext);
};

export const ApplicationProvider = ({ children }) => {
  const [applicationData, setApplicationData] = useState(null);

  const fetchApplicationDetails = async (username) => {
    try {
      const response = await axios.get(`/application-detail/${username}`);  // Assuming API endpoint is setup
      if (response.data && response.data.data) {
        setApplicationData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching application details:', error);
    }
  };

  return (
    <ApplicationContext.Provider value={{ applicationData, fetchApplicationDetails }}>
      {children}
    </ApplicationContext.Provider>
  );
};
