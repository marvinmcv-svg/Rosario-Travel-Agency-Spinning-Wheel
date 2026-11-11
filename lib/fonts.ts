import { Anton, Inter, Instrument_Serif, Josefin_Sans } from "next/font/google";

export const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-serif" });
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
/** Thin geometric capitals, close to the Hoteles Rosario signature. Used for the logo lockup. */
export const brand = Josefin_Sans({ subsets: ["latin"], weight: ["300", "400"], variable: "--font-josefin" });
export const fontVars = `${serif.variable} ${inter.variable} ${anton.variable} ${brand.variable}`;
