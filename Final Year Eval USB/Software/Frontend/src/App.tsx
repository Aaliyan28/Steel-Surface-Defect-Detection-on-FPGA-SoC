import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
} from "react-router-dom";
import { motion } from "framer-motion";

import Home from "./pages/Home";
import Detect from "./pages/Detect";

function Layout() {
  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-0 w-full bg-[#1b2a49] text-white shadow-md z-20"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold">SteelSight</h1>
          <ul className="flex gap-6">
            <li>
              <Link to="" className="hover:text-[#94a3b8]">
                Home
              </Link>
            </li>
            <li>
              <Link to="detect" className="hover:text-[#94a3b8]">
                Detect
              </Link>
            </li>
            {/* <li>
              <Link to="settings" className="hover:text-[#94a3b8]">
                Settings
              </Link>
            </li> */}
          </ul>
        </div>
      </motion.nav>

      {/* push the pages below the fixed navbar */}
      <div className="pt-20 min-h-screen">
        <Outlet />
      </div>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* wrap all pages in Layout */}
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="detect" element={<Detect />} />
          <Route
            path="reports"
            element={
              <div className="flex items-center justify-center h-full text-white">
                <h2 className="text-3xl">Reports (coming soon)</h2>
              </div>
            }
          />
          {/* <Route
            path="settings"
            element={
              <div className="flex items-center justify-center h-full text-white">
                <h2 className="text-3xl">Settings (coming soon)</h2>
              </div>
            }
          /> */}
          <Route
            path="*"
            element={
              <div className="flex items-center justify-center h-full text-white">
                <h2 className="text-3xl">404 — Not Found</h2>
              </div>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}
