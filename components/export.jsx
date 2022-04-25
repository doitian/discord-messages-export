import React, { useState } from "react";
import styles from "../styles/Export.module.css";

const CONTEXT_OPTIONS = ["around", "after", "before"];

function ContextSelect(props) {
  return (
    <select name="context" ariaLabel="Context" {...props}>
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

  const handleSubmit = (event) => {
    event.preventDefault();
    setPreview(
      JSON.stringify(
        Object.fromEntries(new FormData(event.target).entries()),
        null,
        2
      )
    );
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.row}>
          Get{" "}
          <input
            type="number"
            min="1"
            max="100"
            size="4"
            name="limit"
            defaultValue="4"
            ariaLabel="Limit"
            required
          />{" "}
          messages
          <ContextSelect defaultValue="around" />
          the one with the URL
          <input
            className={styles.url}
            type="text"
            name="url"
            ariaLabel="URL"
            required
          />
        </div>
        <input type="submit" value="Export" />
      </form>
      <pre>{preview}</pre>
    </div>
  );
}
