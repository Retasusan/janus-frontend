"use client";

import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: ReactNode;
  isOpen: boolean;
}

export default function ModalPortal({ children, isOpen }: ModalPortalProps) {
  const portalRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let portalRoot = document.getElementById('modal-portal');
      if (!portalRoot) {
        portalRoot = document.createElement('div');
        portalRoot.id = 'modal-portal';
        portalRoot.style.position = 'fixed';
        portalRoot.style.top = '0';
        portalRoot.style.left = '0';
        portalRoot.style.width = '100%';
        portalRoot.style.height = '100%';
        portalRoot.style.zIndex = '9999';
        portalRoot.style.pointerEvents = 'none';
        document.body.appendChild(portalRoot);
      }
      portalRef.current = portalRoot;
    }
  }, []);

  if (!isOpen || !portalRef.current) {
    return null;
  }

  return createPortal(children, portalRef.current);
}
