import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-4">Aksana Business Lab</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Membangun solusi digital dengan sentuhan profesionalisme dan inovasi.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-400">Navigasi</h4>
            <ul className="space-y-3">
              <li><Link href="/layanan" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Layanan</Link></li>
              <li><Link href="/tools" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Tools</Link></li>
              <li><Link href="/kontak" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Kontak</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 text-slate-400">Legal</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Aksana Business Lab. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
