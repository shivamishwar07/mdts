// import React, { useMemo, useState } from "react";
// import { Card, DatePicker, Row, Col, Table, Typography } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import type { Dayjs } from "dayjs";
// import "../styles/CAPEX-performance.css";
// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

// const { Title, Text } = Typography;

// interface CapexData {
//   key: React.Key;
//   activity: string;
//   totalApprovedBudget: number;
//   actualExpensePreviousFY: number;
//   remainingPreviousFY: number;
//   approvedCurrentFY: number;
//   approvedYTD: number;
//   actualExpenseYTD: number;
//   remainingYTD: number;
//   budgetUtilizationYTD: string;
// }

// interface MetricCard {
//   title: string;
//   subInfo?: string;
// }

// const formatCr = (n: number) =>
//   new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// const CAPEXPerformance: React.FC = () => {
//   const [_selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

//   const columns: ColumnsType<CapexData> = useMemo(
//     () => [
//       {
//         title: "Activity",
//         dataIndex: "activity",
//         key: "activity",
//         fixed: "left",
//         width: 180,
//         render: (v: string) => <span className="capex-activity">{v}</span>,
//       },
//       {
//         title: "Total Approved Budget",
//         dataIndex: "totalApprovedBudget",
//         key: "totalApprovedBudget",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "Actual Expense till previous FY",
//         dataIndex: "actualExpensePreviousFY",
//         key: "actualExpensePreviousFY",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "Remaining total budget at the end of previous FY",
//         dataIndex: "remainingPreviousFY",
//         key: "remainingPreviousFY",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "Approved Budget for Current FY",
//         dataIndex: "approvedCurrentFY",
//         key: "approvedCurrentFY",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "Approved budget current FY (YTD)",
//         dataIndex: "approvedYTD",
//         key: "approvedYTD",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "Actual Expense for current FY (YTD)",
//         dataIndex: "actualExpenseYTD",
//         key: "actualExpenseYTD",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "Remaining budget for current FY (YTD)",
//         dataIndex: "remainingYTD",
//         key: "remainingYTD",
//         render: (v: number) => `${formatCr(v)}`,
//       },
//       {
//         title: "% budget utilization for current FY (YTD)",
//         dataIndex: "budgetUtilizationYTD",
//         key: "budgetUtilizationYTD",
//         render: (v: string) => <span className="capex-pill">{v}</span>,
//       },
//     ],
//     []
//   );

//   const data: CapexData[] = [
//     {
//       key: 1,
//       activity: "Project Cost",
//       totalApprovedBudget: 1744.75,
//       actualExpensePreviousFY: 697.9,
//       remainingPreviousFY: 1046.85,
//       approvedCurrentFY: 436.19,
//       approvedYTD: 130.86,
//       actualExpenseYTD: 130.86,
//       remainingYTD: 305.33,
//       budgetUtilizationYTD: "30%",
//     },
//     {
//       key: 2,
//       activity: "Land",
//       totalApprovedBudget: 858.15,
//       actualExpensePreviousFY: 343.26,
//       remainingPreviousFY: 514.89,
//       approvedCurrentFY: 214.54,
//       approvedYTD: 64.36,
//       actualExpenseYTD: 64.36,
//       remainingYTD: 150.18,
//       budgetUtilizationYTD: "30%",
//     },
//   ];

//   const metrics: MetricCard[] = [
//     { title: "Total Project cost - 1745 Cr" },
//     { title: "EBITDA Percentage" },
//     { title: "IRR (%)", subInfo: "NPV (%)" },
//     { title: "PAT (%)", subInfo: "PAT / Ton" },
//     { title: "ROE %", subInfo: "ROCE%" },
//   ];

//   const COLORS = ["#1F7A63", "#34D399"];

//   const overallData = [
//     { name: "Budget utilized till date", value: 53 },
//     { name: "Remaining", value: 48 },
//   ];

//   const currentFYData = [
//     { name: "Approved budget current FY (YTD)", value: 50 },
//     { name: "Remaining", value: 50 },
//   ];

//   return (
//     <div className="capex-container">
//       <div className="capex-header-row">
//         <div className="capex-heading">
//           <Title level={5} className="capex-title">
//             CAPEX Performance
//           </Title>
//           <Text className="capex-subtitle">Budget utilization overview with FY breakdown and activity-wise details.</Text>
//         </div>

//         <div className="capex-date-row">
//           <Text className="capex-date-label">Date</Text>
//           <DatePicker picker="month" onChange={(date) => setSelectedMonth(date)} className="capex-datepicker" />
//         </div>
//       </div>

//       <div className="capex-cards-flex">
//         {metrics.map((metric, index) => (
//           <Card className="capex-card" key={index}>
//             <Text className="capex-metric">{metric.title}</Text>
//             {metric.subInfo ? <Text className="capex-metric-sub">{metric.subInfo}</Text> : null}
//           </Card>
//         ))}
//       </div>

