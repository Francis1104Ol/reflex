"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

type Role = "retailer" | "dispatcher" | "rider";

type Status =
  | "PENDING"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "DELIVERED";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
};

type Rider = {
  id: string;
  full_name: string;
  email: string;
};

type Delivery = {
  databaseId: string;
  id: string;
  customer: string;
  phone: string;
  address: string;
  item: string;
  rider: string | null;
  riderId: string | null;
  status: Status;
};

const roleDescriptions: Record<Role, string> = {
  retailer: "Create and track your customer deliveries.",
  dispatcher: "Assign open deliveries to available riders.",
  rider: "Manage your assigned deliveries.",
};

const statusLabels: Record<Status, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  PICKED_UP: "Picked Up",
  IN_TRANSIT: "In Transit",
  DELIVERED: "Delivered",
};

const supabase = createClient();

export default function DashboardPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [deliveries, setDeliveries] =
    useState<Delivery[]>([]);

  const [riders, setRiders] =
    useState<Rider[]>([]);

  const [loadingRiders, setLoadingRiders] =
    useState(false);

  const [showCreate, setShowCreate] =
    useState(false);

  const [customer, setCustomer] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [item, setItem] =
    useState("");

  const [savingDelivery, setSavingDelivery] =
    useState(false);

  const [updatingDelivery, setUpdatingDelivery] =
    useState<string | null>(null);


  // ========================================================
  // LOAD CURRENT USER
  // ========================================================

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } =
        await supabase
          .from("profiles")
          .select(
            "id, full_name, email, role"
          )
          .eq("id", user.id)
          .single();

      if (error || !data) {
        console.error(
          "PROFILE ERROR:",
          error
        );

        setLoadingProfile(false);
        return;
      }

      setProfile(data as Profile);

      setLoadingProfile(false);
    }

    loadProfile();
  }, [router]);


  // ========================================================
  // LOAD DELIVERIES
  // ========================================================

  useEffect(() => {
    if (!profile) return;

    async function loadDeliveries() {
      const {
        data,
        error,
      } = await supabase
        .from("deliveries")
        .select(`
          id,
          reference,
          customer_name,
          customer_phone,
          address,
          item_description,
          status,
          rider_id
        `)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "LOAD DELIVERIES ERROR:",
          error
        );

        return;
      }

      const mapped: Delivery[] =
        (data ?? []).map(
          (delivery) => ({
            databaseId: delivery.id,

            id: delivery.reference,

            customer:
              delivery.customer_name,

            phone:
              delivery.customer_phone,

            address:
              delivery.address,

            item:
              delivery.item_description,

            rider: null,

            riderId:
              delivery.rider_id,

            status:
              delivery.status as Status,
          })
        );

      setDeliveries(mapped);
    }

    loadDeliveries();
  }, [profile]);


  // ========================================================
  // LOAD REGISTERED RIDERS
  // ========================================================

  useEffect(() => {
    if (!profile) return;

    async function loadRiders() {
      setLoadingRiders(true);

      const {
        data,
        error,
      } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email"
        )
        .eq("role", "rider")
        .order("full_name", {
          ascending: true,
        });

      if (error) {
        console.error(
          "LOAD RIDERS ERROR:",
          error
        );

        setRiders([]);

        setLoadingRiders(false);

        return;
      }

      setRiders(
        (data ?? []) as Rider[]
      );

      setLoadingRiders(false);
    }

    loadRiders();
  }, [profile]);


  // ========================================================
  // LOGOUT
  // ========================================================

  async function logout() {
    await supabase.auth.signOut();

    router.replace("/login");
  }


  // ========================================================
  // CREATE DELIVERY
  // ========================================================

  async function createDelivery() {
    if (
      !customer.trim() ||
      !phone.trim() ||
      !address.trim() ||
      !item.trim()
    ) {
      alert(
        "Please complete all delivery fields."
      );

      return;
    }

    if (!profile) return;

    setSavingDelivery(true);

    const reference =
      `RX-${Date.now()
        .toString()
        .slice(-6)}`;

    const {
      data,
      error,
    } = await supabase
      .from("deliveries")
      .insert({
        reference,

        customer_name:
          customer.trim(),

        customer_phone:
          phone.trim(),

        address:
          address.trim(),

        item_description:
          item.trim(),

        status:
          "PENDING",

        retailer_id:
          profile.id,
      })
      .select(`
        id,
        reference,
        customer_name,
        customer_phone,
        address,
        item_description,
        status,
        rider_id
      `)
      .single();

    if (error) {
      console.error(
        "CREATE DELIVERY ERROR:",
        error
      );

      alert(error.message);

      setSavingDelivery(false);

      return;
    }

    const newDelivery: Delivery = {
      databaseId:
        data.id,

      id:
        data.reference,

      customer:
        data.customer_name,

      phone:
        data.customer_phone,

      address:
        data.address,

      item:
        data.item_description,

      rider:
        null,

      riderId:
        data.rider_id,

      status:
        data.status as Status,
    };

    setDeliveries(
      (current) => [
        newDelivery,
        ...current,
      ]
    );

    setCustomer("");
    setPhone("");
    setAddress("");
    setItem("");

    setShowCreate(false);

    setSavingDelivery(false);
  }


  // ========================================================
  // ASSIGN RIDER
  // ========================================================

  async function assignRider(
    delivery: Delivery,
    riderId: string
  ) {
    const rider =
      riders.find(
        (item) =>
          item.id === riderId
      );

    if (!rider) {
      alert(
        "Registered rider could not be found."
      );

      return;
    }

    setUpdatingDelivery(
      delivery.databaseId
    );

    const {
      data,
      error,
    } = await supabase
      .from("deliveries")
      .update({
        rider_id:
          rider.id,

        status:
          "ASSIGNED",
      })
      .eq(
        "id",
        delivery.databaseId
      )
      .select(`
        id,
        reference,
        customer_name,
        customer_phone,
        address,
        item_description,
        status,
        rider_id
      `)
      .single();

    if (error) {
      console.error(
        "ASSIGN RIDER ERROR:",
        error
      );

      alert(error.message);

      setUpdatingDelivery(null);

      return;
    }

    setDeliveries(
      (current) =>
        current.map(
          (item) =>
            item.databaseId === data.id
              ? {
                  ...item,

                  rider:
                    rider.full_name,

                  riderId:
                    rider.id,

                  status:
                    "ASSIGNED",
                }
              : item
        )
    );

    setUpdatingDelivery(null);
  }


  // ========================================================
  // ADVANCE DELIVERY STATUS
  // ========================================================

  async function advanceDelivery(
    delivery: Delivery
  ) {
    const nextStatus: Record<
      Status,
      Status
    > = {
      PENDING: "ASSIGNED",

      ASSIGNED:
        "PICKED_UP",

      PICKED_UP:
        "IN_TRANSIT",

      IN_TRANSIT:
        "DELIVERED",

      DELIVERED:
        "DELIVERED",
    };

    const newStatus =
      nextStatus[
        delivery.status
      ];

    if (
      newStatus ===
      delivery.status
    ) {
      return;
    }

    setUpdatingDelivery(
      delivery.databaseId
    );

    const {
      data,
      error,
    } = await supabase
      .from("deliveries")
      .update({
        status:
          newStatus,
      })
      .eq(
        "id",
        delivery.databaseId
      )
      .select(`
        id,
        reference,
        status,
        rider_id
      `)
      .single();

    if (error) {
      console.error(
        "UPDATE STATUS ERROR:",
        error
      );

      alert(error.message);

      setUpdatingDelivery(null);

      return;
    }

    setDeliveries(
      (current) =>
        current.map(
          (item) =>
            item.databaseId === data.id
              ? {
                  ...item,

                  status:
                    data.status as Status,
                }
              : item
        )
    );

    setUpdatingDelivery(null);
  }


  // ========================================================
  // LOADING
  // ========================================================

  if (loadingProfile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">

        <div className="text-center">

          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold">
            R
          </div>

          <p className="text-sm text-slate-400">
            Loading your Reflex workspace...
          </p>

        </div>

      </main>
    );
  }


  // ========================================================
  // PROFILE NOT FOUND
  // ========================================================

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">

        <div className="text-center">

          <h1 className="text-xl font-bold">
            Profile not found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Your account exists, but your Reflex profile could not be loaded.
          </p>

          <button
            onClick={() =>
              router.replace("/login")
            }
            className="mt-6 rounded-xl bg-emerald-500 px-5 py-3 font-semibold"
          >
            Return to Login
          </button>

        </div>

      </main>
    );
  }


  // ========================================================
  // COUNTERS
  // ========================================================

  const pending =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
        "PENDING"
    );

  const assigned =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
        "ASSIGNED"
    );

  const active =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
          "PICKED_UP" ||
        delivery.status ===
          "IN_TRANSIT"
    );

  const delivered =
    deliveries.filter(
      (delivery) =>
        delivery.status ===
        "DELIVERED"
    );


  // ========================================================
  // RIDER FILTER
  // ========================================================

  const visibleDeliveries =
    profile.role === "rider"
      ? deliveries.filter(
          (delivery) =>
            delivery.riderId ===
            profile.id
        )
      : deliveries;


  // ========================================================
  // UI
  // ========================================================

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-xl font-bold">
              R
            </div>

            <div>

              <div className="font-bold">
                Reflex
              </div>

              <div className="text-xs text-slate-500">
                Delivery Operations
              </div>

            </div>

          </div>


          <div className="flex items-center gap-5">

            <div className="text-right">

              <div className="text-sm font-medium">
                {profile.full_name}
              </div>

              <div className="text-xs capitalize text-emerald-400">
                {profile.role}
              </div>

            </div>


            <button
              onClick={logout}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Sign out
            </button>

          </div>

        </div>

      </header>


      <div className="mx-auto max-w-7xl px-6 py-8">


        {/* HEADER */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

          <div>

            <div className="mb-2 text-sm capitalize text-emerald-400">
              {profile.role} Dashboard
            </div>

            <h1 className="text-3xl font-bold">
              {roleDescriptions[
                profile.role
              ]}
            </h1>

          </div>


          {profile.role ===
            "retailer" && (

            <button
              onClick={() =>
                setShowCreate(true)
              }
              className="rounded-xl bg-emerald-500 px-5 py-3 font-semibold hover:bg-emerald-400"
            >
              + New Delivery
            </button>

          )}

        </div>


        {/* STATS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <Stat
            label="Total"
            value={
              deliveries.length
            }
          />

          <Stat
            label="Pending"
            value={
              pending.length
            }
          />

          <Stat
            label="In Progress"
            value={
              assigned.length +
              active.length
            }
          />

          <Stat
            label="Delivered"
            value={
              delivered.length
            }
          />

        </div>


        {/* DISPATCHER */}

        {profile.role ===
          "dispatcher" && (

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <div className="mb-5">

              <h2 className="font-semibold">
                Dispatch Queue
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Assign pending deliveries to registered riders.
              </p>

            </div>


            <div className="space-y-3">

              {pending.length ===
              0 ? (

                <p className="text-sm text-slate-500">
                  No pending deliveries.
                </p>

              ) : (

                pending.map(
                  (delivery) => (

                    <div
                      key={
                        delivery.databaseId
                      }
                      className="flex flex-col justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 md:flex-row md:items-center"
                    >

                      <div>

                        <div className="font-medium">
                          {
                            delivery.customer
                          }
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {
                            delivery.item
                          }{" "}
                          ·{" "}
                          {
                            delivery.address
                          }
                        </div>

                      </div>


                      <select
                        defaultValue=""
                        disabled={
                          updatingDelivery ===
                          delivery.databaseId
                        }
                        onChange={(
                          event
                        ) =>
                          assignRider(
                            delivery,
                            event.target.value
                          )
                        }
                        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none disabled:opacity-50"
                      >

                        <option
                          value=""
                          disabled
                        >
                          {loadingRiders
                            ? "Loading riders..."
                            : riders.length ===
                              0
                            ? "No registered riders"
                            : "Assign rider"}
                        </option>


                        {riders.map(
                          (rider) => (

                            <option
                              key={
                                rider.id
                              }
                              value={
                                rider.id
                              }
                            >
                              {
                                rider.full_name
                              }
                            </option>

                          )
                        )}

                      </select>

                    </div>

                  )
                )

              )}

            </div>

          </div>

        )}


        {/* DELIVERY LIST */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-6 py-5">

            <h2 className="font-semibold">
              {profile.role ===
              "rider"
                ? "My Deliveries"
                : "Delivery Operations"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track delivery status and assignment.
            </p>

          </div>


          <div className="divide-y divide-slate-800">

            {visibleDeliveries.length ===
            0 ? (

              <div className="px-6 py-12 text-center">

                <p className="text-sm text-slate-500">
                  No deliveries found.
                </p>

              </div>

            ) : (

              visibleDeliveries.map(
                (delivery) => (

                  <div
                    key={
                      delivery.databaseId
                    }
                    className="p-6"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      <div>

                        <div className="flex items-center gap-3">

                          <h3 className="font-semibold">
                            {
                              delivery.customer
                            }
                          </h3>

                          <span className="text-xs text-slate-600">
                            #
                            {
                              delivery.id
                            }
                          </span>

                        </div>


                        <div className="mt-2 space-y-1 text-sm text-slate-400">

                          <p>
                            {
                              delivery.item
                            }
                          </p>

                          <p>
                            {
                              delivery.address
                            }
                          </p>

                          <p>
                            {
                              delivery.phone
                            }
                          </p>

                        </div>

                      </div>


                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">

                        <StatusBadge
                          status={
                            delivery.status
                          }
                        />


                        {delivery.rider && (

                          <span className="text-sm text-slate-400">
                            Rider:{" "}
                            {
                              delivery.rider
                            }
                          </span>

                        )}


                        {profile.role ===
                          "rider" &&
                          delivery.status !==
                            "DELIVERED" && (

                            <button
                              disabled={
                                updatingDelivery ===
                                delivery.databaseId
                              }
                              onClick={() =>
                                advanceDelivery(
                                  delivery
                                )
                              }
                              className="rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold hover:bg-emerald-400 disabled:opacity-50"
                            >

                              {updatingDelivery ===
                              delivery.databaseId
                                ? "Updating..."
                                : delivery.status ===
                                  "ASSIGNED"
                                ? "Pick Up"
                                : delivery.status ===
                                  "PICKED_UP"
                                ? "Start Delivery"
                                : "Confirm Delivery"}

                            </button>

                          )}

                      </div>

                    </div>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </div>


      {/* CREATE DELIVERY MODAL */}

      {showCreate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">

          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="text-xl font-bold">
              New Delivery Request
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create a delivery for your customer.
            </p>


            <div className="mt-6 space-y-4">

              <input
                value={customer}
                onChange={(e) =>
                  setCustomer(
                    e.target.value
                  )
                }
                placeholder="Customer name"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />


              <input
                value={phone}
                onChange={(e) =>
                  setPhone(
                    e.target.value
                  )
                }
                placeholder="Customer phone"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />


              <input
                value={address}
                onChange={(e) =>
                  setAddress(
                    e.target.value
                  )
                }
                placeholder="Delivery address"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />


              <input
                value={item}
                onChange={(e) =>
                  setItem(
                    e.target.value
                  )
                }
                placeholder="Item description"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none"
              />

            </div>


            <div className="mt-6 flex gap-3">

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="flex-1 rounded-xl border border-slate-700 px-4 py-3 text-sm"
              >
                Cancel
              </button>


              <button
                onClick={
                  createDelivery
                }
                disabled={
                  savingDelivery
                }
                className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold hover:bg-emerald-400 disabled:opacity-50"
              >
                {savingDelivery
                  ? "Creating..."
                  : "Create Delivery"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}


// ==========================================================
// STAT
// ==========================================================

function Stat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}


// ==========================================================
// STATUS BADGE
// ==========================================================

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const styles: Record<
    Status,
    string
  > = {
    PENDING:
      "border-amber-500/20 bg-amber-500/10 text-amber-400",

    ASSIGNED:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",

    PICKED_UP:
      "border-purple-500/20 bg-purple-500/10 text-purple-400",

    IN_TRANSIT:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",

    DELIVERED:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}