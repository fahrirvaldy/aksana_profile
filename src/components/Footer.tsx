import { Link } from "@/i18n/routing";
import { useTranslations } from 'next-intl';

export function Footer() {
  const tNav = useTranslations('Navigation');
  const tHome = useTranslations('HomePage');
  const tFooter = useTranslations('Footer');

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 tracking-tight">Aksana Business Lab</h3>
            <p className="text-slate-700 dark:text-slate-400 max-w-xs leading-relaxed font-normal">
              {tHome('description')}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-950 dark:text-slate-400">{tNav('home')}</h4>
            <ul className="space-y-3">
              <li><Link href="/layanan" className="text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50 transition-colors">{tNav('services')}</Link></li>
              <li><Link href="/tools" className="text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50 transition-colors">{tNav('tools')}</Link></li>
              <li><Link href="/kontak" className="text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50 transition-colors">{tNav('contact')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-950 dark:text-slate-400">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-50 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-700 dark:text-slate-400 shadow-sm">
          <p>© {new Date().getFullYear()} Aksana Business Lab. {tFooter('rights')}</p>
        </div>
      </div>
    </footer>
  );
}
