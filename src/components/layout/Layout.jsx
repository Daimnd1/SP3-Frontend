import Navbar from '../Navbar';

export default function Layout({ children, currentPage, setCurrentPage }) {
  return (
    <div className="flex min-h-screen w-screen p-4 bg-zinc-900">
      <aside>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </aside>
      <main className="w-full md:px-16 py-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}