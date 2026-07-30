import React from "react";
import StepProgressBar from "react-step-progress";
import "react-step-progress/dist/index.css";

// Define a type for the step validation functions
type StepValidator = () => boolean;

export const ProgressB: React.FC = () => {
  const step1Content = <h1>Step 1 Content</h1>;
  const step2Content = <h1>Step 2 Content</h1>;
  const step3Content = <h1>Step 3 Content</h1>;

  const step2Validator: StepValidator = () => {
    // Add your validation logic here
    return true;
  };

  const step3Validator: StepValidator = () => {
    // Add your validation logic here
    return true;
  };

  const onFormSubmit = () => {
    // handle the submit logic here
    alert("Form submitted!");
  };

  return (
    <div style={{ width: "100%", direction: "rtl" }}>
      <StepProgressBar
        startingStep={0} // Start from step 1, which will now be on the right
        onSubmit={onFormSubmit}
        steps={[
          {
            label: "Step 3",
            name: "step 3",
            content: step3Content,
            validator: step3Validator,
          },
          {
            label: "Step 2",
            name: "step 2",
            content: step2Content,
            validator: step2Validator,
          },
          {
            label: "Step 1",
            name: "step 1",
            content: step1Content,
          },
        ]}
      />
    </div>
  );
};
