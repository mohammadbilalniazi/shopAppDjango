import { useFormikContext } from "formik";
import { Modal, ModalHeader, ModalBody, Button } from "reactstrap";

import { GetResultTable, GetSearchForm } from "./modalHelper";
import { FormikContext, Lookup, ObjectAny } from "../../../types/base";
import { t } from "i18next";
// import { ElementConcept } from "../../../types/entities/gl/coa";

type Props = {
  model: string;
  label: string;
  name: string;
  showLookupModal: boolean;
  toggleLookupModal: () => void;
  search: boolean;
  toggleSearch: () => void;
  setParams: (params: ObjectAny) => void;
  // setCodingBlockDetail?: (codingBlockDetail: ElementConcept[]) => void;
  onChange?: (val: Lookup | null) => void;
  header?: string;
};

const LookupModal: React.FC<Props> = ({
  model,
  label,
  name,
  showLookupModal,
  toggleLookupModal,
  search,
  toggleSearch,
  setParams,
  // setCodingBlockDetail,
  header,
  onChange,
}) => {
  const { setFieldValue } = useFormikContext() as unknown as FormikContext;
  return (
    <Modal
      id="lookup"
      isOpen={showLookupModal}
      toggle={toggleLookupModal}
      size="xl"
    >
      <ModalHeader
        className="modal-title"
        id="myModalLabel"
        toggle={toggleLookupModal}
      >
        {search ? (
          <span>{header ? header : label} {t("Search")} </span>
        ) : (
          <Button onClick={toggleSearch}>{t("Back")}</Button>
        )}
      </ModalHeader>
      <ModalBody>
        {search ? (
          <GetSearchForm model={model} toggleSearch={toggleSearch} />
        ) : (
          <GetResultTable
            lookup
            model={model}
            onClick={(row: ObjectAny) => {
              if (onChange) {
                onChange({ value: row.id, label: row.value });
              }
              setFieldValue(name, { value: row.id, label: row.value });

              if (onChange) {
                onChange({ value: row.id, label: row.value });
              }

              toggleLookupModal();
              if (row.params) {
                setParams(row.params as ObjectAny);
              }
              // if (setCodingBlockDetail) {
              //   setCodingBlockDetail(row.elements as ElementConcept[]);
              // }
            }}
          />
        )}
      </ModalBody>
    </Modal>
  );
};

export default LookupModal;
