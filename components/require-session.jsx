import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "../styles/User.module.css";

export default function RequireSession({ auth, children }) {
  const { data: session } = useSession();
  const inviteParams = new URLSearchParams({
    client_id: auth.clientId,
    scope: "bot",
    permissions: 1024,
  });
  const inviteLink = `https://discord.com/api/oauth2/authorize?${inviteParams}`;

  if (session) {
    return (
      <>
        <aside className={styles.container}>
          <p>Signed in as {session.user.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
          <Link href={inviteLink}>
            <a target="_blank" rel="noopener noreferrer">
              Invite Bot to Server
            </a>
          </Link>
        </aside>
        {children}
      </>
    );
  }
  return (
    <aside className={styles.container}>
      <p>Not signed in</p>
      <button onClick={() => signIn()}>Sign in</button>
    </aside>
  );
}