//       <div className="capex-charts">
//         <Row gutter={[16, 16]}>
//           <Col xs={24} md={12}>
//             <Card className="capex-chart-card">
//               <div className="capex-chart-head">
//                 <Title level={4} className="capex-chart-title">
//                   Overall CAPEX Performance
//                 </Title>
//                 <Text className="capex-chart-meta">Utilized vs remaining till date</Text>
//               </div>

//               <div className="capex-chart-wrap">
//                 <ResponsiveContainer width="100%" height={280}>
//                   <PieChart>
//                     <Pie
//                       data={overallData}
//                       dataKey="value"
//                       nameKey="name"
//                       outerRadius={95}
//                       innerRadius={55}
//                       label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
//                     >
//                       {overallData.map((_entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend layout="vertical" align="right" verticalAlign="middle" />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </Card>
//           </Col>

//           <Col xs={24} md={12}>
//             <Card className="capex-chart-card">
//               <div className="capex-chart-head">
//                 <Title level={4} className="capex-chart-title">
//                   Current FY CAPEX Performance
//                 </Title>
//                 <Text className="capex-chart-meta">YTD approved vs remaining</Text>
//               </div>

//               <div className="capex-chart-wrap">
//                 <ResponsiveContainer width="100%" height={280}>
//                   <PieChart>
//                     <Pie
//                       data={currentFYData}
//                       dataKey="value"
//                       nameKey="name"
//                       outerRadius={95}
//                       innerRadius={55}
//                       label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
//                     >
//                       {currentFYData.map((_entry, index) => (
//                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                     <Legend layout="vertical" align="right" verticalAlign="middle" />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </Card>
//           </Col>
//         </Row>
//       </div>

//       <Card className="capex-table-card">
//         <div className="capex-table-head">
//           <Title level={4} className="capex-table-title">
//             Activity-wise CAPEX
//           </Title>
//           <Text className="capex-table-meta">All values in Cr</Text>
//         </div>

//         <div className="capex-table-scroll">
//           <Table
//             columns={columns}
//             dataSource={data}
//             bordered
//             pagination={false}
//             className="capex-table"
//             rowKey="key"
//           />
//         </div>
//       </Card>

//     </div>
//   );
// };

// export default CAPEXPerformance;

