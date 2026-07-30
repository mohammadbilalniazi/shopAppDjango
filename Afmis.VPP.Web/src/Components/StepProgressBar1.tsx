import React from "react";
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";

// Define steps content
const steps = [
  { label: "Step 1", content: "د حاضری جوړول" },
  { label: "Step 2", content: "د حاضری ختم" },
  { label: "Step 3", content: "د معاش شروع" },
  { label: "Step 4", content: "د معاش ختم" },
  { label: "Step 5", content: "وزارت مالیه ته استول" },
];

// RTL theme configuration
const theme = createTheme({
  direction: "rtl",
});

export const ProgressB1: React.FC = () => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ width: "100%" }}>
        {" "}
        {/* Add a full-width Box */}
        <Stepper
          activeStep={activeStep}
          orientation="horizontal"
          sx={{
            width: "100%",
            direction: "rtl",
            justifyContent: "flex-end",
          }}
        >
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <Typography>{step.content}</Typography>
              <StepContent sx={{ direction: "rtl", width: "100%" }}>
                <Box sx={{ mb: 2 }}>
                  <div>
                    <Button
                      disabled={activeStep === 0}
                      onClick={handleBack}
                      sx={{ ml: 1 }}
                    >
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNext}
                      sx={{ mr: 1 }}
                    >
                      {index === steps.length - 1 ? "Finish" : "Next"}
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3, direction: "rtl" }}>
            <Typography>All steps completed - you&apos;re finished</Typography>
            <Button onClick={handleReset}>Reset</Button>
          </Paper>
        )}
      </Box>
    </ThemeProvider>
  );
};
