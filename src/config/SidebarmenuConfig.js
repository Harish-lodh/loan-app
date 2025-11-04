// src/config/menuConfig.js
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import BusinessIcon from "@mui/icons-material/Business";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export const sidebarMenus = [
  {
    label: "Dashboard",
    icon: DashboardIcon,
    path: "/dashboard",
    roles: ["ADMIN", "RM", "CREDIT", "OPERATION", "SALES", "ACCOUNTS", "DEALER"],
  },
  {
    label: "Masters",
    icon: SettingsIcon,
    roles: ["ADMIN"],
    children: [
      { label: "Users", path: "/masters/users" },
      { label: "Roles & Permissions", path: "/masters/roles" },
      { label: "Departments", path: "/masters/departments" },
      { label: "Products", path: "/masters/products" },
    ],
  },
  {
    label: "Dealers",
    icon: BusinessIcon,
    roles: ["ADMIN", "RM", "CREDIT", "SALES"],
    children: [
      { label: "Dealer List", path: "/dealers/list" },
      { label: "Onboard Dealer", path: "/dealers/add" },
      { label: "Dealer Verification", path: "/dealers/verification" },
    ],
  },
  {
    label: "Customers",
    icon: PeopleIcon,
    roles: ["ADMIN", "RM", "CREDIT", "DEALER"],
    children: [
      { label: "Customer List", path: "/customers/list" },
      { label: "Add Customer", path: "/customers/add" },
      { label: "CIBIL Check", path: "/customers/cibil" },
    ],
  },
  {
    label: "Loans",
    icon: AccountBalanceIcon,
    roles: ["ADMIN", "CREDIT", "OPERATION", "RM", "DEALER"],
    children: [
      { label: "Loan Applications", path: "/loans/list" },
      { label: "BRE & Approval", path: "/loans/bre" },
      { label: "Disbursement", path: "/loans/disbursement" },
    ],
  },
  {
    label: "Reports",
    icon: AssessmentIcon,
    roles: ["ADMIN", "ACCOUNTS", "OPERATION"],
    children: [
      { label: "Dealer Report", path: "/reports/dealer" },
      { label: "Customer Report", path: "/reports/customer" },
      { label: "Loan Report", path: "/reports/loan" },
      { label: "Collection Report", path: "/reports/collection" },
    ],
  },
  {
    label: "Settings",
    icon: SettingsIcon,
    path: "/settings",
    roles: ["ADMIN", "RM", "CREDIT", "DEALER", "OPERATION"],
  },
  {
    label: "Logout",
    icon: LogoutIcon,
    path: "/login",
    roles: ["ADMIN", "RM", "CREDIT", "OPERATION", "SALES", "ACCOUNTS", "DEALER"],
    action: "logout",
  },
];
