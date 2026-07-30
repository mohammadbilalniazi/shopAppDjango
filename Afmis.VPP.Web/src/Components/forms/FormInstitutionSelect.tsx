// FormInstitutionSelect.tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormikContext } from "formik";
import { FormGroup, Tooltip } from "reactstrap";
import { useTranslation } from "react-i18next";

import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { Address, Institution, MoEInstitutionType } from "../../types/entities/general/ce";
import { Bank } from "../../types/entities/cba/banks";

import { getMoEInstitutionGender } from "../../store/general/ce/moeInstitutionGender/actions";
import { getDropdownAddresses } from "../../store/general/ce/address/actions";
import { getMoEInstitutionStage } from "../../store/general/ce/moeInstitutionStage/actions";
import { getMoEInstitutionType } from "../../store/general/ce/moeInstitutionType/actions";
import { getInstitutions } from "../../store/general/ce/institution/actions";
import { getBanks } from "../../store/cba/bank/actions";

import AppSelect from "../AppSelect";
import ErrorMessage from "./ErrorMessage";
import InputWrapper from "./InputWrapper";
import FormSelect from "./FormSelect";

import { getValue } from "../../utilities/utilFuncs";
import { FormikContext, ObjectAny } from "../../types/base";
import usePermissionCheck from "../../hooks/sa/usePermissionCheck";

type Props<T extends ObjectAny> = {
  name: string;
  label: string;
  valField?: keyof T & string;
  getOptionLabel?: (option: T) => string;
  getOptionValue?: (option: T) => string | number | boolean;
  initVal?: any;
  onChange?: (val: T | false, institutions: Institution[] | null) => void;
  disabled?: boolean;
  paramInstitutions?: Institution[];
  required?: boolean;
  [key: string]: any;
};

