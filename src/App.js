import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute'; // Import the ProtectedRoute component
import Layout from './Layout';
import LandingPage from './LandingPage';
import SignInForm from './SignInForm';
import RegistrationForm from './RegistrationForm';
import Confirmation from './Confirmation';
import ServiceConfirmationForm from './ServiceConfirmationForm';
import GenerateQRCode from './GenerateQRCode';
import ManageOrganisation from './ManageOrganisation';
import TagManagement from './ManageTags';
import TemplateManagement from './ManageTemplates';
import ManageServiceConfirmations from './ManageServiceConfirmations';
import Dashboard from './Dashboard';
import Verify from './components/AdminEmailVerification';
import OnboardingTour from './components/OnboardingTour';
import { useUser } from './UserContext';
import { TourProvider } from './context/TourContext';
import TourController from './TourController';
import NavigationHandler from './NavigationHandler';
import BusinessCaseBuilder from './BusinessCaseBuilder';

function MainApp() {
  const { isAdmin } = useUser();

  return (
    <TourProvider>
      <Router>
        <NavigationHandler />
        <Layout>
          <Routes>
            {/* Unprotected Routes */}
            <Route path="/signin" element={<SignInForm />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/business-case-builder" element={<BusinessCaseBuilder />} />

            {/* Protected Routes */}
            <Route path="/" element={<ProtectedRoute component={LandingPage} />} />
            <Route path="/confirmation" element={<ProtectedRoute component={Confirmation} />} />
            <Route path="/confirm-service" element={<ProtectedRoute component={ServiceConfirmationForm} />} />
            <Route path="/generate-qrcode" element={<ProtectedRoute component={GenerateQRCode} />} />
            <Route path="/manage-service-confirmations" element={<ProtectedRoute component={ManageServiceConfirmations} />} />
            <Route path="/manage-organisation" element={<ProtectedRoute component={ManageOrganisation} />} />
            <Route path="/tag-management" element={<ProtectedRoute component={TagManagement} />} />
            <Route path="/template-management" element={<ProtectedRoute component={TemplateManagement} />} />
            <Route path="/dashboard" element={<ProtectedRoute component={Dashboard} />} />
          </Routes>
        </Layout>
        <TourController />
        {isAdmin && <OnboardingTour />}
      </Router>
    </TourProvider>
  );
}

export default MainApp;
