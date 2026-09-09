import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Frederick Pure Water | Whole-Home Water Treatment', description: 'Whole-home water filtration, softeners, reverse osmosis, and city and well water treatment for Frederick, Maryland. Request your free consultation.' };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
