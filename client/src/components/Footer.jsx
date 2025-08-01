import { Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900">StoryMaker PNG</h3>
            <p className="text-sm text-slate-600">
              Transformez vos images en histoires captivantes grâce à l'intelligence artificielle 
              Google Gemini Pro Vision.
            </p>
          </div>
          
          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900">Fonctionnalités</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• Génération d'histoires IA</li>
              <li>• 10 genres différents</li>
              <li>• Longueurs personnalisables</li>
              <li>• Sauvegarde locale</li>
              <li>• Interface responsive</li>
            </ul>
          </div>
          
          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-display font-semibold text-slate-900">Contact</h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/GreenGKH"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="mailto:abdoullakh.gkh@gmail.com"
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;