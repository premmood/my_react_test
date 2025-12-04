import ManageAuditLogs from './components/ManageAuditLogs'; // Import the new component
import FeatureFlagManager from './components/FeatureFlagManager';
import AdminManagement from './components/AdminManagement';
import TokenManagementComponent from './components/TokenManagementComponent';


const ManageOrganisation = () => {


  return (
    <div className="ui center aligned basic segment">
      <div className="ui basic segment">
        <div>
          <AdminManagement />
          <TokenManagementComponent />
          <ManageAuditLogs />
          <FeatureFlagManager />
        </div>
      </div>
    </div>
  );
};

export default ManageOrganisation;
