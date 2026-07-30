import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import {
  Institution,
  InstitutionAccessRemuniration,
} from "../../../types/entities/general/ce";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import useTabOperationState from "../../common/tabs/useTabOperationState";
import useTab from "../../common/useTab";
import { Columns, FormikActions } from "../../../types/base";
import {
  deleteInstitutionAccessRemuniration,
  insertInstitutionAccessRemuniration,
  syncInstitutionAccessRemuniration,
  updateInstitutionAccessRemuniration,
} from "../../../store/general/ce/institutionAccessRemuniration/actions";
import { setToastAlert } from "../../../store/notifications/slice";

const useInstitutionAccessRemunirationAssignment = (
  name: keyof Institution,
  label: string,
  shouldOpenModal?: () => boolean,
) => {
  const dispatch = useAppDispatch();

  const {
    showModal,
    toggleModal,
    selectedForDelete,
    setSelectedForDelete,
    selectedForUpdate,
    setSelectedForUpdate,
    values,
  } = useTabOperationState<InstitutionAccessRemuniration, Institution>(
    name,
    shouldOpenModal,
  );

  const { deleteItems, updateItem, addItem } = useTab<
    Institution,
    InstitutionAccessRemuniration
  >({
    label,
    name,
    selectedForDelete,
    selectedForUpdate,
    toggleModal,
  });
  const { t } = useTranslation();

  const validate = (
    data: InstitutionAccessRemuniration,
    operation = "INSERT",
  ) => {
    let error = "";
    if (operation == "INSERT") {
      if (
        (values[name] as InstitutionAccessRemuniration[]).find(
          (el) =>
            el.remunirationTypeId.toString() ===
            data.remunirationTypeId.toString(),
        )
      ) {
        error = `InstitutionAccessRemuniration object ${data?.object} already exists`;
      }
    } else if (operation == "UPDATE") {
      if (
        (values[name] as InstitutionAccessRemuniration[]).find(
          (el) =>
            el.remunirationTypeId.toString() ===
              data.remunirationTypeId.toString() &&
            selectedForUpdate?.remunirationTypeId != data.remunirationTypeId,
        )
      ) {
        error = `InstitutionAccessRemuniration object ${data?.object} already exists`;
      }
    }

    if (error) {
      dispatch(setToastAlert({ msg: error, type: "error" }));
    }
    return error;
  };

  // Add
  const onAdd = async (
    data: InstitutionAccessRemuniration,
    actions: FormikActions<InstitutionAccessRemuniration>,
  ) => {
    const error = validate(data);
    if (!error) {
      if (data) {
        const res = await dispatch(
          insertInstitutionAccessRemuniration({
            data,
          }),
        );
        if (res.data?.data.id) {
          data.id = res.data?.data.id;
        }
        if (res?.ok) {
          addItem({
            error,
            data,
            actions,
          });
        }
      }
    }
  };

  // Sync
  const onSync = async (institutionId: number) => {
    if (institutionId > 0) {
      const res = await dispatch(
        syncInstitutionAccessRemuniration({
          data: { institutionId: institutionId },
        }),
      );
      return res;
    }
  };

  // Delete
  const onDelete = async () => {
    if (selectedForDelete.length === 0) return;
    const res = await dispatch(
      deleteInstitutionAccessRemuniration({
        id: selectedForDelete[0]?.id,
      }),
    );
    if (res?.ok) {
      const deleted = await deleteItems();
      if (deleted) {
        setSelectedForDelete([]);
      }
    }
  };

  // Update
  const onUpdate = async (
    data: InstitutionAccessRemuniration,
    actions: FormikActions<InstitutionAccessRemuniration>,
  ) => {
    if (!selectedForUpdate?.activityCode || !data) return;
    const error = validate(data, "UPDATE");
    if (!error && data?.id) {
      const res = await dispatch(
        updateInstitutionAccessRemuniration({
          id: data?.id,
          data,
        }),
      );

      if (res?.ok) {
        data.id = res.data?.data.id as number;

        await updateItem({
          error,
          data,
          actions,
        });

        setSelectedForUpdate(null);
      }
    }
  };

  const { institutions } = useAppSelector(
    (state) => state.general.ce.institutions,
  );

  const { allRemunirationTypes } = useAppSelector(
    (state) => state.payroll.remuniration.remunirationTypes,
  );
  const columns = useMemo<Columns<InstitutionAccessRemuniration>>(
    () => [
      {
        headerName: t("ActivityCode") ?? "",
        field: "activityCode",
      },
      {
        headerName: t("projectCode") ?? "",
        field: "projectCode",
      },

      {
        headerName: t("RemunirationType") ?? "",
        field: "remunirationTypeId",
        valueGetter: (params) => {
          const remunirationType = allRemunirationTypes.find(
            (remunirationType) =>
              remunirationType.id === params.data?.remunirationTypeId,
          );
          return remunirationType?.object;
        },
      },
      {
        headerName: t("Org") ?? "",
        field: "institutionId",
        valueGetter: (params) => {
          const institution = institutions.find(
            (institution) => institution.id === params.data?.institutionId,
          );
          return institution?.description;
        },
      },
      {
        headerName: t("Action") ?? "",
        field: "actions",
        cellRenderer: "ActionButton",
      },
    ],
    [t, institutions, allRemunirationTypes],
  );

  return {
    columns,
    selectedForUpdate,
    onDelete,
    onUpdate,
    onSync,
    onAdd,
    showModal,
    setSelectedForDelete,
    setSelectedForUpdate,
    toggleModal,
  };
};
export default useInstitutionAccessRemunirationAssignment;
