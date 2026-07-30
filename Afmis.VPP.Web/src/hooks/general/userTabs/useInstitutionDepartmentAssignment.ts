import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Department, Institution } from "../../../types/entities/general/ce";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import useTabOperationState from "../../common/tabs/useTabOperationState";
import useTab from "../../common/useTab";
import { Columns, FormikActions } from "../../../types/base";
import {
  deleteDepartment,
  insertDepartment,
  updateDepartment,
} from "../../../store/general/ce/department/actions";
import { setToastAlert } from "../../../store/notifications/slice";

const useInstitutionDepartmentAssignment = (
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
  } = useTabOperationState<Department, Institution>(name, shouldOpenModal);

  const { deleteItems, updateItem, addItem } = useTab<Institution, Department>({
    label,
    name,
    selectedForDelete,
    selectedForUpdate,
    toggleModal,
  });
  const { t } = useTranslation();

  const validate = (data: Department, operation = "INSERT") => {
    let error = "";
    if (operation == "INSERT") {
      if (
        (values[name] as Department[]).find((dep) => dep.code === data.code)
      ) {
        error = `Department ${data?.code} already exists`;
      }
    } else if (operation == "UPDATE") {
      if (
        (values[name] as Department[]).find(
          (dep) =>
            dep.code === data.code && selectedForUpdate?.code != data.code,
        )
      ) {
        error = `Department ${data?.code} already exists`;
      }
    }

    if (error) {
      dispatch(setToastAlert({ msg: error, type: "error" }));
    }
    return error;
  };

  // Add
  const onAdd = async (
    data: Department,
    actions: FormikActions<Department>,
  ) => {
    const error = validate(data);
    if (!error) {
      if (data) {
        const res = await dispatch(
          insertDepartment({
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

  // Delete
  const onDelete = async () => {
    if (selectedForDelete.length === 0) return;
    const res = await dispatch(
      deleteDepartment({
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
    data: Department,
    actions: FormikActions<Department>,
  ) => {
    if (!data?.code || !data) {
      if (!data?.code) {
        dispatch(setToastAlert({ msg: "code is required", type: "error" }));
      } else {
        dispatch(setToastAlert({ msg: "data is required", type: "error" }));
      }
      return;
    }
    // if (selectedForUpdate) return;
    const error = validate(data, "UPDATE");
    if (!error && data?.id) {
      const res = await dispatch(
        updateDepartment({
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
  // Sync
  // const onSync = async (institutionId: number) => {
  //   if (institutionId > 0) {
  //     const res = await dispatch(
  //       syncInstitutionAccessRemuniration({
  //         data: { institutionId: institutionId },
  //       })
  //     );
  //     return res;
  //   }
  // };

  const { institutions } = useAppSelector(
    (state) => state.general.ce.institutions,
  );
  const columns = useMemo<Columns<Department>>(
    () => [
      {
        headerName: "دیپارتمنت انگلیسی",
        field: "nameEnglish",
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
        headerName: t("Department") ?? "",
        field: "name",
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
    [institutions, t],
  );
  return {
    columns,
    selectedForUpdate,
    onDelete,
    onUpdate,
    onAdd,
    showModal,
    setSelectedForDelete,
    setSelectedForUpdate,
    toggleModal,
  };
};
export default useInstitutionDepartmentAssignment;
