"use client";
import { useEffect } from "react";

export default function ConveyThisLoader() {
  useEffect(() => {
    // Evita duplicados
    if (document.getElementById("conveythis-js")) return;

    const s = document.createElement("script");
    s.id = "conveythis-js";
    s.src = "https://cdn.conveythis.com/javascript/conveythis.js";
    s.async = true;
    s.onload = () => {
      // @ts-ignore
      const init = (window as any).ConveyThis_Initializer;
      if (init && typeof init.init === "function") {
        init.init({
          api_key: process.env.NEXT_PUBLIC_CONVEYTHIS_API_KEY,
          // puedes forzar posición si quieres:
          // position: "bottom_right", // "bottom_left" | "bottom_right"
          remember_language: true
        });
        console.log("[ConveyThis] inicializado");
      } else {
        console.warn("[ConveyThis] script cargó, pero no hay Initializer");
      }
    };
    s.onerror = () => console.warn("[ConveyThis] no se pudo cargar el script");
    document.body.appendChild(s);
  }, []);

  return null;
}
