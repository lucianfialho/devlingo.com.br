"use client";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

import { useState, useRef } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

function NewsletterForm() {
  const [input, setInput] = useState("");
  const [successMessage, setSuccessMessage] = useState();
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    const email = input;
    const res = await fetch("/api/addSub", {
      body: JSON.stringify({ email }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
    const data = await res.json();

    if (data.error) {
      setErrorMessage("Hey, you are already subscribed!");
      setSuccessMessage(undefined);
      return;
    }

    setSuccessMessage(data.message);
    let dataLayer = window.dataLayer || [];
    dataLayer.push({
      event: "generate_lead",
    });
    setLoading(true);
    setErrorMessage("");
    setInput("");
  };

  const dismissMessages = () => {
    setSuccessMessage(undefined);
    setErrorMessage("");
  };

  return (
    <div className="sm:max-w-lg w-full max-w-xs">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-center gap-x-4 w-full">
          <label htmlFor="email-address" className="sr-only">
            Email address
          </label>
          <input
            id="email-address"
            name="email"
            type="email"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="email"
            required
            className="sm:min-w-72 w-3/4 flex-auto rounded-md border-0 bg-white/5 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm sm:leading-6"
            placeholder="Adicione seu e-mail"
          />
          <button
            disabled={loading}
            type="submit"
            className=" flex-none rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </form>
      <div className="relative mt-8">
        {(successMessage || errorMessage) && (
          <div className="flex items-start w-full space-x-2 bg-gray-100 shadow-outline-gray text-white rounded-[9px] py-4 px-6 animate-fade-bottom absolute">
            <div className="h-6 w-6 bg-[#1B2926] flex items-center justify-center rounded-full border border-[#273130] flex-shrink-0">
              <CheckIcon className="h-4 w-4  text-green-100" />
            </div>
            <div className="text-xs sm:text-sm text-[#4B4C52]">
              {successMessage ? (
                <p>{successMessage}</p>
              ) : (
                <p>
                  You are already added to our waitlist. We&apos;ll let you know
                  when we launch!
                </p>
              )}
            </div>
            <XMarkIcon
              className="h-5 w-5 cursor-pointer flex-shrink-0 text-[#4A4B55]"
              onClick={dismissMessages}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default NewsletterForm;
