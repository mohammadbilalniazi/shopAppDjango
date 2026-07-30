import { FilePond, registerPlugin } from "react-filepond";
import "filepond/dist/filepond.min.css";
import FilePondPluginImageExifOrientation from "filepond-plugin-image-exif-orientation";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css";
import AppLabel from "./AppLabel";

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview);

type Props = {
  id?: string;
  label?: string;
  onChange: (val: any) => void;
  value: any;
  required?: boolean;
  invalid?: boolean;
  labelIdle?: string;
  disabled?: boolean;
  [key: string]: any;
};

const AppFile: React.FC<Props> = ({
  id,
  label,
  onChange,
  value,
  required,
  invalid,
  labelIdle = 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
  ...otherProps
}) => {
  return (
    <>
      {label && <AppLabel id={id} label={label} required={required} />}
      <div className={`${invalid ? "has-error" : ""}`}>
        <FilePond
          id={id}
          files={value}
          onupdatefiles={onChange}
          className="filepond filepond-input-multiple"
          labelIdle={labelIdle}
          {...otherProps}
        />
      </div>
    </>
  );
};

export default AppFile;
