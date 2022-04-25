import React, { useState } from "react";
import styles from "../styles/Export.module.css";

const CONTEXT_OPTIONS = ["around", "after", "before"];

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
  const [preview, setPreview] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const params = new URLSearchParams(new FormData(event.target).entries());
    setPreview("Loading...");
    const res = await fetch(`${event.target.action}?${params}`);
    const { markdown } = await res.json();
    setPreview(markdown);
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
            defaultValue="https://discord.com/channels/681019635016925184/879539454807801874/968162680118591538"
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
