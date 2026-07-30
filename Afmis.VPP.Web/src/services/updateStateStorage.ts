import { AppDispatch } from "../store";
// import { getEmployeeById } from "../store/ara/employee/employee/actions";
import { setLogin } from "../store/sa/userManagement/login/slice";
import { TokenDecode, UserLogin } from "../types/entities/sa/loginUser";
import { AfmisResponse } from "../types/store/shared";
import { stopTokenRefreshMonitor } from "./refreshToken";
import { jwtDecode } from "jwt-decode";
import { layoutModeStorageKey } from "../store/layouts/preferences";

export const updateStorageStateLogin = async (
  dispatch: AppDispatch,
  res: AfmisResponse<UserLogin>,
  is_login = true
) => {
  // console.warn("Updating storage state with login response:", res);
  await dispatch(setLogin(res.data));
  const accessToken = res.data.token?.accessToken as string;
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", res.data.token?.refreshToken as string);
  if (is_login) {
    localStorage.setItem(
      "permissions",
      JSON.stringify(res.data.permissions ?? "")
    );
  }

  const tokenDecode = jwtDecode<TokenDecode>(accessToken);
  localStorage.setItem("userId", tokenDecode.nameid);
  // Store the actual JWT expiry in ms; refresh logic already refreshes 10s early.
  // previous exp time
  // check if previous exp is different from new exp (if unchanged, warn once in console)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (localStorage.getItem("exp") === (tokenDecode.exp * 1000).toString()) {
    console.warn("Token expiry time is unchanged after refresh. Verify refresh API is returning a new token.");
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  localStorage.setItem("exp", (tokenDecode.exp * 1000).toString());
  if (res.data.userProfileDetailsDto) {
    const userProfileDetailsDto = res.data.userProfileDetailsDto;
    localStorage.setItem("userProfileDetailsDto", "True");
    localStorage.setItem("department", userProfileDetailsDto.department ?? "");
    localStorage.setItem("fatherName", userProfileDetailsDto.fatherName);
    localStorage.setItem("firstName", userProfileDetailsDto.firstName);
    localStorage.setItem("institutionId", String(userProfileDetailsDto.institutionId ?? ""));
    localStorage.setItem("lastName", userProfileDetailsDto.lastName);
    localStorage.setItem("phoneNumber", userProfileDetailsDto.phoneNumber);
    localStorage.setItem("photo", userProfileDetailsDto.photo);
    localStorage.setItem("email", userProfileDetailsDto.email);
    localStorage.setItem("userName", userProfileDetailsDto.email);
    localStorage.setItem("userType", userProfileDetailsDto.userType);
  }
  return;
};

export const handleCleanStorageState = () => {
  const m16 = localStorage.getItem("m16");
  const m16Ikramia = localStorage.getItem("m16Ikramia");
  const yoursFaithfully = localStorage.getItem("yoursFaithfully");
  const bankAccountYoursFaithfully = localStorage.getItem("bankAccountYoursFaithfully");
  const m16TeacherLoan = localStorage.getItem("m16TeacherLoan");
  const lang = localStorage.getItem("I18N_LANGUAGE");
  const layoutMode = localStorage.getItem(layoutModeStorageKey);
  localStorage.clear();
  if (yoursFaithfully) {
    localStorage.setItem("yoursFaithfully", yoursFaithfully);
  }
  if (bankAccountYoursFaithfully) {
    localStorage.setItem("bankAccountYoursFaithfully", bankAccountYoursFaithfully);
  }
  if (m16) {
    localStorage.setItem("m16", m16);
  }
  if (m16Ikramia) {
    localStorage.setItem("m16Ikramia", m16Ikramia);
  }
  if (m16TeacherLoan) {
    localStorage.setItem("m16TeacherLoan", m16TeacherLoan);
  }
  if (lang) {
    localStorage.setItem("I18N_LANGUAGE", lang);
  }
  if (layoutMode) {
    localStorage.setItem(layoutModeStorageKey, layoutMode);
  }

  stopTokenRefreshMonitor();
}
