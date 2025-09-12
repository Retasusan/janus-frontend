"use client";

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
  isOpen: boolean;
}

export default function ModalPortal({ children, isOpen }: ModalPortalProps) {
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let root = document.getElementById('modal-portal');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-portal';
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.zIndex = '9999';
      // don't disable pointer events on the root; that prevents children from receiving clicks
      document.body.appendChild(root);
    }

    setPortalRoot(root);

    return () => {
      // keep the portal root across unmounts; do not remove it here to avoid flicker
    };
  }, []);

  if (!isOpen || !portalRoot) return null;

  return createPortal(children, portalRoot);
}
