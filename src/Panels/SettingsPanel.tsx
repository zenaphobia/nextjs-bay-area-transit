"use client";

import { memo } from "react";

const SettingsPanel = memo(function SettingsPanel() {
  return (
    <section
      className="font-mono flex flex-col h-full p-4 overflow-y-auto"
      aria-labelledby="settings-title"
    >
      <header className="p-4">
        <h2 id="settings-title" className="text-lg font-semibold">
          Settings
        </h2>
        <p className="text-sm opacity-75">About this app and your data.</p>
      </header>

      <article
        className="px-4 pb-8 text-sm leading-relaxed space-y-4"
        aria-labelledby="data-title"
      >
        <header>
          <h3 id="data-title" className="text-base font-semibold">
            What we collect
          </h3>
        </header>

        <p className="opacity-90">
          This app uses Google Analytics 4 to understand how it&apos;s used.
          That&apos;s the only data sent off your device.
        </p>

        <section className="space-y-1">
          <h4 className="font-semibold">Tracked</h4>
          <ul className="list-disc list-outside pl-5 space-y-1 opacity-90">
            <li>
              Anonymous interaction events — which views you open, buttons you
              tap, trips you search. No free-text input.
            </li>
            <li>
              PWA install lifecycle — whether the app is install-eligible,
              installed, and whether it&apos;s launched from the home screen.
            </li>
            <li>Your IP address, collected by Google. Not by us.</li>
          </ul>
        </section>

        <section className="space-y-1">
          <h4 className="font-semibold">Stays on your device</h4>
          <p className="opacity-90">
            Saved trips, view preferences, and an install-detection flag are
            kept in your browser&apos;s localStorage. They&apos;re never sent
            anywhere.
          </p>
        </section>

        <section className="space-y-1">
          <h4 className="font-semibold">Never collected</h4>
          <ul className="list-disc list-outside pl-5 space-y-1 opacity-90">
            <li>No accounts, names, emails, or phone numbers.</li>
            <li>No precise location.</li>
            <li>No advertising or remarketing.</li>
          </ul>
        </section>

        <section className="space-y-1">
          <h4 className="font-semibold">Opting out</h4>
          <p className="opacity-90">
            A browser privacy extension, the Google Analytics opt-out add-on, or
            most ad-blockers will block analytics from loading.
          </p>
        </section>
      </article>
    </section>
  );
});

export default SettingsPanel;
