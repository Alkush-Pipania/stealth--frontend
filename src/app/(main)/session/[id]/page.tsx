import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import SessionPageClient from "@/components/session/session-page-client";

interface SessionPageProps {
  params: Promise<{ id: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { id } = await params;

  // Get authenticated session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/signin");
  }

  // Fetch session data with documents
  const appSession = await db.appSession.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
    include: {
      Document: true,
    },
  });

  if (!appSession) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <Suspense fallback={<div>Loading session...</div>}>
        <SessionPageClient session={appSession} />
      </Suspense>
    </div>
  );
}
