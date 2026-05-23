import '../styles/globals.css';

export const metadata = {
  title: 'voxlab workspace // Portal',
  description: 'Creative Optimization Engine',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-[#090b0e]">
      {/* Apply the custom CSS classes from your globals.css right here */}
      <body className="relative min-h-screen overflow-x-hidden antialiased voxlab-gradient-bg">
        {/* Film grain overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none voxlab-film-noise" />
        
        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}