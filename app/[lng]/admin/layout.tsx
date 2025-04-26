import type React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { SignOutButton } from "@/components/sign-out-button"

export default async function AdminLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ lng: string }>;
}) {
  const { lng } = await paramsPromise;
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect(`/auth/sign-in?redirect=/admin`);
  }

  // Fetch the user's profile to check their role
  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching user profile:", profileError);
    // Handle the error appropriately, maybe redirect to an error page
    return <div>Error: Could not load user profile</div>;
  }

  if (profile?.role !== "admin") {
    redirect("/account");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <SignOutButton lng={lng} />
        </div>
      </header>
      <div className="flex min-h-screen">
        <AdminSidebar lng={lng} />
        <main className="flex-1 p-8 bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
