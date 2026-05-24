import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Shield,
    ShieldOff,
    Car,
    User as UserIcon,
    MoreVertical,
    Loader2,
    ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    useAdminUsers,
    useToggleUserActive,
    useChangeUserRole,
} from "@/hooks/useAdmin";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function UsersTable() {
    const { t } = useTranslation();
    const {
        data,
        isLoading,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useAdminUsers();
    const toggleMutation = useToggleUserActive();
    const roleMutation = useChangeUserRole();
    const [menuOpen, setMenuOpen] = useState<number | null>(null);

    const users = data?.pages.flatMap((p) => p.content) ?? [];

    if (isLoading) {
        return (
            <Card className="p-12">
                <div className="flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-karvon-turquoise-600" />
                </div>
            </Card>
        );
    }

    const roleColors: Record<string, string> = {
        PASSENGER: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
        DRIVER:
            "bg-karvon-turquoise-100 dark:bg-karvon-turquoise-900/30 text-karvon-turquoise-700 dark:text-karvon-turquoise-400",
        ADMIN:
            "bg-karvon-sunset-100 dark:bg-karvon-sunset-700/30 text-karvon-sunset-700 dark:text-karvon-sunset-400",
    };

    const roleIcons: Record<string, React.ReactNode> = {
        PASSENGER: <UserIcon className="w-3 h-3" />,
        DRIVER: <Car className="w-3 h-3" />,
        ADMIN: <Shield className="w-3 h-3" />,
    };

    return (
        <div className="space-y-3">
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/50 border-b border-border">
                        <tr>
                            <th className="text-left px-4 py-3 font-semibold">
                                {t("admin.users.user")}
                            </th>
                            <th className="text-left px-4 py-3 font-semibold hidden md:table-cell">
                                {t("admin.users.phone")}
                            </th>
                            <th className="text-left px-4 py-3 font-semibold">
                                {t("admin.users.role")}
                            </th>
                            <th className="text-left px-4 py-3 font-semibold hidden lg:table-cell">
                                {t("admin.users.joined")}
                            </th>
                            <th className="text-left px-4 py-3 font-semibold">
                                {t("admin.users.status")}
                            </th>
                            <th className="text-right px-4 py-3 font-semibold">
                                {t("admin.users.actions")}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user, idx) => (
                            <motion.tr
                                key={user.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.02 }}
                                className="border-b border-border last:border-0 hover:bg-secondary/30"
                            >
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-karvon flex items-center justify-center text-white text-sm font-semibold shrink-0">
                                            {user.firstName?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-medium truncate">
                                                {user.firstName} {user.lastName || ""}
                                            </div>
                                            <div className="text-xs text-muted-foreground md:hidden">
                                                {user.phone}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                                    {user.phone}
                                </td>
                                <td className="px-4 py-3">
                    <span
                        className={cn(
                            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
                            roleColors[user.role]
                        )}
                    >
                      {roleIcons[user.role]}
                        {t(`profile.role.${user.role.toLowerCase()}`)}
                    </span>
                                </td>
                                <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs">
                                    {user.createdAt ? formatDate(user.createdAt) : "—"}
                                </td>
                                <td className="px-4 py-3">
                    <span
                        className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            user.active
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-muted text-muted-foreground"
                        )}
                    >
                      <div
                          className={cn(
                              "w-1.5 h-1.5 rounded-full mr-1.5",
                              user.active ? "bg-emerald-500" : "bg-muted-foreground"
                          )}
                      />
                        {user.active ? t("admin.users.active") : t("admin.users.inactive")}
                    </span>
                                </td>
                                <td className="px-4 py-3 text-right relative">
                                    <button
                                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                                        disabled={toggleMutation.isPending || roleMutation.isPending}
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {menuOpen === user.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setMenuOpen(null)}
                                            />
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="absolute right-2 top-full mt-1 w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden z-20"
                                            >
                                                {/* Toggle active */}
                                                <button
                                                    onClick={() => {
                                                        toggleMutation.mutate({
                                                            id: user.id,
                                                            active: user.active,
                                                        });
                                                        setMenuOpen(null);
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary"
                                                >
                                                    {user.active ? (
                                                        <>
                                                            <ShieldOff className="w-4 h-4 text-destructive" />
                                                            <span className="text-destructive">
                                  {t("admin.users.deactivate")}
                                </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Shield className="w-4 h-4 text-emerald-600" />
                                                            <span className="text-emerald-600">
                                  {t("admin.users.activate")}
                                </span>
                                                        </>
                                                    )}
                                                </button>

                                                <div className="border-t border-border" />

                                                {/* Change role */}
                                                <div className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">
                                                    {t("admin.users.changeRole")}
                                                </div>
                                                {(["PASSENGER", "DRIVER", "ADMIN"] as const).map((r) => (
                                                    <button
                                                        key={r}
                                                        onClick={() => {
                                                            roleMutation.mutate({ id: user.id, role: r });
                                                            setMenuOpen(null);
                                                        }}
                                                        disabled={user.role === r}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed",
                                                            user.role === r && "bg-secondary/50"
                                                        )}
                                                    >
                                                        {roleIcons[r]}
                                                        <span>
                                {t(`profile.role.${r.toLowerCase()}`)}
                              </span>
                                                        {user.role === r && (
                                                            <span className="ml-auto text-xs text-muted-foreground">
                                  ✓
                                </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </td>
                            </motion.tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {hasNextPage && (
                <div className="flex justify-center">
                    <Button
                        variant="outline"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                    >
                        {isFetchingNextPage ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                {t("myBookings.loadMore")}
                            </>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}