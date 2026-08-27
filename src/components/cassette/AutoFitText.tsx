import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

type AutoFitTextProps = {
  children: ReactNode;
  minSize: number;
  maxSize: number;
  className?: string;
  style?: CSSProperties;
};

export function AutoFitText({ children, minSize, maxSize, className, style }: AutoFitTextProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const fit = () => {
      let size = maxSize;
      element.style.fontSize = `${size}px`;
      while (size > minSize && (element.scrollHeight > element.clientHeight || element.scrollWidth > element.clientWidth)) {
        size -= 0.5;
        element.style.fontSize = `${size}px`;
      }
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, [children, maxSize, minSize]);

  return <div ref={elementRef} className={className} style={style}>{children}</div>;
}
