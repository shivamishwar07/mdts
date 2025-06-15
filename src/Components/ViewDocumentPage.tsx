import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import { useNavigate, useLocation } from "react-router-dom";

const ViewDocumentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const documentData = location.state?.document; // Retrieve document details passed via state

  const handleDownload = (fileName:any) => {
    alert(`Downloading file: ${fileName}`);
    // Add actual file download logic here
  };

  if (!documentData) {
    return (
      <Box sx={{ padding: 3, backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
        <Typography variant="h6" color="error">
          No document data found. Please navigate back and select a document to view.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ marginTop: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f4f5f7", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 2,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          marginBottom: 3,
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            textTransform: "none",
            color: "primary.main",
            fontWeight: "bold",
            fontSize: "1rem",
          }}
        >
          Back
        </Button>
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            color: "primary.main",
          }}
        >
          Document Details
        </Typography>
        <Box sx={{ width: "48px" }} /> {/* Empty space for alignment */}
      </Box>

      {/* Document Details */}
      <Paper
        sx={{
          padding: 3,
          backgroundColor: "#ffffff",
          borderRadius: 2,
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          {documentData.documentName}
        </Typography>
        <Typography variant="body1" sx={{ marginTop: 1 }}>
          <strong>Description:</strong> {documentData.description}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ marginTop: 1 }}>
          <strong>Milestone:</strong> {documentData.milestone}
        </Typography>
        <Typography variant="caption" sx={{ marginTop: 1, display: "block" }}>
          <strong>Uploaded At:</strong> {new Date(documentData.uploadedAt).toLocaleString()}
        </Typography>

        <Divider sx={{ marginY: 3 }} />

        {/* Files Section */}
        <Typography variant="h6" sx={{ marginBottom: 2 }}>
          Files
        </Typography>
        {documentData.files.map((file:any, index:any) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 1.5,
              padding: "8px 16px",
              backgroundColor: "#f9f9f9",
              borderRadius: 1,
              border: "1px solid #e0e0e0",
            }}
          >
            <Typography
              variant="body1"
              sx={{
                flex: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {file}
            </Typography>
            <IconButton
              color="primary"
              onClick={() => handleDownload(file)}
              aria-label="download"
              sx={{ padding: 0.5 }}
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        ))}
      </Paper>
    </Box>
  );
};

export default ViewDocumentPage;
