import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your settings here",
};

export default function Settings() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p>Manage your settings here.</p>
    </div>
  );
}