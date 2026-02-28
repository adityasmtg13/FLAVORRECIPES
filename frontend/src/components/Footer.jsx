import { Linkedin, Twitter, Github, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-orange-100 border-t-2 border-orange-600 py-6">
      
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-3">

        {/* Branding */}
        <p
          className="text-sm font-medium text-center"
          style={{ color: "#38240D" }}
        >
          © 2026 <span className="font-semibold">FLAVORRECIPES</span>.  
          Built with ❤️ by Aditya Pulipaka.
        </p>

        {/* Social Links */}
        <div className="flex items-center gap-5">
          
          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/in/aditya-pulipaka-b82587294/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition transform hover:scale-110"
            style={{ color: "#713600" }}
          >
            <Linkedin className="w-6 h-6" />
          </a>

          {/* X (Twitter) */}
          <a
            href="https://x.com/aditya_smtg"
            target="_blank"
            rel="noopener noreferrer"
            className="transition transform hover:scale-110"
            style={{ color: "#713600" }}
          >
            <Twitter className="w-6 h-6" />
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/adityasmtg13/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition transform hover:scale-110"
            style={{ color: "#713600" }}
          >
            <Github className="w-6 h-6" />
          </a>

          {/* Email */}
          <a
            href="mailto:aditya.pulipaka1307@gmail.com"
            className="transition transform hover:scale-110"
            style={{ color: "#713600" }}
          >
            <Mail className="w-6 h-6" />
          </a>

        </div>

        {/* Extra line */}
        <p className="text-xs text-gray-600">
          AI-powered smart kitchen platform. <b>Terms and Conditions apply.</b>
        </p>

      </div>
    </footer>
  );
}