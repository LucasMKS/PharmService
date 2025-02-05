import Link from "next/link";

export default function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <Image
              src="/images/logo.png" // Caminho para a imagem dentro da pasta public
              width={170} // Largura da imagem
              height={260} // Altura da imagem
              alt="Logo"
              className="fill-slate-50" // Caso queira aplicar classes do Tailwind
            />
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <Link href="/about">Sobre</Link>
            </li>
            <li>
              <Link href="/features">Funcionalidades</Link>
            </li>
            <li>
              <Link href="/contact">Contato</Link>
            </li>
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost normal-case text-xl">
          PharmStock
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <Link href="/about">Sobre</Link>
          </li>
          <li>
            <Link href="/features">Funcionalidades</Link>
          </li>
          <li>
            <Link href="/contact">Contato</Link>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <Link href="/login" className="btn btn-ghost">
          Login
        </Link>
        <Link href="/register" className="btn btn-primary">
          Registrar
        </Link>
      </div>
    </div>
  );
}
