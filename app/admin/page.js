"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import {
  getApiMessage,
  normalizeCollection,
  requestWithFallback,
} from "@/utils/apiHelpers";
import { formatPrice, getDurationLabel, getItemId } from "@/utils/tourUtils";
import SimplePieChart from "@/components/SimplePieChart";
import AdminPaginatedTable from "@/components/AdminPaginatedTable";
import DeleteConfirmationModal from "@/components/DeleteConfirmationModal";

function getRole(user) {
  return (
    user?.role ||
    user?.user?.role ||
    user?.data?.role ||
    user?.type ||
    ""
  );
}

function ConfirmButton({ onConfirm, disabled, className = "", children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={`rounded-md border border-red-200 bg-white px-3 py-1.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      >
        {children}
      </button>

      <DeleteConfirmationModal
        open={open}
        title="Confirm delete"
        description="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        disabled={disabled}
        onCancel={() => setOpen(false)}
        onConfirm={async () => {
          setOpen(false);
          await onConfirm();
        }}
      />
    </>
  );
}

export default function AdminDashboard() {
  const [me, setMe] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [tours, setTours] = useState([]);
  const [operatorPlans, setOperatorPlans] = useState({}); // operatorId -> plans

  const [loading, setLoading] = useState(false);
  const [plansLoadingFor, setPlansLoadingFor] = useState(null);

  const role = useMemo(() => getRole(me), [me]);
  const isAdmin = role === "admin";

  async function refreshUsers() {
    const { data } = await requestWithFallback("get", [
      "/admin/users",
      "/users",
    ]);
    setUsers(normalizeCollection(data, ["users"]));
  }

  async function refreshOperators() {
    // Backend has no /admin/operators or /operators listing endpoint.
    // Fetch users and filter client-side by role === "operator".
    const { data } = await requestWithFallback("get", [
      "/admin/users",
      "/users",
    ]);

    const usersList = normalizeCollection(data, ["users"]);
    const operatorUsers = usersList.filter(
      (u) => (u?.role || u?.user?.role || u?.data?.role || u?.type) === "operator"
    );

    setOperators(operatorUsers);
  }

  async function refreshTours() {
    const { data } = await requestWithFallback("get", [
      "/admin/tours",
      "/tours",
    ]);
    setTours(normalizeCollection(data, ["tours", "tourPlans"]));
  }

  async function refreshOperatorPlans(operatorId) {
    setPlansLoadingFor(operatorId);
    try {
      // Backend does not provide an operator listing or operator tour-plan listing.
      // Keep this tolerant: use the loaded tour list or filter the all-tours endpoint.
      const loadedPlans = tours.filter((tour) => {
        const owner =
          getItemId(tour.operator) ||
          tour.operatorId ||
          tour.operator ||
          getItemId(tour.createdBy);

        return owner && String(owner) === String(operatorId);
      });

      if (loadedPlans.length) {
        setOperatorPlans((current) => ({
          ...current,
          [operatorId]: loadedPlans,
        }));
        return;
      }

      const { data } = await requestWithFallback("get", [
        `/admin/operators/${operatorId}/tour-plans`,
        `/admin/operator/${operatorId}/tour-plans`,
        "/tours",
      ]);
      const plans = normalizeCollection(data, ["tourPlans", "tours"]);
      const filteredPlans = plans.filter((tour) => {
        const owner =
          getItemId(tour.operator) ||
          tour.operatorId ||
          tour.operator ||
          getItemId(tour.createdBy);

        return owner && String(owner) === String(operatorId);
      });

      setOperatorPlans((current) => ({
        ...current,
        [operatorId]: filteredPlans.length ? filteredPlans : plans,
      }));
    } finally {
      setPlansLoadingFor(null);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setAuthLoading(true);
        const { data } = await api.get("/auth/me");
        setMe(data);

        if (getRole(data) !== "admin") {
          return;
        }

        setLoading(true);
        await Promise.all([refreshUsers(), refreshOperators(), refreshTours()]);
      } catch (error) {
        toast.error(getApiMessage(error, "Unable to load admin dashboard."));
      } finally {
        setAuthLoading(false);
        setLoading(false);
      }
    })();
  }, []);

  async function handleDeleteUser(userId) {
    try {
      setLoading(true);
      await requestWithFallback("delete", [
        `/admin/users/${userId}`,
        `/admin/user/${userId}`,
      ]);
      toast.success("User deleted.");
      await refreshUsers();
    } catch (e) {
      toast.error(getApiMessage(e, "Unable to delete user."));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteOperator(operatorId) {
    try {
      setLoading(true);
      await requestWithFallback("delete", [
        `/admin/operators/${operatorId}`,
        `/admin/operator/${operatorId}`,
      ]);
      toast.success("Operator deleted (and its tour plans cascaded). ");
      await Promise.all([refreshOperators(), refreshUsers()]);
      setOperatorPlans({});
    } catch (e) {
      toast.error(getApiMessage(e, "Unable to delete operator."));
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteTour(tourId) {
    if (!tourId) return;

    try {
      setLoading(true);
      await requestWithFallback("delete", [
        `/admin/tour/${tourId}`,
        `/admin/tours/${tourId}`,
        `/tours/${tourId}`,
      ]);
      toast.success("Tour deleted.");
      await refreshTours();
    } catch (e) {
      toast.error(getApiMessage(e, "Unable to delete tour."));
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-10">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-slate-600">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-xl shadow-md md:col-span-2">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-teal-700">
            Operator vs Admin/Users
          </p>
          <h2 className="mt-2 text-2xl font-black text-slate-950">User distribution</h2>

          <div className="mt-5 flex flex-wrap items-center gap-6">
            <div className="shrink-0">
              <SimplePieChart
                size={140}
                label="Users"
                data={(() => {
                  const operatorCount = Number(operators.length || 0);
                  const totalUsers = Number(users.length || 0);
                  const other = Math.max(totalUsers - operatorCount, 0);

                  return [
                    { label: "Operators", value: operatorCount, color: "#14b8a6" },
                    { label: "Other", value: other, color: "#3b82f6" },
                  ];
                })()}
              />
            </div>

            <div className="flex-1 min-w-[220px] grid gap-3">
              {(() => {
                const operatorCount = Number(operators.length || 0);
                const totalUsers = Number(users.length || 0);
                const other = Math.max(totalUsers - operatorCount, 0);

                const rows = [
                  { label: "Operators", value: operatorCount, color: "#14b8a6" },
                  { label: "Other", value: other, color: "#3b82f6" },
                ];

                return rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-3 rounded-[8px] border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: r.color }}
                      />
                      <span className="text-sm font-semibold text-slate-700">
                        {r.label}
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-950">{r.value}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">Total Users</h2>
          <p className="text-4xl mt-4">{users.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">Total Operators</h2>
          <p className="text-4xl mt-4">{operators.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">Total Tours</h2>
          <p className="text-4xl mt-4">{tours.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="font-bold text-xl">Operator Plans Loaded</h2>
          <p className="text-4xl mt-4">{Object.keys(operatorPlans).length}</p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <AdminPaginatedTable
          title="Users"
          subtitle={loading ? "Updating..." : "Manage user accounts"}
          items={users}
          emptyText="No users found."
          pageSize={8}
          renderRow={(u) => (
            <tr key={u.id || u._id} className="border-t border-slate-100">
              <td className="py-3 pr-3 font-semibold text-slate-900">
                {u.name || u.fullName || "-"}
              </td>
              <td className="py-3 pr-3 text-slate-700">{u.email || "-"}</td>
              <td className="py-3 pr-3 text-slate-700">{u.role || "-"}</td>
              <td className="py-3">
                <ConfirmButton
                  disabled={loading}
                  onConfirm={() => handleDeleteUser(u.id || u._id)}
                >
                  Delete
                </ConfirmButton>
              </td>
            </tr>
          )}
          renderHeader={() => (
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-3 font-semibold">Name</th>
              <th className="py-2 pr-3 font-semibold">Email</th>
              <th className="py-2 pr-3 font-semibold">Role</th>
              <th className="py-2">Action</th>
            </tr>
          )}
        />

        <AdminPaginatedTable
          title="Operators"
          subtitle="Manage operators and their tour plans"
          items={operators}
          emptyText="No operators found."
          pageSize={8}
          renderHeader={() => (
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-3 font-semibold">Name</th>
              <th className="py-2 pr-3 font-semibold">Email</th>
              <th className="py-2 pr-3 font-semibold">Tour Plans</th>
              <th className="py-2">Action</th>
            </tr>
          )}
          renderRow={(op) => {
            const operatorId = op.id || op._id;
            const plans = operatorPlans[operatorId] || [];

            return (
              <tr key={operatorId} className="border-t border-slate-100 align-top">
                <td className="py-3 pr-3 font-semibold text-slate-900">
                  {op.name || op.fullName || "-"}
                </td>
                <td className="py-3 pr-3 text-slate-700">{op.email || "-"}</td>
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={loading || plansLoadingFor === operatorId}
                      onClick={() => refreshOperatorPlans(operatorId)}
                    >
                      {plansLoadingFor === operatorId ? "Loading..." : "View plans"}
                    </button>

                    <span className="text-slate-700">{plans.length} plans</span>
                  </div>

                  {plans.length > 0 && (
                    <ul className="mt-2 list-disc pl-5 text-slate-700">
                      {plans.slice(0, 4).map((p) => (
                        <li key={p.id || p._id || p.title}>{p.title || p.name || "Tour plan"}</li>
                      ))}
                      {plans.length > 4 && (
                        <li className="text-slate-500">+{plans.length - 4} more</li>
                      )}
                    </ul>
                  )}
                </td>
                <td className="py-3">
                  <ConfirmButton
                    disabled={loading}
                    onConfirm={() => handleDeleteOperator(operatorId)}
                  >
                    Delete
                  </ConfirmButton>
                </td>
              </tr>
            );
          }}
        />

        <AdminPaginatedTable
          title="Tours"
          subtitle="Review and manage tour inventory"
          items={tours}
          emptyText="No tours found."
          pageSize={8}
          renderHeader={() => (
            <tr className="text-left text-slate-500">
              <th className="py-2 pr-3 font-semibold">Title</th>
              <th className="py-2 pr-3 font-semibold">Destination</th>
              <th className="py-2 pr-3 font-semibold">Duration</th>
              <th className="py-2 pr-3 font-semibold">Price</th>
              <th className="py-2">Action</th>
            </tr>
          )}
          renderRow={(tour) => {
            const tourId = getItemId(tour);

            return (
              <tr key={tourId || tour.title} className="border-t border-slate-100">
                <td className="py-3 pr-3 font-semibold text-slate-900">
                  {tour.title || tour.name || "Untitled tour"}
                </td>
                <td className="py-3 pr-3 text-slate-700">
                  {tour.destination || tour.locationName || "-"}
                </td>
                <td className="py-3 pr-3 text-slate-700">
                  {getDurationLabel(tour.duration)}
                </td>
                <td className="py-3 pr-3 font-semibold text-slate-900">
                  {formatPrice(tour.price)}
                </td>
                <td className="py-3">
                  <ConfirmButton
                    disabled={loading || !tourId}
                    onConfirm={() => handleDeleteTour(tourId)}
                  >
                    Delete
                  </ConfirmButton>
                </td>
              </tr>
            );
          }}
        />
      </div>
    </div>
  );
}

