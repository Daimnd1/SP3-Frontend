import Navbar from '../Navbar';

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen min-w-screen p-8 bg-zinc-900">
      <aside>
        <Navbar />
      </aside>
      <main className="flex-1 px-8">{children}</main>
    </div>
  )
}