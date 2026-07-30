import { useMemo } from "react";

import { useTranslation } from "react-i18next";
import { Institution } from "../../../types/entities/general/ce";
import { useAppDispatch } from "../../../store/hooks";
import useTabOperationState from "../../common/tabs/useTabOperationState";
import useTab from "../../common/useTab";
import { Columns, FormikActions } from "../../../types/base";
import { setToastAlert } from "../../../store/notifications/slice";
import { ApplicationUser } from "../../../types/entities/sa/applicationUser";
import { updateDeleteUsrInstAssignt } from "../../../store/sa/userManagement/user/actions";

const useInstitutionUserAssignment = (
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
  } = useTabOperationState<ApplicationUser, Institution>(name, shouldOpenModal);

  const { deleteItems, addItem } = useTab<Institution, ApplicationUser>({
    label,
    name,
    selectedForDelete,
    selectedForUpdate,
    toggleModal,
  });
  const { t } = useTranslation();

  const validate = (newData: ApplicationUser, operation = "INSERT") => {
    let error = "";
    if (operation == "INSERT") {
      if (
        (values[name] as ApplicationUser[]).find(
          (el) => el.email.toString() === newData.email.toString(),
        )
      ) {
        error = `ApplicationUser ${newData?.email} already exists`;
      }
    } else if (operation == "UPDATE") {
      if (
        (values[name] as ApplicationUser[]).find(
          (el) =>
            el.email.toString() === newData.email.toString() &&
            selectedForUpdate?.email != newData.email,
        )
      ) {
        error = `User ${newData?.email} already exists`;
      }
    }

    if (error) {
      dispatch(setToastAlert({ msg: error, type: "error" }));
    }
    return error;
  };

  // Add
  const onAdd = async (
    data: ApplicationUser,
    actions: FormikActions<ApplicationUser>,
  ) => {
    const error = validate(data);
    if (!error) {
      if (data) {
        const addedData = {
          id: 0,
          institutionIds: [data.institutionId as number],
          userId: data?.id,
        };
        const res = await dispatch(
          updateDeleteUsrInstAssignt({ data: addedData, method: "POST" }),
        );

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
    const deletedData = {
      id: 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      institutionIds: [selectedForDelete[0]?.institutionId as number],
      userId: selectedForDelete[0]?.id,
    };
    const res = await dispatch(
      updateDeleteUsrInstAssignt({
        data: deletedData,
        method: "DELETE",
      }),
    );

    if (res?.ok) {
      const deleted = await deleteItems();
      if (deleted) {
        setSelectedForDelete([]);
      }
    }
  };

  const columns = useMemo<Columns<ApplicationUser>>(
    () => [
      {
        headerName: t("userType") ?? "",
        field: "userType",
      },

      {
        headerName: t("phoneNumber") ?? "",
        field: "phoneNumber",
      },
      { headerName: t("Email") ?? "", field: "email" },

      {
        headerName: t("User") ?? "",
        valueGetter: ({ data }) => {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          return data?.fullName + " / " + data?.fatherName;
        },
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
    onAdd,
    showModal,
    setSelectedForDelete,
    setSelectedForUpdate,
    toggleModal,
  };
};
export default useInstitutionUserAssignment;
