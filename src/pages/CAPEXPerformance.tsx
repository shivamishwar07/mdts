import { Table, Card, DatePicker, Typography, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Dayjs } from 'dayjs';
import React, { useState } from 'react';
import '../styles/CAPEX-performance.css';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const { Title, Text } = Typography;

interface CapexData {
  key: React.Key;
  activity: string;
  totalApprovedBudget: number;
  actualExpensePreviousFY: number;
  remainingPreviousFY: number;
  approvedCurrentFY: number;
  approvedYTD: number;
  actualExpenseYTD: number;
  remainingYTD: number;
  budgetUtilizationYTD: string;
}

interface MetricCard {
  title: string;
  subInfo?: string;
}

const CAPEXPerformance: React.FC = () => {
  const [_selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  const columns: ColumnsType<CapexData> = [
    {
      title: 'Activity',
      dataIndex: 'activity',
      key: 'activity',
      className: 'capex-header',
    },
    {
      title: 'Total Approved Budget',
      dataIndex: 'totalApprovedBudget',
      key: 'totalApprovedBudget',
    },
    {
      title: 'Actual Expense till previous FY',
      dataIndex: 'actualExpensePreviousFY',
      key: 'actualExpensePreviousFY',
    },
    {
      title: 'Remaining total budget at the end of previous FY',
      dataIndex: 'remainingPreviousFY',
      key: 'remainingPreviousFY',
    },
    {
      title: 'Approved Budget for Current FY',
      dataIndex: 'approvedCurrentFY',
      key: 'approvedCurrentFY',
    },
    {
      title: 'Approved budget current FY (YTD)',
      dataIndex: 'approvedYTD',
      key: 'approvedYTD',
    },
    {
      title: 'Actual Expense for current FY (YTD)',
      dataIndex: 'actualExpenseYTD',
      key: 'actualExpenseYTD',
    },
    {
      title: 'Remaining budget for current FY (YTD)',
      dataIndex: 'remainingYTD',
      key: 'remainingYTD',
    },
    {
      title: '% budget utilization for current FY (YTD)',
      dataIndex: 'budgetUtilizationYTD',
      key: 'budgetUtilizationYTD',
    },
  ];


  const data: CapexData[] = [
    {
      key: 1,
      activity: 'Project Cost',
      totalApprovedBudget: 1744.75,
      actualExpensePreviousFY: 697.9,
      remainingPreviousFY: 1046.85,
      approvedCurrentFY: 436.19,
      approvedYTD: 130.86,
      actualExpenseYTD: 130.86,
      remainingYTD: 305.33,
      budgetUtilizationYTD: '30%',
    },
    {
      key: 2,
      activity: 'Land',
      totalApprovedBudget: 858.15,
      actualExpensePreviousFY: 343.26,
      remainingPreviousFY: 514.89,
      approvedCurrentFY: 214.54,
      approvedYTD: 64.36,
      actualExpenseYTD: 64.36,
      remainingYTD: 150.18,
      budgetUtilizationYTD: '30%',
    },
  ];

  const metrics: MetricCard[] = [
    { title: 'Total Project cost - 1745 Cr' },
    { title: 'EBIDTA Percentage' },
    { title: 'IRR (%)', subInfo: 'NPV (%)' },
    { title: 'PAT (%)', subInfo: 'PAT / Ton' },
    { title: 'ROE %', subInfo: 'ROCE%' },
  ];
  const COLORS = ['#3399ff', '#ffa07a'];

  const overallData = [
    { name: 'Budget utilized till date', value: 53 },
    { name: 'Remaining', value: 48 },
  ];

  const currentFYData = [
    { name: 'Approved budget current FY (YTD)', value: 50 },
    { name: 'Remaining', value: 50 },
  ];


  return (
    <div className="capex-container">
      <div className="title-and-filter">
        <Title level={3} className="capex-title"></Title>
        <div className="capex-date-row">
          <Text>Date:</Text>
          <DatePicker
            picker="month"
            onChange={(date) => setSelectedMonth(date)}
            className="capex-datepicker"
          />
        </div>
      </div>

      <div className="capex-cards-flex">
        {metrics.map((metric, index) => (
          <div className="capex-card-wrapper" key={index}>
            <Card className="capex-card">
              <Text>{metric.title}</Text>
              {metric.subInfo && (
                <>
                  <br />
                  <Text>{metric.subInfo}</Text>
                </>
              )}
            </Card>
          </div>
        ))}
      </div>

      <div className="capex-pie-charts">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Title level={4} className="capex-chart-title">Overall CAPEX Performance</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={overallData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {overallData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                   <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </Col>

          <Col xs={24} md={12}>
            <Title level={4} className="capex-chart-title">Current FY CAPEX - Performance</Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={currentFYData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {currentFYData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                   <Legend layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </Col>
        </Row>
      </div>

      <div className="capex-table-wrapper">
        <Table
          columns={columns}
          dataSource={data}
          bordered
          pagination={false}
          scroll={{ x: 2200 }}
          className="capex-table"
        />
      </div>


    </div>
  );
};

export default CAPEXPerformance;