const FormInstitutionSelect = <T extends ObjectAny>({
  label,
  name,
  valField = "value" as keyof T & string,
  getOptionLabel,
  getOptionValue,
  paramInstitutions,
  onChange,
  initVal,
  ...otherProps
}: Props<T>) => {
  const { setFieldTouched, setFieldValue, values, errors, touched } =
    useFormikContext() as unknown as FormikContext;

  const { t,i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const dispatch = useAppDispatch();
  const {permissionExists}=usePermissionCheck();
  const moEAdvanceSearchPermission=permissionExists("MoEAdvanceSearch");
  // loading flags
  const { gettingAll: institutionGetting } = useAppSelector((s) => s.general.ce.institutions);
  const { gettingAll: banksGetting } = useAppSelector((s) => s.cba.banks);
  const { gettingAll: moeInstitutionTypesGetting } = useAppSelector((s) => s.general.ce.moeInstitutionTypes);
  const { gettingAll: moeInstitutionStagesGetting } = useAppSelector((s) => s.general.ce.moeInstitutionStages);
  const { gettingAll: moeInstitutionGendersGetting } = useAppSelector((s) => s.general.ce.moeInstitutionGenders);
  const { gettingAll: addressesGetting } = useAppSelector((s) => s.general.ce.addresses);

  // data
  const { institutions } = useAppSelector((s) => s.general.ce.institutions);
  const { moeInstitutionGenders } = useAppSelector((s) => s.general.ce.moeInstitutionGenders);
  const { moeInstitutionStages } = useAppSelector((s) => s.general.ce.moeInstitutionStages);
  const { moeInstitutionTypes } = useAppSelector((s) => s.general.ce.moeInstitutionTypes);
  const { addresses } = useAppSelector((s) => s.general.ce.addresses);
  const { banks } = useAppSelector((s) => s.cba.banks);

  // UI state
  const [showAdvancedSearchToggle, setShowAdvancedSearchToggle] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[] | null>(null);

  // filtered institutions
  useEffect(() => {
    if (paramInstitutions && paramInstitutions?.length>0) {
      setFilteredInstitutions(paramInstitutions);
    }
    else {
      setFilteredInstitutions(institutions);
    }
  }, [paramInstitutions,institutions]);
  // filters
  const [selectedProvinceId, setSelectedProvinceId] = useState<number | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [selectedGenderId, setSelectedGenderId] = useState<number | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  // init field from initVal
  useEffect(() => {
    if (initVal) setFieldValue(name, getValue(initVal));
  }, [initVal, name, setFieldValue]);

  // fetch data
  useEffect(() => {
    if(!moEAdvanceSearchPermission) return;
    if (!moeInstitutionGenders?.length && !moeInstitutionGendersGetting) dispatch(getMoEInstitutionGender());
    if (!moeInstitutionStages?.length && !moeInstitutionStagesGetting) dispatch(getMoEInstitutionStage());
    if (!moeInstitutionTypes?.length && !moeInstitutionTypesGetting) dispatch(getMoEInstitutionType());
    if (!institutions?.length && !institutionGetting) dispatch(getInstitutions());
    if (!addresses?.length && !addressesGetting) dispatch(getDropdownAddresses());
    if (!banks?.length && !banksGetting) dispatch(getBanks());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ 
    dispatch,
    moeInstitutionGenders?.length,
    moeInstitutionStages?.length,
    moeInstitutionTypes?.length,
    institutions?.length,
    addresses?.length,
    banks?.length,
  ]);

  const provinceOptions = useMemo(() => (addresses ?? []).filter((a) => a.parentId === 0), [addresses]);

  const districtOptions = useMemo<Address[]>(
    () => (addresses ?? []).filter((a) => a.parentId === (selectedProvinceId ?? -1)),
    [addresses, selectedProvinceId]
  );

  // filtered institutions based on current filters
  const currentFilteredList = useMemo(() => {
    if (!filteredInstitutions?.length) return [];
    return filteredInstitutions.filter((i) => {
      const provinceOk =
        selectedProvinceId == null ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (("provinceId" in i && (i as any).provinceId === selectedProvinceId) ||
          (("province" in i) &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            addresses?.find((a) => a.id === selectedProvinceId)?.name === (i as any).province));

      const districtOk =
        selectedDistrictId == null ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        (("districtId" in i && (i as any).districtId === selectedDistrictId) ||
          (("district" in i) &&
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            addresses?.find((a) => a.id === selectedDistrictId)?.name === (i as any).district));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const typeOk   = selectedTypeId   == null || String((i as any).moEInstitutionTypeId   ?? "") === String(selectedTypeId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const stageOk  = selectedStageId  == null || String((i as any).moEInstitutionStageId  ?? "") === String(selectedStageId);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const genderOk = selectedGenderId == null || String((i as any).moEInstitutionGenderId ?? "") === String(selectedGenderId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const bankOk   = selectedBankId   == null || String((i as any).bankId                 ?? "") === String(selectedBankId);

      return provinceOk && districtOk && typeOk && stageOk && genderOk && bankOk;
    });
  }, [
    filteredInstitutions,
    addresses,
    selectedProvinceId,
    selectedDistrictId,
    selectedTypeId,
    selectedStageId,
    selectedGenderId,
    selectedBankId,
  ]);

  const hasActiveFilters =
    selectedProvinceId != null ||
    selectedDistrictId != null ||
    selectedTypeId != null ||
    selectedStageId != null ||
    selectedGenderId != null ||
    selectedBankId != null;

  // list used by the dropdown itself
  const listForSelect = hasActiveFilters ? currentFilteredList : filteredInstitutions;

  // notify parent (AssignInstitutionTableSearchTable) with either the filtered list (can be [])
  // or null when no filters are active
  const notifyParent = useCallback(
    (institution?: any) => {
      if (!onChange) return;
      const val = institution ? institution : false;
      onChange(val as unknown as T, hasActiveFilters ? currentFilteredList : null);
    },
    [onChange, hasActiveFilters, currentFilteredList]
  );

  // ALWAYS notify parent when filters change → keeps TransferList left pane in sync
  useEffect(() => {
    notifyParent(false);
  }, [
    notifyParent,
    hasActiveFilters,
    currentFilteredList,
    selectedProvinceId,
    selectedDistrictId,
    selectedTypeId,
    selectedStageId,
    selectedGenderId,
    selectedBankId,
  ]);

  const applyReset = useCallback(() => {
    setSelectedProvinceId(null);
    setSelectedDistrictId(null);
    setSelectedGenderId(null);
    setSelectedStageId(null);
    setSelectedTypeId(null);
    setSelectedBankId(null);
  }, []);

  return (
    <>
      {showAdvancedSearchToggle && (
        <>
          <InputWrapper>
            <FormSelect
              name="moeSearchBankId"
              label={t("Bank")}
              options={banks}
              getOptionLabel={(data: Bank) => data?.name}
              getOptionValue={(data: Bank) => data?.id}
              onChange={(value: Bank | null) => {
                setSelectedBankId(value?.id ?? null);
                notifyParent();
                setFieldValue
              }}
              valField="id"
            />
          </InputWrapper>

          <InputWrapper>
            <FormSelect
              name="provinceId"
              label={t("Province")}
              options={provinceOptions}
              getOptionLabel={(d: Address) => d.name}
              getOptionValue={(d: Address) => d.id}
              valField="id"
              onChange={(value: Address | null) => {
                const id = value?.id ?? null;
                setSelectedProvinceId(id);
                setSelectedDistrictId(null);
                notifyParent();
              }}
            />
          </InputWrapper>

          <InputWrapper>
            <FormSelect
              name="districtId"
              label={t("District")}
              options={districtOptions}
              valField="id"
              getOptionLabel={(d: Address) => d.name}
              getOptionValue={(d: Address) => d.id}
              onChange={(value: Address | null) => {
                setSelectedDistrictId(value?.id ?? null);
                notifyParent();
              }}
              isDisabled={!selectedProvinceId}
            />
          </InputWrapper>

          <InputWrapper>
            <FormSelect
              name="typeId"
              label={t("Type")}
              options={moeInstitutionTypes}
              valField="id"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
              getOptionLabel={(x: MoEInstitutionType) => (x as any).name}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
              getOptionValue={(x: MoEInstitutionType) => (x as any).id}
              onChange={(val: MoEInstitutionType | null) => {
                setSelectedTypeId(val?.id ?? null);
                notifyParent();
              }}
            />
          </InputWrapper>

          <InputWrapper>
            <FormSelect
              name="stageId"
              label={t("Stage")}
              valField="id"
              options={moeInstitutionStages}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
              getOptionLabel={(x: any) => x.name}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
              getOptionValue={(x: any) => x.id}
              onChange={(value: { id: number } | null) => {
                setSelectedStageId(value?.id ?? null);
                notifyParent();
              }}
            />
          </InputWrapper>

          <InputWrapper>
            <FormSelect
              name="genderId"
              label={t("moeInstitutionGender")}
              options={moeInstitutionGenders}
              valField="id"
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
              getOptionLabel={(x: any) => x.name}
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
              getOptionValue={(x: any) => x.id}
              onChange={(value: { id: number } | null) => {
                setSelectedGenderId(value?.id ?? null);
                notifyParent();
              }}
            />
          </InputWrapper>
        </>
      )}

      <InputWrapper>
        <FormGroup className="mb-3">
          {
            moEAdvanceSearchPermission &&<>
            <button
            id="moe"
            type="button"
            onClick={() => {
              setShowAdvancedSearchToggle((prev) => {
                if(!moEAdvanceSearchPermission){
                  return prev;
                }
                const next = !prev;
                if (!next) {
                  applyReset();
                  setTimeout(() => notifyParent(), 0);
                } else {
                  setTimeout(() => notifyParent(), 0);
                }
                return next;
              });
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              padding: "0px 8px",
            }}
            aria-label="Toggle Advanced Search"
          >
            {isRtl ? "🔍" : "🔎"}
            
          </button>
          <Tooltip target="moe" isOpen={tooltipOpen} toggle={() => setTooltipOpen((p) => !p)}>
            Toggle Advanced Search
          </Tooltip>
          </>
          }
          

          <AppSelect
            onBlur={() => setFieldTouched(name)}
            onChange={(val: any) => { 
              if (Array.isArray(val)) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                const valArr = val.map((v) => (v as T)[valField]);
                setFieldValue(name, valArr);
              } else {
                setFieldValue(name, val ? (val as T)[valField] : "");
              }
              notifyParent(val);
            }}
            value={getValue(values[name])}
            invalid={Boolean(touched[name] && errors[name])}
            className={touched[name] && errors[name] ? "has-error" : undefined}
            label={label}
            valField={valField}
            getOptionValue={getOptionValue}
            getOptionLabel={getOptionLabel}
            options={listForSelect ?? []}
            {...otherProps}
          />

          {touched[name] && errors[name] && (
            <ErrorMessage error={errors[name]} label={label} className="d-block" />
          )}
        </FormGroup>
      </InputWrapper>
    </>
  );
};

export default FormInstitutionSelect;
