function Footer() {
  return (
    <footer className="relative bg-gray-950 border-t border-gray-800/50 mt-auto">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Footer brand logo (smaller but styled like header) */}
          <div className="flex items-center space-x-3 group">
            <div
              className="relative flex items-center justify-center w-9 h-9 rounded-md bg-[#0f172a] border border-blue-500/30 
              shadow-[0_0_6px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)] 
              transition-shadow duration-300"
            >
              <span className="text-blue-400 font-bold text-lg tracking-wide">
                &lt;/&gt;
              </span>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-xs text-slate-500">
                Fueling code at the edge of innovation.
              </span>
            </div>
          </div>

          {/* Right footer message */}
          <div className="text-gray-400 text-sm text-center md:text-right">
            © {new Date().getFullYear()} CodeFyre. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
