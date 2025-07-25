import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/auctions', label: 'Auctions' },
  { href: '/admin/lots', label: 'Lots' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/invoices', label: 'Invoices' },
  { href: '/admin/assign-seller', label: 'Assign Seller' },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="bg-yellow-100 border-r border-yellow-300 min-h-screen w-56 p-6 flex flex-col gap-4 sticky top-0">
      <h2 className="text-lg font-bold text-yellow-700 mb-4">Admin Panel</h2>
      <nav className="flex flex-col gap-2">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`px-3 py-2 rounded font-semibold transition-all text-yellow-800 hover:bg-yellow-200 ${pathname === link.href ? 'bg-yellow-300' : ''}`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
