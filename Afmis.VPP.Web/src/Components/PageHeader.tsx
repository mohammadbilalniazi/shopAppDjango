import AppCol from "./AppCol";
import AppRow from "./AppRow";

type Props = {
  title: string;
};

const PageHeader: React.FC<Props> = ({ title }) => {
  return (
    <>
      <AppRow> 
        <AppCol xs={12}>
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0" style={{marginInlineEnd:"20px"}}>{title}</h4>
          </div>
        </AppCol>
      </AppRow>
    </>
  );
};

export default PageHeader;
