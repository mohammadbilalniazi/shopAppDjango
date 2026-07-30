import React, { useEffect, useMemo, useState } from "react";
import Select, { SingleValue } from "react-select";

type OrganizationOption = {
  id: string;
  name: string;
};

type Props = {
  selectElement: HTMLSelectElement;
};

const readOptionsFromSelect = (selectElement: HTMLSelectElement): OrganizationOption[] =>
  Array.from(selectElement.options)
    .filter((option) => option.value !== "")
    .map((option) => ({
      id: option.value,
      name: option.textContent?.trim() || option.value,
    }));

const syncNativeSelect = (
  selectElement: HTMLSelectElement,
  options: OrganizationOption[],
  selectedId: string,
) => {
  selectElement.innerHTML = "";

  if (!selectElement.required) {
    selectElement.appendChild(new Option("Select Organization", ""));
  }

  options.forEach((organization) => {
    const option = new Option(organization.name, organization.id);
    option.selected = organization.id === selectedId;
    selectElement.appendChild(option);
  });

  selectElement.value = selectedId;
  selectElement.dispatchEvent(new Event("change", { bubbles: true }));
};

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? "#405189" : "#ced4da",
    borderRadius: 4,
    boxShadow: state.isFocused ? "0 0 0 0.15rem rgba(64, 81, 137, 0.18)" : "none",
    "&:hover": {
      borderColor: "#405189",
    },
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 10000,
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected ? "#405189" : state.isFocused ? "#eef2ff" : "#fff",
    color: state.isSelected ? "#fff" : "#212529",
  }),
};

const BillOrganizationSelect: React.FC<Props> = ({ selectElement }) => {
  const initialOptions = useMemo(() => readOptionsFromSelect(selectElement), [selectElement]);
  const [options, setOptions] = useState<OrganizationOption[]>(initialOptions);
  const [selectedId, setSelectedId] = useState(selectElement.value || initialOptions[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadAllowedOrganizations = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/organizations/user/", {
          headers: {
            Accept: "application/json",
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!response.ok) {
          throw new Error("Unable to load allowed organizations.");
        }

        const data = (await response.json()) as Array<{ id: number | string; name: string }>;
        if (!active) {
          return;
        }

        const allowedOptions = data.map((organization) => ({
          id: String(organization.id),
          name: organization.name,
        }));
        const nextSelectedId = allowedOptions.some((option) => option.id === selectedId)
          ? selectedId
          : allowedOptions[0]?.id || "";

        setOptions(allowedOptions);
        setSelectedId(nextSelectedId);
        syncNativeSelect(selectElement, allowedOptions, nextSelectedId);
      } catch (exception) {
        if (!active) {
          return;
        }
        const message = exception instanceof Error ? exception.message : "Unable to load allowed organizations.";
        setError(message);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadAllowedOrganizations();

    return () => {
      active = false;
    };
  }, [selectElement]);

  const selectedOption = options.find((option) => option.id === selectedId) || null;

  const handleChange = (option: SingleValue<OrganizationOption>) => {
    const nextSelectedId = option?.id || "";
    setSelectedId(nextSelectedId);
    syncNativeSelect(selectElement, options, nextSelectedId);
  };

  return (
    <div className="afmis-bill-select">
      <Select
        inputId={`${selectElement.id}_react`}
        classNamePrefix="afmis"
        options={options}
        value={selectedOption}
        getOptionLabel={(option) => option.name}
        getOptionValue={(option) => option.id}
        onChange={handleChange}
        isClearable={false}
        isLoading={loading}
        placeholder="Select Organization"
        noOptionsMessage={() => "No organization available"}
        styles={selectStyles}
      />
      {error && <div className="afmis-bill-select__error">{error}</div>}
    </div>
  );
};

export default BillOrganizationSelect;
