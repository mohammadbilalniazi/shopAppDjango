import { Container, Card, CardBody } from "reactstrap";

import PageHeader from "../Components/PageHeader";
import FormHeader from "../Components/FormHeader";
import AppRow from "../Components/AppRow";
import AppCol from "../Components/AppCol";

type Props = {
  screen?: string;
  model?: string;
  extraButton?: React.ReactNode[];
  title: string;
  header?: string;
  noOfRecords?: number;
  addLink?: string;
  addLink2?: string;
  searchLink?: string;
  searchResultsLink?: string;
  children: React.ReactNode;
};
const PageLayout: React.FC<Props> = ({
  screen,
  model,
  extraButton,
  title,
  header,
  noOfRecords,
  addLink,
  searchLink,
  searchResultsLink,
  children,
}) => {
  return (
    <>
      <div className="page-content" style={{ height: "100%" }}>
        <Container fluid style={{ height: "100%" }}>
          <PageHeader title={title} />
          <div className="col-lg-12" style={{ height: "100%" }}>
            <Card>
              {  (
                <FormHeader 
                  screen={screen}
                  model={model}
                  extraButton={extraButton}
                  title={header??""}
                  noOfRecords={noOfRecords}
                  addLink={addLink}
                  searchResultsLink={searchResultsLink}
                  searchLink={searchLink}
                />
              )}
              <CardBody>
                <AppRow>
                  <AppCol>{children}</AppCol>
                </AppRow>
              </CardBody>
            </Card>
          </div>
        </Container>
      </div>
    </>
  );
};

export default PageLayout;
