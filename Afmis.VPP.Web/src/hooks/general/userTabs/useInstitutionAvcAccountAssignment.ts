import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { AVCAccount, Institution } from "../../../types/entities/general/ce";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import useTabOperationState from "../../common/tabs/useTabOperationState";
import useTab from "../../common/useTab";
import { Columns, FormikActions } from "../../../types/base";
import {
  deleteAVCAccount,
  insertAVCAccount,
  syncAVCAccount,
  updateAVCAccount,
} from "../../../store/general/ce/avcAccount/actions";
import { setToastAlert } from "../../../store/notifications/slice";

const useInstitutionAvcAccountAssignment = (
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
  } = useTabOperationState<AVCAccount, Institution>(name, shouldOpenModal);

  const { deleteItems, updateItem, addItem } = useTab<Institution, AVCAccount>({
    label,
    name,
    selectedForDelete,
    selectedForUpdate,
    toggleModal,
  });
  const { t } = useTranslation();

  const validate = (data: AVCAccount, operation = "INSERT") => {
    let error = "";
    if (operation == "INSERT") {
      if (
        (values[name] as AVCAccount[]).find(
          (el) => el.avc.toString() === data.avc.toString(),
        )
      ) {
        error = `AVCAccount ${data?.avc} already exists`;
      }
    } else if (operation == "UPDATE") {
      if (
        (values[name] as AVCAccount[]).find(
          (el) =>
            el.avc.toString() === data.avc.toString() &&
            selectedForUpdate?.avc != data.avc,
        )
      ) {
        error = `AVCAccount ${data?.avc} already exists`;
      }
    }

    if (error) {
      dispatch(setToastAlert({ msg: error, type: "error" }));
    }
    return error;
  };

  // Add
  const onAdd = async (
    data: AVCAccount,
    actions: FormikActions<AVCAccount>,
  ) => {
    const error = validate(data);
    if (!error) {
      if (data) {
        const res = await dispatch(
          insertAVCAccount({
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
        syncAVCAccount({
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
      deleteAVCAccount({
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
    data: AVCAccount,
    actions: FormikActions<AVCAccount>,
  ) => {
    if (!selectedForUpdate?.object || !data) return;
    // if (selectedForUpdate) return;
    const error = validate(data, "UPDATE");
    if (!error && data?.id) {
      const res = await dispatch(
        updateAVCAccount({
          id: data?.id,
          data,
        }),
      );

      if (res?.ok) {
        updateItem({
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
  const { deductionTypes } = useAppSelector(
    (state) => state.deduction.deductionType,
  );
  const columns = useMemo<Columns<AVCAccount>>(
    () => [
      {
        headerName: t("VendorNumber") ?? "",
        field: "avc",
      },
      {
        headerName: t("BankAccount") ?? "",
        field: "accountNumber",
      },
      {
        headerName: t("Org") ?? "",
        valueGetter: ({ data }) => {
          const institution = institutions.find(
            (inst) => inst.id == data?.institutionId,
          );
          return institution?.description;
        },
      },
      {
        headerName: t("DeductionType") ?? "",
        field: "object",
        valueGetter: ({ data }) => {
          if (data?.object) {
            const deductionType = deductionTypes.find(
              (item) => item.object == data.object,
            );
            return deductionType?.description;
          } else {
            return "";
          }
        },
        // headerCheckboxSelection: true,
        // checkboxSelection: true,
      },
      {
        headerName: t("Remarks") ?? "",
        field: "description",
      },
      {
        headerName: t("Action") ?? "",
        field: "actions",
        cellRenderer: "ActionButton",
      },
    ],
    [institutions, deductionTypes, t],
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
export default useInstitutionAvcAccountAssignment;
