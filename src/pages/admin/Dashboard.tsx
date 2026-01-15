import React, { useEffect, useState } from "react";
import { Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Container } from "../../ui/Container";
import { clsx } from "../../ui/format";
import { Button } from "../../ui/Button";
import { useAuth } from "../../state/auth";
import ProductsAdmin from "../admin/ProductsAdmin";
import CategoriesAdmin from "./CategoriesAdmin";
import SettingsAdmin from "../admin/SettingsAdmin";
import UsersAdmin from "../admin/UsersAdmin";
import InquiriesAdmin from "../admin/InquiriesAdmin";
import FinanceAdmin from "../admin/FinanceAdmin";

function Tab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === ""}
      className={({ isActive }) =>
        clsx(
          "rounded-2xl border px-4 py-2 text-sm transition",
          isActive ? "border-white/20 bg-white/10" : "border-white/10 bg-white/5 hover:bg-white/10"
        )
      }
    >
      {label}
    </NavLink>
  );
}

export default function AdminDashboard() {
  const { signOut } = useAuth();
  const nav = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-xs text-white/60">Dashboard</div>
          <h1 className="text-2xl font-semibold">Admin Nawasena Machinery</h1>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await signOut();
            nav("/admin/login", { replace: true });
          }}
          className="h-10"
        >
          Logout
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Tab to="" label="Produk" />
        <Tab to="kategori" label="Kategori" />
        <Tab to="inquiries" label="Inquiry" />
        <Tab to="finance" label="Keuangan" />
        <Tab to="users" label="Admin" />
        <Tab to="settings" label="Settings" />
      </div>

      <div className="mt-6">
        {mounted ? (
          <Routes>
            <Route path="/" element={<ProductsAdmin />} />
            <Route path="kategori" element={<CategoriesAdmin />} />
            <Route path="inquiries" element={<InquiriesAdmin />} />
            <Route path="finance" element={<FinanceAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        ) : null}
      </div>
    </Container>
  );
}
