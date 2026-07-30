import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import AppLabel from "./AppLabel";

type Props = {
  id?: string;
  label?: string;
  value: string;
  required?: boolean;
  disabled?: boolean;
  onChange: ((event: unknown, editor: ClassicEditor) => void) | undefined;
  [key: string]: any;
};

const AppEditor: React.FC<Props> = ({
  id,
  label,
  value,
  required,
  onChange,
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}

      <CKEditor
        id={id}
        editor={ClassicEditor}
        data={value}
        onReady={() => {
          // You can store the "editor" and use when it is needed.
        }}
        onChange={onChange}
        {...otherProps}
      />
    </>
  );
};

export default AppEditor;
