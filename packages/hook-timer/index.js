import { useEffect } from "react";

export const useTimeout = (callback, timeout, deps = []) =>
  useEffect(() => {
    const timer = setTimeout(callback, timeout);
    return () => clearTimeout(timer);
  }, [timeout, ...deps]);

export const useInterval = (callback, interval, deps = []) =>
  useEffect(() => {
    const timer = setInterval(callback, interval);
    return () => clearInterval(timer);
  }, [interval, ...deps]);

export const useIntervalNow = (callback, interval, deps = []) =>
  useEffect(() => {
    const timer = setInterval(callback, interval);
    callback();
    return () => clearInterval(timer);
  }, [interval, ...deps]);
