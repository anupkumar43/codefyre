import { Blocks } from "lucide-react";

function Footer() {
  return (
    <footer className="relative bg-gray-950 border-t border-gray-800/50 mt-auto">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-gray-900 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Footer brand (simplified & muted version) */}
          <div className="flex items-center space-x-3 group">
            <div
              className="relative flex items-center justify-center w-10 h-10 rounded bg-gray-800 border border-gray-600 
                shadow-inner group-hover:shadow-md transition-shadow duration-300"
            >
              <span className="text-gray-400 font-semibold text-lg tracking-wide">
                &lt;/&gt;
              </span>
            </div>

            <div className="flex flex-col leading-tight">
              <span className="text-white font-semibold text-lg tracking-tight">
                CodeFyre
              </span>
              <span className="text-xs text-gray-500">
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
