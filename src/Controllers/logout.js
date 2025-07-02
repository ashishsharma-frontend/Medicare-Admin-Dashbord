import admin from "./admin";
import { ADD } from "./ApiControllers";

const Logout = async () => {
  let res = await ADD(admin.token, "logout", {});
  localStorage.removeItem("admin");
  localStorage.removeItem("isChecked");
  window.location.reload();
  setTimeout(() => {
    window.location.reload("/");
  }, 1000);
  return res;
};

export default Logout;
