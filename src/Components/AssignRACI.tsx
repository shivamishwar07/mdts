import React, { useState, useEffect } from "react";
import { Select, Table, Button, Checkbox } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { SelectValue } from "antd/lib/select";
import { getAllUsers, saveUsers } from '../Utils/moduleStorage'; // Add saveUsers function

const { Option } = Select;

type UserRole = {
  key: string;
  role: string;
  users: string[];
  state: string[];
  setState: React.Dispatch<React.SetStateAction<string[]>>;
};

const UserRolesPage: React.FC<{ open: boolean; onClose: () => void; selectedRow: any; moduleData: any }> = ({onClose, selectedRow, moduleData }) => {
  const [responsible, setResponsible] = useState<string[]>([]);
  const [accountable, setAccountable] = useState<string[]>([]);
  const [consulted, setConsulted] = useState<string[]>([]);
  const [informed, setInformed] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const allUsers = getAllUsers();
      if (allUsers.length === 0) {
        console.warn("No users found in localStorage.");
        return;
      }

      const userNames = allUsers.map((user: any) => user.name);
      setUsers(userNames);
    };

    fetchUsers();
  }, []);

  const handleChange = (value: SelectValue, setRole: React.Dispatch<React.SetStateAction<string[]>>) => {
    setRole(value as string[]);
  };

  const filteredUsers = users.filter((user) =>
    user.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSave = () => {
    // Get all users from local storage
    const allUsers = getAllUsers();

    // Define the roles and their corresponding states
    const roles = [
      { role: "Responsible", users: responsible },
      { role: "Accountable", users: accountable },
      { role: "Consulted", users: consulted },
      { role: "Informed", users: informed },
    ];

    // Iterate over each role
    roles.forEach(({ role, users }) => {
      // Iterate over each selected user for the role
      users.forEach((userName) => {
        // Find the user in the allUsers list
        const user = allUsers.find((u: any) => u.name === userName);
        if (user) {
          // Find or create the assignedModules object for the current module
          const moduleCode = moduleData.parentModuleCode;
          const moduleName = moduleData.moduleName;
          let assignedModule = user.assignedModules.find(
            (m: any) => m.moduleCode === moduleCode && m.moduleName === moduleName
          );

          if (!assignedModule) {
            // Create a new assignedModules object if it doesn't exist
            assignedModule = {
              moduleCode,
              moduleName,
              responsibilitiesOnActivities: [],
            };
            user.assignedModules.push(assignedModule);
          }

          // Find or create the activity object in responsibilitiesOnActivities
          const activityCode = selectedRow.code;
          let activity = assignedModule.responsibilitiesOnActivities.find(
            (a: any) => a.activityCode === activityCode
          );

          if (!activity) {
            // Create a new activity object if it doesn't exist
            activity = {
              activityCode,
              responsibilities: [],
            };
            assignedModule.responsibilitiesOnActivities.push(activity);
          }

          // Add the role to the responsibilities list if it doesn't already exist
          if (!activity.responsibilities.includes(role)) {
            activity.responsibilities.push(role);
          }
        }
      });
    });

    // Save the updated users list to local storage
    saveUsers(allUsers);

    // Close the popup
    onClose();

    // Navigate to the modules page
    navigate("/modules");
  };

  const columns = [
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Assigned Users",
      dataIndex: "users",
      key: "users",
      render: (_users: string[], record: UserRole) => (
        <Select
          mode="multiple"
          value={record.state}
          onChange={(value) => handleChange(value, record.setState)}
          style={{ width: "100%" }}
          placeholder="Search users"
          filterOption={false}
          onSearch={(value) => setUserSearch(value)}
        >
          {filteredUsers.map((user) => (
            <Option key={user} value={user}>
              <Checkbox checked={record.state.includes(user)} /> {user}
            </Option>
          ))}
        </Select>
      ),
    },
  ];

  const data: UserRole[] = [
    {
      key: "1",
      role: "Responsible",
      users: responsible,
      state: responsible,
      setState: setResponsible,
    },
    {
      key: "2",
      role: "Accountable",
      users: accountable,
      state: accountable,
      setState: setAccountable,
    },
    {
      key: "3",
      role: "Consulted",
      users: consulted,
      state: consulted,
      setState: setConsulted,
    },
    {
      key: "4",
      role: "Informed",
      users: informed,
      state: informed,
      setState: setInformed,
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        rowKey="key"
        style={{ marginTop: 10 }}
      />
      <div style={{ marginTop: 20, textAlign: "right" }}>
        <Button
          type="primary"
          style={{ fontSize: "16px" }}
          onClick={handleSave}
          icon={<ArrowRightOutlined />}
          className="bg-secondary"
        >
          Save
        </Button>
      </div>
    </>
  );
};

export default UserRolesPage;