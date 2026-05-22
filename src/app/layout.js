import '../styles/globals.css';

export const metadata = {
  title: 'voxlab workspace // Portal',
  description: 'Creative Optimization Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-[#070A0E]">
      <body className="relative min-h-screen overflow-x-hidden antialiased">
        {/* Visual atmospheric components rendering on every route */}
        <div className="absolute inset-0 ambient-glow pointer-events-none z-0" />
        <div className="absolute inset-0 bg-grain pointer-events-none z-0" />
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );}