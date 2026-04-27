"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./landing.module.css";

type ReportEmbargoButtonProps = {
  children: ReactNode;
  className: string;
};

export default function ReportEmbargoButton({
  children,
  className,
}: ReportEmbargoButtonProps) {
  const [showNotice, setShowNotice] = useState(false);

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={() => setShowNotice(true)}
      >
        {children}
      </button>

      {showNotice &&
        createPortal(
          <div className={styles.embargoNotice} role="status">
            <span>
              The WPI MQP report is currently under a 1 year release embargo
              while related research continues.
            </span>
            <button
              type="button"
              className={styles.embargoClose}
              onClick={() => setShowNotice(false)}
              aria-label="Close report embargo notice"
            >
              Close
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
