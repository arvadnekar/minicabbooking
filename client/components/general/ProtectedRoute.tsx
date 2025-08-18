// client/components/general/ProtectedRoute.tsx
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, ReactNode, useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  allowedRoles: string[];
  children: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const { user, isSignedIn } = useUser();
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn || !user) {
      router.push("/driver/login");
      return;
    }

    // Example: get role from user public metadata
    const userRole = user.publicMetadata.role as string | undefined;

    if (!userRole || !allowedRoles.includes(userRole)) {
      router.push("/unauthorized"); // redirect if role not allowed
    } else {
      setRole(userRole);
    }
  }, [isSignedIn, user, allowedRoles, router]);

  if (!isSignedIn || !user || !role) return <p>Loading...</p>;

  return <>{children}</>;
}
