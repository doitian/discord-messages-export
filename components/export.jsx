import React, { useState } from "react";
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
  const [preview, setPreview] = useState(TIP);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(event.target).entries());
    setPreview("Loading...");
    try {
      const res = await fetch(`${event.target.action}?${params}`);
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

  return (
    <div className={styles.container}>
      <form
        action="/api/message"
        onSubmit={handleSubmit}
        className={styles.form}
      >
        <div className={styles.row}>
          Get{" "}
          <input
            type="number"
            min="1"
            max="100"
            size="4"
            name="limit"
            defaultValue="4"
            required
            aria-label="Limit"
          />{" "}
          messages
          <ContextSelect defaultValue="around" />
          the one with the URL
          <input
            className={styles.url}
            type="text"
            name="url"
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