import React, { useEffect, useMemo, useState } from "react";
import { Card, DatePicker, Row, Col, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import "../styles/CAPEX-performance.css";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { db } from "../Utils/dataStorege.ts";

const { Title, Text } = Typography;

type CAPEXPerformanceProps = {
  code?: string; // ✅ project id
};

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

type ProjectDetails = {
  id?: string;
  financialParameters?: {
    totalProjectCost?: any;
    ebitdaPercentage?: any;
    irrPercentage?: any;
    npvPercentage?: any;
    patPercentage?: any;
    patPerTon?: any;
    roePercentage?: any;
    rocePercentage?: any;
  };
};

const formatCr = (n: number) =>
  new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

const pretty = (v: any) => {
  if (v === null || v === undefined) return "--";
  if (typeof v === "string" && v.trim() === "") return "--";
  return String(v);
};

const CAPEXPerformance: React.FC<CAPEXPerformanceProps> = ({ code }) => {
  const [_selectedMonth, setSelectedMonth] = useState<Dayjs | null>(null);

  const [projectDetails, setProjectDetails] = useState<ProjectDetails>({});

  useEffect(() => {
    let alive = true;

    const getProjectDetails = async () => {
      if (!code) {
        setProjectDetails({});
        return;
      }
      try {
        const storedData: any = await db.getProjects();
        const list = Array.isArray(storedData) ? storedData : [];
        const match = list.find((item: any) => item?.id === code);
        if (!alive) return;
        setProjectDetails(match || {});
      } catch {
        if (!alive) return;
        setProjectDetails({});
      }
    };

    getProjectDetails();
    return () => {
      alive = false;
    };
  }, [code]);

  const financial = projectDetails?.financialParameters || {};

  // ✅ metrics now show project financialParameters
  const metrics: MetricCard[] = useMemo(() => {
    const totalProjectCost = pretty(financial.totalProjectCost);
    const ebitda = pretty(financial.ebitdaPercentage);
    const irr = pretty(financial.irrPercentage);
    const npv = pretty(financial.npvPercentage);
    const pat = pretty(financial.patPercentage);
    const patPerTon = pretty(financial.patPerTon);
    const roe = pretty(financial.roePercentage);
    const roce = pretty(financial.rocePercentage);

    return [
      { title: `Total Project cost - ${totalProjectCost}` },
      { title: `EBITDA Percentage - ${ebitda}` },
      { title: `IRR (%) - ${irr}`, subInfo: `NPV (%) - ${npv}` },
      { title: `PAT (%) - ${pat}`, subInfo: `PAT / Ton - ${patPerTon}` },
      { title: `ROE % - ${roe}`, subInfo: `ROCE% - ${roce}` },
    ];
  }, [financial]);

  const columns: ColumnsType<CapexData> = useMemo(
    () => [
      {
        title: "Activity",
        dataIndex: "activity",
        key: "activity",
        fixed: "left",
        width: 180,
        render: (v: string) => <span className="capex-activity">{v}</span>,
      },
      { title: "Total Approved Budget", dataIndex: "totalApprovedBudget", key: "totalApprovedBudget", render: (v) => `${formatCr(v)}` },
      { title: "Actual Expense till previous FY", dataIndex: "actualExpensePreviousFY", key: "actualExpensePreviousFY", render: (v) => `${formatCr(v)}` },
      { title: "Remaining total budget at the end of previous FY", dataIndex: "remainingPreviousFY", key: "remainingPreviousFY", render: (v) => `${formatCr(v)}` },
      { title: "Approved Budget for Current FY", dataIndex: "approvedCurrentFY", key: "approvedCurrentFY", render: (v) => `${formatCr(v)}` },
      { title: "Approved budget current FY (YTD)", dataIndex: "approvedYTD", key: "approvedYTD", render: (v) => `${formatCr(v)}` },
      { title: "Actual Expense for current FY (YTD)", dataIndex: "actualExpenseYTD", key: "actualExpenseYTD", render: (v) => `${formatCr(v)}` },
      { title: "Remaining budget for current FY (YTD)", dataIndex: "remainingYTD", key: "remainingYTD", render: (v) => `${formatCr(v)}` },
      {
        title: "% budget utilization for current FY (YTD)",
        dataIndex: "budgetUtilizationYTD",
        key: "budgetUtilizationYTD",
        render: (v: string) => <span className="capex-pill">{v}</span>,
      },
    ],
    []
  );

  // keep as-is (your static data)
  const data: CapexData[] = [
    {
      key: 1,
      activity: "Project Cost",
      totalApprovedBudget: 1744.75,
      actualExpensePreviousFY: 697.9,
      remainingPreviousFY: 1046.85,
      approvedCurrentFY: 436.19,
      approvedYTD: 130.86,
      actualExpenseYTD: 130.86,
      remainingYTD: 305.33,
      budgetUtilizationYTD: "30%",
    },
    {
      key: 2,
      activity: "Land",
      totalApprovedBudget: 858.15,
      actualExpensePreviousFY: 343.26,
      remainingPreviousFY: 514.89,
      approvedCurrentFY: 214.54,
      approvedYTD: 64.36,
      actualExpenseYTD: 64.36,
      remainingYTD: 150.18,
      budgetUtilizationYTD: "30%",
    },
  ];

  const COLORS = ["#1F7A63", "#34D399"];

  const overallData = [
    { name: "Budget utilized till date", value: 53 },
    { name: "Remaining", value: 48 },
  ];

  const currentFYData = [
    { name: "Approved budget current FY (YTD)", value: 50 },
    { name: "Remaining", value: 50 },
  ];

  return (
    <div className="capex-container">
      <div className="capex-header-row">
        <div className="capex-heading">
          <Title level={5} className="capex-title">
            CAPEX Performance
          </Title>
          <Text className="capex-subtitle">
            Budget utilization overview with FY breakdown and activity-wise details.
          </Text>
        </div>

        <div className="capex-date-row">
          <Text className="capex-date-label">Date</Text>
          <DatePicker picker="month" onChange={(date) => setSelectedMonth(date)} className="capex-datepicker" />
        </div>
      </div>

      <div className="capex-cards-flex">
        {metrics.map((metric, index) => (
          <Card className="capex-card" key={index}>
            <Text className="capex-metric">{metric.title}</Text>
            {metric.subInfo ? <Text className="capex-metric-sub">{metric.subInfo}</Text> : null}
          </Card>
        ))}
      </div>

      <div className="capex-charts">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="capex-chart-card">
              <div className="capex-chart-head">
                <Title level={4} className="capex-chart-title">
                  Overall CAPEX Performance
                </Title>
                <Text className="capex-chart-meta">Utilized vs remaining till date</Text>
              </div>

              <div className="capex-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={overallData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={95}
                      innerRadius={55}
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
              </div>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card className="capex-chart-card">
              <div className="capex-chart-head">
                <Title level={4} className="capex-chart-title">
                  Current FY CAPEX Performance
                </Title>
                <Text className="capex-chart-meta">YTD approved vs remaining</Text>
              </div>

              <div className="capex-chart-wrap">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={currentFYData}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={95}
                      innerRadius={55}
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
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Card className="capex-table-card">
        <div className="capex-table-head">
          <Title level={4} className="capex-table-title">
            Activity-wise CAPEX
          </Title>
          <Text className="capex-table-meta">All values in Cr</Text>
        </div>

        <div className="capex-table-scroll">
          <Table columns={columns} dataSource={data} bordered pagination={false} className="capex-table" rowKey="key" />
        </div>
      </Card>
    </div>
  );
};

export default CAPEXPerformance;
