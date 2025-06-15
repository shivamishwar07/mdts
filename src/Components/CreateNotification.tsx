import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Switch, Button, Select, Input, Table } from "antd";
import { ColumnsType } from "antd/es/table";
import { ArrowRightOutlined } from "@ant-design/icons";
import "../styles/notification.css";
const { Option } = Select;

type FormRow = {
  status: string;
  defaultMessage: string;
  personalizedMessage: string | string[];
  selectedDays?: string[];
  notificationEnabled: boolean;
};

type DelayedDropdownProps = {
  selectedDays: string[];
  onChange: (days: string[]) => void;
};

const DelayedDropdown: React.FC<DelayedDropdownProps> = ({ selectedDays, onChange }) => {
  const delayOptions = ["1 day", "7 days", "14 days", "30 days"];

  return (
    <Select
      mode="multiple"
      value={selectedDays}
      onChange={onChange}
      style={{ width: "130px", margin: "10px" }}
    >
      {delayOptions.map((option) => (
        <Option key={option} value={option}>
          {option}
        </Option>
      ))}
    </Select>
  );
};

type CreateNotificationProps = {
  open?: boolean | undefined;
  onClose?: () => void;
};

const CreateNotification: React.FC<CreateNotificationProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormRow[]>([
    { status: "Started", defaultMessage: "", personalizedMessage: "", notificationEnabled: false },
    { status: "Completed", defaultMessage: "", personalizedMessage: "", notificationEnabled: false },
    { status: "Delayed", defaultMessage: "", personalizedMessage: [], selectedDays: [], notificationEnabled: false },
  ]);

  const handlePersonalizedMessageChange = (index: number, value: string, dayIndex?: number) => {
    setForm((prevForm) => {
      const updatedForm = [...prevForm];
      if (dayIndex !== undefined && Array.isArray(updatedForm[index].personalizedMessage)) {
        updatedForm[index].personalizedMessage[dayIndex] = value;
      } else {
        updatedForm[index].personalizedMessage = value;
      }
      return updatedForm;
    });
  };

  const handleToggle = (index: number) => {
    setForm((prevForm) =>
      prevForm.map((row, i) =>
        i === index ? { ...row, notificationEnabled: !row.notificationEnabled } : row
      )
    );
  };

  const handleDaysChange = (index: number, days: string[]) => {
    setForm((prevForm) => {
      const updatedForm = [...prevForm];
      updatedForm[index].selectedDays = days;
      return updatedForm;
    });
  };

  const handleSave = () => {
    alert("Form saved successfully!");
    onClose?.();
    navigate("/modules");
  };

  const columns: ColumnsType<FormRow> = [
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record, index) => (
        <div>
          {text}
          {text === "Delayed" && (
            <DelayedDropdown
              selectedDays={record.selectedDays || []}
              onChange={(days) => handleDaysChange(index, days)}
            />
          )}
        </div>
      ),
    },
    {
      title: "Notification Setup",
      dataIndex: "notificationEnabled",
      key: "notificationEnabled",
      align: "center",
      render: (_value, _record, index) => (
        <Switch checked={form[index].notificationEnabled} onChange={() => handleToggle(index)} />
      ),
    },
    {
      title: "Personalized Message",
      dataIndex: "personalizedMessage",
      key: "personalizedMessage",
      render: (_value, record, index) => (
        <div>
          {record.status === "Delayed" && Array.isArray(record.personalizedMessage)
            ? record.selectedDays?.map((day, i) => (
              <Input
                key={i}
                value={record.personalizedMessage[i] || ""}
                onChange={(e) => handlePersonalizedMessageChange(index, e.target.value, i)}
                placeholder={`Message for ${day}`}
                style={{ marginBottom: "6px" }}
              />
            ))
            : (
              <Input
                value={record.personalizedMessage as string}
                onChange={(e) => handlePersonalizedMessageChange(index, e.target.value)}
                placeholder="Enter text here"
              />
            )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="main-notification-page">
        <div className="notification-heading">
          <div>Notification</div>
        </div>
        <div className="notification-items">
          <div className="notification-table">
            <Table
              columns={columns}
              dataSource={form.map((item, index) => ({ ...item, key: index }))}
              pagination={false}
              bordered
            />
          </div>
          <hr />
          <div className="notification-action-btns">
            <div>
              <Button className="bg-tertiary" style={{ marginRight: 10 }} onClick={onClose}>
                Cancel
              </Button>
              <Button type="primary" className="bg-secondary" onClick={handleSave} icon={<ArrowRightOutlined />}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateNotification;