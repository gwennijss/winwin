"use client";

import { createContext, useContext } from "react";

/** Lets a slide jump to another slide (the contents page uses it). No-op outside the live deck. */
export const DeckNavContext = createContext<(slug: string) => void>(() => {});
export const useDeckNav = () => useContext(DeckNavContext);
