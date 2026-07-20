import { UsersPanel, type WorkspaceUser } from "@/components/users/users-panel";
import { prisma } from "@/lib/prisma";
import { requireAdminPageUser } from "@/lib/auth";

export default async function UsersPage() {
  const currentUser = await requireAdminPageUser();
  const records = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      passwordHash: true,
      inviteExpiresAt: true,
      lastLoginAt: true,
      createdAt: true
    }
  });
  const users: WorkspaceUser[] = records.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    hasPassword: Boolean(user.passwordHash),
    inviteExpiresAt: user.inviteExpiresAt?.toISOString() ?? null,
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString()
  }));

  return (
    <div className="flex flex-col gap-7">
      <header className="journal-rule pb-6">
        <p className="panel-kicker">Workspace access</p>
        <h1 className="display-title mt-2 text-4xl font-semibold sm:text-5xl">
          Ekip ve erişim
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          Kullanıcı ekle, tek kullanımlık davet paylaş ve çalışma alanının
          rollerini güvenle yönet.
        </p>
      </header>
      <UsersPanel users={users} currentUserId={currentUser.id} />
    </div>
  );
}
