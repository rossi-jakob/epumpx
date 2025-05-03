'use client';
import { Button, ConnectBtn } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { BsTwitterX } from "react-icons/bs";
import Link from "next/link";
import { IoMenu } from "react-icons/io5";
import { useConnect, useDisconnect, useAccount } from "wagmi";
import { injected } from '@wagmi/connectors'

export default function Navbar() {
  const { push } = useRouter();
  const [navOpen, setNavOpen] = useState(false);
  const [actionOpen, setActionOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const navRef = useRef<HTMLDivElement>(null);
  const actionRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !navRef.current?.contains(event.target as Node) &&
        !actionRef.current?.contains(event.target as Node) &&
        !langRef.current?.contains(event.target as Node)
      ) {
        setNavOpen(false);
        setActionOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleNav = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent from bubbling to document
    if (actionOpen) setActionOpen(false);
    setNavOpen(!navOpen);
  };

  const toggleAction = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent from bubbling to document
    if (navOpen) setNavOpen(false);
    setActionOpen(!actionOpen);
  };

  const toggleLang = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLangOpen(!langOpen);
    setNavOpen(false);
    setActionOpen(false);
  };

  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { isConnected, address } = useAccount();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-[2px] bg-[#1C1F2F]/60">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo */}
          <div className="flex items-center transition-transform duration-300 hover:scale-110">
            <a href="/" className="flex items-center">
              <img src="/brand.webp" className="h-8 mr-3" alt="Logo" />
            </a>
          </div>

          {/* Everything else aligns to the right */}
          <div className="ml-auto flex items-center space-x-6">
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/" className="nav-link">Board</Link>
              <Link href="/ranking" className="nav-link">Ranking</Link>
            </div>

            {/* Socials */}
            <div className="hidden md:flex">
              <SocialLink />
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-2">
              <ConnectBtn />
              <Button onClick={() => push("/create")} className="text-md text-white">
                Create Token
              </Button>
              <div className="relative">
                <img
                  src="/lan.png"
                  alt="Language"
                  className="w-8 h-8 cursor-pointer"
                  onClick={toggleLang}
                />

                {langOpen && (
                  <div
                    ref={langRef}
                    className="fixed top-16 right-0 bg-[#1C1F2F]/95 p-2 rounded shadow-lg z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {["English", "中文", "日本語", "Tiếng Việt"].map((lang, index) => (
                      <button
                        key={index}
                        className="flex justify-between items-center w-full text-left px-2 py-1 hover:bg-[#2C2F40] text-white text-sm"
                        onClick={() => {
                          setSelectedLang(lang);
                          setLangOpen(false);
                        }}
                      >
                        <span>{lang}</span>
                        {selectedLang === lang && <span className="text-green-400">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Toggles */}
            <div className="flex md:hidden items-center space-x-2">
              <button onClick={(e) => toggleNav(e)}><IoMenu size={24} /></button>
              <button onClick={(e) => toggleAction(e)}><IoMenu size={24} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {navOpen && (
        <div ref={navRef} onClick={(e) => toggleNav(e)} className="absolute top-16 right-0 w-1/2 bg-[#1C1F2F]/95 p-4 space-y-2 z-50 shadow-lg">
          <Link href="/" className="block nav-link">Board</Link>
          <Link href="/ranking" className="block nav-link">Ranking</Link>
        </div>
      )}

      {/* Mobile Action Dropdown */}
      {actionOpen && (
        <div ref={actionRef} onClick={(e) => toggleAction(e)} className="absolute top-16 right-0 w-1/2 bg-[#1C1F2F]/95 p-4 space-y-2 z-50 shadow-lg">
          {isConnected ? (
            <Button
              onClick={() => disconnect()}
              className="w-full text-md text-white"
            >
              Disconnect
            </Button>
          ) : (
            <Button
              onClick={() => connect({ connector: injected() })}
              disabled={isPending}
              className="w-full text-md text-white"
            >
              {isPending ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          )}
          <Button onClick={() => push("/create")} className="w-full text-md text-white">
            Create Token
          </Button>
        </div>
      )}
    </nav>
  );
}

const SocialLink = () => (
  <div className="flex items-center space-x-5">
    <a href="/tw" className="nav-link">
      <BsTwitterX />
    </a>
  </div>
);