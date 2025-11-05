import Navbar from '../Navbar';

export default function Layout({ children, currentPage, setCurrentPage }) {
  return (
    <div className="flex min-h-screen min-w-screen p-4 bg-zinc-900">
      <aside>
        <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      </aside>
      <main className="flex-1 px-16 overflow-auto">{children}</main>
    </div>
  )
}