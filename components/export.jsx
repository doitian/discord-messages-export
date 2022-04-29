import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/Export.module.css";

const CONTEXT_OPTIONS = ["around", "after", "before"];
const TIP = [
  "1. Sign in with the user who has the permission to read the messages.",
  "2. Invite bot to your server and ensure the bot can read the messages.",
  "3. Paste the message link and export.",
].join("\n");

function ContextSelect(props) {
  return (
    <select name="context" aria-label="Context" {...props}>
      {CONTEXT_OPTIONS.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

export default function Export() {
  const [preview, setPreview] = useState("Loading...");
  const { query } = useRouter();

  useEffect(() => {
    if (query.url !== undefined && query.url !== null) {
      const fetchMessages = async function () {
        try {
          const res = await fetch(`/api/message?${new URLSearchParams(query)}`);
          const resJson = await res.json();
          if (res.ok) {
            setPreview(resJson.markdown);
          } else {
            setPreview(`error: ${resJson.message}\n\n${TIP}`);
          }
        } catch (e) {
          setPreview(`error: ${e}\n\n${TIP}`);
        }
      };
      fetchMessages();
    } else {
      setPreview(TIP);
    }
  }, [query]);

  const queryDef = { limit: 4, context: "around", ...query };

  return (
    <div className={styles.container}>
      <form action="/" className={styles.form}>
        <div className={styles.row}>
          Get{" "}
          <input
            type="number"
            min="1"
            max="100"
            size="4"
            name="limit"
            defaultValue={queryDef.limit}
            required
            aria-label="Limit"
          />{" "}
          messages
          <ContextSelect defaultValue={queryDef.context} />
          the one with the URL
          <input
            className={styles.url}
            type="text"
            name="url"
            defaultValue={queryDef.url}
            required
            aria-label="URL"
          />
        </div>
        <input type="submit" value="Export" />
      </form>
      <textarea
        rows="20"
        value={preview}
        className={styles.preview}
        onChange={(e) => setPreview(e.target.value)}
      >
        {preview}
      </textarea>
    </div>
  );
}
