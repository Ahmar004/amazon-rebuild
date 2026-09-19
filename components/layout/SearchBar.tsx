"use client";

import { useRef, useState } from "react";
import type { Department } from "@/lib/data/departments";
import { CaretDown } from "@/components/layout/CaretDown";

type SearchBarProps = {
  departments: Department[];
};

// The header search form. A real <select name="i"> (opacity 0) sits over a decorative label
// so the native department dropdown opens, per the measured values in task-2-brief.md.
// action="/s" method="get" keeps it working without JavaScript.
export function SearchBar({ departments }: SearchBarProps) {
  const [dept, setDept] = useState("");
  const selectRef = useRef<HTMLSelectElement>(null);

  const selectedLabel = dept === "" ? "All" : (departments.find((d) => d.slug === dept)?.name ?? "All");

  function handleSubmit() {
    // Empty "i" is not sent: disable the select just before the native GET submit collects
    // form data, then re-enable it so the control stays usable afterwards.
    if (dept === "" && selectRef.current) {
      selectRef.current.disabled = true;
      setTimeout(() => {
        if (selectRef.current) selectRef.current.disabled = false;
      }, 0);
    }
  }

  return (
    <form
      action="/s"
      method="get"
      onSubmit={handleSubmit}
      className="flex h-10 flex-1 rounded focus-within:ring-[3px] focus-within:ring-search-btn"
    >
      <div className="relative flex shrink-0 items-center rounded-l border-r border-search-dept-border bg-search-dept pl-3 pr-5 text-xs text-search-dept-text">
        <span className="whitespace-nowrap">{selectedLabel}</span>
        <CaretDown className="ml-1.5" />
        <select
          ref={selectRef}
          name="i"
          aria-label="Search in department"
          value={dept}
          onChange={(event) => setDept(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          <option value="">All Departments</option>
          {departments.map((department) => (
            <option key={department.slug} value={department.slug}>
              {department.name}
            </option>
          ))}
        </select>
      </div>

      <label htmlFor="search-input" className="sr-only">
        Search Amazon
      </label>
      <input
        id="search-input"
        name="k"
        type="text"
        placeholder="Search Amazon"
        className="min-w-0 flex-1 border-0 pl-[10px] text-[15px] text-text outline-none"
      />

      <button
        type="submit"
        aria-label="Go"
        className="flex h-10 w-[45px] shrink-0 items-center justify-center rounded-r bg-search-btn hover:bg-search-btn-hover"
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          aria-hidden="true"
          style={{ color: "var(--color-search-icon)" }}
        >
          <circle cx="9.5" cy="9.5" r="7" stroke="currentColor" strokeWidth="2" />
          <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </form>
  );
}
