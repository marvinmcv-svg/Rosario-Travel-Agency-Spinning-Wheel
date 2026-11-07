import { Anton, Inter, Instrument_Serif } from "next/font/google";

export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
export const fontVars = `${serif.variable} ${inter.variable} ${anton.variable}`;
