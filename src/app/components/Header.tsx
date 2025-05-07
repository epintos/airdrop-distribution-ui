import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const Header = () => {
  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white shadow-sm">
      <div className="flex items-center gap-4">
        <Link
          href="https://github.com/epintos/tsender"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 transition-colors"
        >
          <FaGithub size={24} />
        </Link>
        <h1 className="text-xl font-bold">TSender</h1>
      </div>

      <ConnectButton />
    </header>
  );
};

export default Header;
