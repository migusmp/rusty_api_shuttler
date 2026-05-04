import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ServerMember } from "../../stores/useServerStore";
import type { ProfileData } from "../../types/user";
import css from "./css/MemberDetailsModal.module.css";

interface Props {
    member: ServerMember;
    onClose: () => void;
    onOpenProfile: (username: string) => void;
    currentUserId: number | undefined;
    activeFriends: number[];
}

export default function MemberDetailsModal({ member, onClose, onOpenProfile, currentUserId, activeFriends }: Props) {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);

    const isFriend = profile ? activeFriends.includes(profile.id) : false;
    const isSelf = profile?.id === currentUserId;

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch(`/api/user/profile/${member.username}`, {
                    credentials: "include",
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data.data);
                }
            } catch (e) {
                console.error("Error fetching profile:", e);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, [member.username]);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    function handleOverlayClick(e: React.MouseEvent) {
        if (e.target === e.currentTarget) onClose();
    }

    function handleViewProfile() {
        onOpenProfile(member.username);
    }

    function handleOpenDm() {
        navigate(`/dm/${member.username}`);
    }

    function handleAddFriend() {
        // TODO: Implementar solicitud de amistad
        alert("Próximamente: enviar solicitud de amistad");
    }

    function formatDate(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    }

    return (
        <div className={css.overlay} onClick={handleOverlayClick}>
            <div className={css.modal}>
                <div className={css.header}>
                    <span className={css.title}>Detalles del miembro</span>
                    <button type="button" className={css.closeBtn} onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                {loading ? (
                    <div className={css.loading}>
                        <div className={css.spinner} />
                        Cargando...
                    </div>
                ) : (
                    <>
                        <div className={css.avatarSection}>
                            {profile?.image ? (
                                <img
                                    src={`/media/user/${profile.image}`}
                                    alt={member.username}
                                    className={css.avatarLarge}
                                />
                            ) : (
                                <div className={css.avatarPlaceholder}>
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className={css.username}>{member.username}</span>
                            <span className={css.roleBadge}>{member.role}</span>
                        </div>

                        <div className={css.infoSection}>
                            {profile?.name && (
                                <div className={css.infoRow}>
                                    <span className={css.infoLabel}>Nombre</span>
                                    <span className={css.infoValue}>{profile.name}</span>
                                </div>
                            )}
                            {profile?.description && (
                                <div className={css.infoRow}>
                                    <span className={css.infoLabel}>Bio</span>
                                    <span className={css.infoValue}>{profile.description}</span>
                                </div>
                            )}
                            <div className={css.infoRow}>
                                <span className={css.infoLabel}>Se unió</span>
                                <span className={css.infoValue}>{formatDate(member.joined_at)}</span>
                            </div>
                            {profile?.friends_count !== undefined && (
                                <div className={css.infoRow}>
                                    <span className={css.infoLabel}>Amigos</span>
                                    <span className={css.infoValue}>{profile.friends_count}</span>
                                </div>
                            )}
                        </div>

                        <div className={css.actions}>
                            {!isSelf && !isFriend && (
                                <button type="button" className={css.addFriendBtn} onClick={handleAddFriend}>
                                    <i className="bi bi-person-plus-fill" />
                                    Agregar amigo
                                </button>
                            )}
                            <button type="button" className={css.profileBtn} onClick={handleViewProfile}>
                                <i className="bi bi-person-fill" />
                                Ver perfil
                            </button>
                            <button type="button" className={css.dmBtn} onClick={handleOpenDm}>
                                <i className="bi bi-chat-dots-fill" />
                                MD
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}