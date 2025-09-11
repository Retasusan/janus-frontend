"use client";

import { useEffect, useRef } from "react";

/**
 * リアルタイム更新のためのポーリングフック
 * @param callback 実行する更新関数
 * @param interval ポーリング間隔（ミリ秒）
 * @param enabled ポーリングを有効にするかどうか
 */
export function useRealTimePolling(
  callback: () => void | Promise<void>,
  interval: number = 5000,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // callbackの参照を更新
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const executeCallback = async () => {
      try {
        await callbackRef.current();
      } catch (error) {
        console.warn('リアルタイム更新エラー:', error);
      }
    };

    // 初回実行
    executeCallback();

    // 定期実行
    intervalRef.current = setInterval(executeCallback, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [interval, enabled]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
}
