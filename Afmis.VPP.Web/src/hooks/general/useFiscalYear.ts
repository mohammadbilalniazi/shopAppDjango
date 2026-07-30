import { useEffect } from "react";

import { useAppDispatch } from "../../store/hooks";

import {
  deleteFiscalYear,
  getFiscalYearById,
  insertFiscalYear,
  searchFiscalYears,
  updateFiscalYear,
} from "../../store/general/ce/fiscalYear/actions";
import { FiscalYear } from "../../types/entities/general/ce";
import {
  generalCeFiscalYears,
  generalCeFiscalYearsSearchResults,
} from "../../routes/routes";
import useAppNavigate from "../common/useAppNavigate";
import useSearch from "../common/useSearch";
import { fiscalYearSetFormData } from "../../store/general/ce/fiscalYear/slice";
import { useConfirm } from "../common/useConfirm";
import { t } from "i18next";

const useFiscalYear = (id?: number | null, toggleSearch?: VoidFunction) => {
  const dispatch = useAppDispatch();
  const { ask } = useConfirm();
  const { navigateInsert, navigateDelete } = useAppNavigate();

  useEffect(() => {
    if (id != null) {
      dispatch(getFiscalYearById({ id }));
    }
  }, [dispatch, id]);

  const search = useSearch({
    url: generalCeFiscalYearsSearchResults,
    action: searchFiscalYears,
    toggleSearch,
  });
  const handleSearch = (data: Partial<FiscalYear>) => {
    dispatch(fiscalYearSetFormData(data));
    search({ values: data });
  };

  const handleInsert = async (data: FiscalYear) => {
    const res = await dispatch(insertFiscalYear({ data }));
    if (res?.ok && res.data) {
      navigateInsert(`${generalCeFiscalYears}/${res.data.data.id}`);
    }
  };
  const handleDelete = async () => {
    if (!id || !(await ask(t("Areyousureyouwanttodeletethisrecord?")))) {
      return;
    }
    const res = await dispatch(deleteFiscalYear({ id }));
    if (res?.ok) {
      navigateDelete(generalCeFiscalYears);
    }
  };

  const handleUpdate = async (data: FiscalYear) => {
    if (!id || !(await ask(t("Areyousureyouwanttoupdatethisrecord?")))) {
      return;
    }
    dispatch(updateFiscalYear({ id, data }));
  };

  return { handleSearch, handleInsert, handleUpdate, handleDelete };
};

export default useFiscalYear;
