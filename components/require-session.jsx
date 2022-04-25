import { useSession, signIn, signOut } from "next-auth/react";
import styles from "../styles/User.module.css";

export default function User({ children }) {
  const { data: session } = useSession();

  if (session) {
    return (
      <>
        <aside className={styles.container}>
          <p>Signed in as {session.user.name}</p>
          <button onClick={() => signOut()}>Sign out</button>
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
