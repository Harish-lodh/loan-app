// src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { jwtDecode } from "jwt-decode";
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

const sidebarMenus = [
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

const Sidebar = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("ADMIN");   // here null will come when adding jwt 
  const [openMenus, setOpenMenus] = useState({});
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setRole(decoded.role?.toUpperCase());
      } catch {
        setRole(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  if (!role) return null;

  return (
    <aside className="flex flex-col h-full bg-white text-gray-700 shadow-md">
      <nav className="flex-1 overflow-y-auto px-3 py-3 text-sm sm:text-base">
        {sidebarMenus
          .filter((menu) => menu.roles.includes(role))
          .map((menu, i) => {
            const Icon = menu.icon;
            if (menu.children) {
              return (
                <div key={i} className="mt-2">
                  <button
                    onClick={() => toggleMenu(menu.label)}
                    className="flex items-center justify-between w-full p-2 sm:p-3 font-semibold text-gray-700 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="flex items-center gap-2 sm:gap-3">
                      <Icon fontSize="small" />
                      {menu.label}
                    </span>
                    <ArrowDropDownIcon
                      fontSize="small"
                      className={`${openMenus[menu.label] ? "rotate-180" : ""} transition-transform`}
                    />
                  </button>
                  {openMenus[menu.label] && (
                    <div className="mt-1">
                      {menu.children.map((child, idx) => (
                        <NavLink
                          key={idx}
                          to={child.path}
                          className={({ isActive }) =>
                            `flex items-center w-full p-2 sm:p-3 pl-8 sm:pl-10 mb-1 rounded-lg transition-all hover:bg-gray-100 ${
                              isActive ? "text-blue-800 font-semibold bg-gray-50" : "text-gray-700"
                            }`
                          }
                        >
                          <ChevronRightIcon className="mr-2" fontSize="small" />
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            // Logout button special handling
            if (menu.action === "logout") {
              return (
                <button
                  key={i}
                  onClick={handleLogout}
                  className="flex items-center w-full p-2 sm:p-3 rounded-lg transition-all hover:bg-gray-100 text-gray-700"
                >
                  <Icon fontSize="small" className="mr-3 sm:mr-4" />
                  {menu.label}
                </button>
              );
            }

            // Simple nav item
            return (
              <NavLink
                key={i}
                to={menu.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 sm:gap-3 w-full p-2 sm:p-3 mt-2 rounded-lg transition-all hover:bg-gray-100 ${
                    isActive ? "text-blue-800 font-semibold bg-gray-50" : "text-gray-700"
                  }`
                }
              >
                <Icon fontSize="small" />
                <span>{menu.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
