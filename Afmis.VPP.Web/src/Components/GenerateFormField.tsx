import { fieldTypes } from "../constants/fieldTypes";
import { ObjectAny } from "../types/base";
import FormCheckBox from "./forms/FormCheckBox";
import FormDatePicker from "./forms/FormDatePicker";
import FormEditor from "./forms/FormEditor";
import FormFile from "./forms/FormFile";
import FormInput from "./forms/FormInput";
import FormInputMask from "./forms/FormInputMask";
import FormLookupInput from "./forms/FormLookupInput";
import FormModalInput from "./forms/FormModalInput";
import FormRadio from "./forms/FormRadio";
import FormSelect from "./forms/FormSelect";
import FormTextArea from "./forms/FormTextArea";
import FormTransferList from "./forms/FormTransferList";

type Props = {
  config: ObjectAny;
};

const GenerateFormField: React.FC<Props> = ({ config }) => {
  switch (config.type) {
    case fieldTypes.INPUT:
      return <FormInput {...config.elementConfig} />;
    case fieldTypes.SELECT:
      return <FormSelect {...config.elementConfig} />;
    case fieldTypes.RADIO:
      return <FormRadio {...config.elementConfig} />;
    case fieldTypes.CHECK_BOX:
      return <FormCheckBox {...config.elementConfig} />;

    case fieldTypes.DATE:
      return <FormDatePicker {...config.elementConfig} />;
    case fieldTypes.EDITOR:
      return <FormEditor {...config.elementConfig} />;
    case fieldTypes.FILE:
      return <FormFile {...config.elementConfig} />;
    case fieldTypes.INPUT_MASK:
      return <FormInputMask {...config.elementConfig} />;
    case fieldTypes.TEXT_AREA:
      return <FormTextArea {...config.elementConfig} />;
    case fieldTypes.TRANSFER_LIST:
      return <FormTransferList {...config.elementConfig} />;
    case fieldTypes.LOOKUP_INPUT:
      return <FormLookupInput {...config.elementConfig} />;
    case fieldTypes.MODAL_INPUT:
      return <FormModalInput {...config.elementConfig} />;
  }
};

export default GenerateFormField;
