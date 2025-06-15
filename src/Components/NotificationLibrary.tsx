import { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, IconButton, Accordion, AccordionSummary, AccordionDetails, } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const data = [
  {
    module: "Contract Formulation",
    activities: [
      { name: "Declaration as H1 Bidder", notification: "TRUE", status: "Completed", message: "This is my message", default: "This is my new message" },
      { name: "Signing of CBDPA", notification: "FALSE", status: "", message: "", default: "" },
    ],
  },
  {
    module: "Budgetary Planning",
    activities: [
      { name: "Approval of Interim Budget", notification: "TRUE", status: "delayed", message: "", default: "" },
      { name: "Preparation of DPR", notification: "", status: "", message: "", default: "" },
    ],
  },
  {
    module: "Boundary Coordinate Certification by CMPDI",
    activities: [
      { name: "Survey by CMPDI to ascertain boundary coordinates", notification: "TRUE", status: "Completed", message: "", default: "" },
      { name: "Receipt of Certified Boundary Coordinates by CMPDI", notification: "FALSE", status: "", message: "", default: "" },
    ],
  },
];

const NotificationLibrary = () => {
  const [expanded, setExpanded] = useState(null);

  const handleAccordionChange = (panel: any) => {
    setExpanded(expanded === panel ? null : panel);
  };

  return (
    <TableContainer component={Paper} style={{ margin: "20px auto", maxWidth: "80%" }}>
      <Typography variant="h5" style={{ margin: "10px", fontWeight: "bold", color: "#4F7942" }}>
        Notification Library
      </Typography>
      {data.map((section, index) => (
        <Accordion
          key={index}
          expanded={expanded === index}
          onChange={() => handleAccordionChange(index)}
          style={{ marginBottom: "0px" }}
        >
          <AccordionSummary
            expandIcon={
              <Typography style={{ fontWeight: "bold", fontSize: "30px", color: "black" }}>
                {expanded === index ? "-" : "+"}
              </Typography>
            }
            style={{ backgroundColor: "#4F7942", color: "white" }}
          >
            <Typography variant="h6" style={{ fontWeight: "bold" }}>
              {section.module}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#FF8C00" }}>
                  <TableCell style={{ fontWeight: "bold" }}>Activity</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Notification Set-up</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Notification Message</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Default Message</TableCell>
                  <TableCell>
                    <IconButton color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {section.activities.map((activity, idx) => (
                  <TableRow key={idx} sx={{ "&:not(:last-child) td, &:not(:last-child) th": { border: 0 } }}>
                    <TableCell>{activity.name}</TableCell>
                    <TableCell>{activity.notification}</TableCell>
                    <TableCell>{activity.status}</TableCell>
                    <TableCell>{activity.message}</TableCell>
                    <TableCell>{activity.default}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}
    </TableContainer>
  );
};

export default NotificationLibrary;
