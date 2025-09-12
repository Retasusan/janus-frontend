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
    if (!root && isOpen) {
      root = document.createElement('div');
      root.id = 'modal-portal';
      root.style.position = 'fixed';
      root.style.top = '0';
      root.style.left = '0';
      root.style.width = '100%';
      root.style.height = '100%';
      root.style.zIndex = '9999';
      document.body.appendChild(root);
    }
    setPortalRoot(root);

    // モーダルを閉じたときはportal rootを削除
    if (!isOpen && root) {
      root.parentNode?.removeChild(root);
      setPortalRoot(null);
    }

    // クリーンアップ: アンマウント時にportal rootを削除
    return () => {
      const r = document.getElementById('modal-portal');
      if (r) r.parentNode?.removeChild(r);
      setPortalRoot(null);
    };
  }, [isOpen]);

  if (!isOpen || !portalRoot) return null;

  return createPortal(children, portalRoot);
}
