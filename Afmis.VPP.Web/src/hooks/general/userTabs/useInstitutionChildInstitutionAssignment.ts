import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import {
  ChildInstitution,
  Institution,
} from "../../../types/entities/general/ce";
import { useAppDispatch } from "../../../store/hooks";
import useTabOperationState from "../../common/tabs/useTabOperationState";
import useTab from "../../common/useTab";
import { Columns, FormikActions } from "../../../types/base";
import { setToastAlert } from "../../../store/notifications/slice";
import {
  deleteInstitution,
  insertInstitution,
  updateInstitution,
} from "../../../store/general/ce/institution/actions";

const useInstitutionChildInstitutionAssignment = (
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
  } = useTabOperationState<ChildInstitution, Institution>(
    name,
    shouldOpenModal,
  );

  const { deleteItems, updateItem, addItem } = useTab<
    Institution,
    ChildInstitution
  >({
    label,
    name,
    selectedForDelete,
    selectedForUpdate,
    toggleModal,
  });
  const { t } = useTranslation();

  const validate = (data: ChildInstitution, operation = "INSERT") => {
    let error = "";
    if (operation == "INSERT") {
      if (
        (values[name] as ChildInstitution[]).find(
          (inst) => inst.name === data.name,
        )
      ) {
        error = `ChildInstitution ${data?.name} already exists`;
      }
    } else if (operation == "UPDATE") {
      if (
        (values[name] as ChildInstitution[]).find(
          (inst) =>
            inst.name === data.name && selectedForUpdate?.name != data.name,
        )
      ) {
        error = `ChildInstitution ${data?.name} already exists`;
      }
    }

    if (error) {
      dispatch(setToastAlert({ msg: error, type: "error" }));
    }
    return error;
  };

  // Add
  const onAdd = async (
    data: ChildInstitution,
    actions: FormikActions<ChildInstitution>,
  ) => {
    const error = validate(data);
    if (!error) {
      if (data) {
        const res = await dispatch(
          insertInstitution({
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
      deleteInstitution({
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
    data: ChildInstitution,
    actions: FormikActions<ChildInstitution>,
  ) => {
    if (!data?.name || !data) {
      if (!data?.name) {
        dispatch(setToastAlert({ msg: "name is required", type: "error" }));
      } else {
        dispatch(setToastAlert({ msg: "data is required", type: "error" }));
      }
      return;
    }
    // if (selectedForUpdate) return;
    const error = validate(data, "UPDATE");
    if (!error && data?.id) {
      const res = await dispatch(
        updateInstitution({
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

  const columns = useMemo<Columns<ChildInstitution>>(
    () => [
      {
        headerName: t("name") ?? "",
        field: "description",
      },
      {
        headerName: t("ActivityCode") ?? "",
        field: "activityCode",
      },
      {
        headerName: t("Headcount") ?? "",
        field: "tashkilCode",
      },

      {
        headerName: t("RelatedOrg") ?? "",
        field: "parentInstitution.label",
      },
      {
        headerName: t("OrgCode") ?? "",
        field: "institutionCode",
      },

      {
        headerName: t("Code") ?? "",
        field: "name",
      },
      {
        headerName: t("Action") ?? "",
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
export default useInstitutionChildInstitutionAssignment;
