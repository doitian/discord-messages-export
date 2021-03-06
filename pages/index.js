import Head from "next/head";
import styles from "../styles/Home.module.css";
import RequireSession from "../components/require-session.jsx";
import Export from "../components/export";

export default function Home({ auth }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Discord Messages Export</title>
        <meta
          name="description"
          content="Export given message and around context to Markdown"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Discord Messages Export</h1>

        <RequireSession auth={auth}>
          <Export />
        </RequireSession>
      </main>
    </div>
  );
}

export function getStaticProps() {
  return {
    props: {
      auth: {
        clientId: process.env.DISCORD_CLIENT_ID,
      },
    },
  };
}
