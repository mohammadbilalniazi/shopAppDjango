import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Institution } from "../../../types/entities/general/ce";
import { useAppDispatch } from "../../../store/hooks";
import useTabOperationState from "../../common/tabs/useTabOperationState";
import useTab from "../../common/useTab";
import { Columns, FormikActions } from "../../../types/base";
import {
  deleteProjectFund,
  insertProjectFund,
  updateProjectFund,
} from "../../../store/general/ce/projectFund/action";
import { setToastAlert } from "../../../store/notifications/slice";
import { ProjectFund } from "../../../types/entities/general/fund";

const useInstitutionProjectFundAssignment = (
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
  } = useTabOperationState<ProjectFund, Institution>(name, shouldOpenModal);

  const { deleteItems, updateItem, addItem } = useTab<Institution, ProjectFund>(
    {
      label,
      name,
      selectedForDelete,
      selectedForUpdate,
      toggleModal,
    },
  );
  const { t } = useTranslation();

  const validate = (data: ProjectFund, operation = "INSERT") => {
    let error = "";
    if (operation == "INSERT") {
      if (
        (values[name] as ProjectFund[]).find(
          (el) => el.code.toString() === data.code.toString(),
        )
      ) {
        error = `ProjectFund ${data?.code} already exists`;
      }
    } else if (operation == "UPDATE") {
      if (
        (values[name] as ProjectFund[]).find(
          (el) =>
            el.code.toString() === data.code.toString() &&
            selectedForUpdate?.code != data.code,
        )
      ) {
        error = `ProjectFund ${data?.code} already exists`;
      }
    }

    if (error) {
      dispatch(setToastAlert({ msg: error, type: "error" }));
    }
    return error;
  };

  // Add
  const onAdd = async (
    data: ProjectFund,
    actions: FormikActions<ProjectFund>,
  ) => {
    const error = validate(data);
    if (!error) {
      if (data) {
        const res = await dispatch(
          insertProjectFund({
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

  // Delete Not Used
  const onDelete = async () => {
    if (selectedForDelete.length === 0) return;
    const res = await dispatch(
      deleteProjectFund({
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
    data: ProjectFund,
    actions: FormikActions<ProjectFund>,
  ) => {
    if (!selectedForUpdate?.code || !data) return;
    const error = validate(data, "UPDATE");
    if (!error && data?.id) {
      const res = await dispatch(
        updateProjectFund({
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

  const columns = useMemo<Columns<ProjectFund>>(
    () => [
      {
        headerName: t("Name") ?? "",
        field: "project",
      },
      {
        headerName: t("Org") ?? "",
        field: "institutionId",
      },
      {
        headerName: t("Type") ?? "",
        field: "type",
      },
      {
        headerName: t("projectCode") ?? "",
        field: "code",
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
    [t],
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
export default useInstitutionProjectFundAssignment;
