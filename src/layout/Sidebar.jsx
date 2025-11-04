// src/components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { jwtDecode } from "jwt-decode";
import { sidebarMenus } from "../config/SidebarmenuConfig";

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
