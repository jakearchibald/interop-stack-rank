import type { FunctionalComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import styles from './styles.module.css';

interface Props {
  msg: string;
}

const Wave: FunctionalComponent<Props> = ({ msg }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const spans = containerRef.current.querySelectorAll('span');

    const animations: Animation[] = [];

    for (const [index, span] of spans.entries()) {
      const animation = span.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(-5px)' },
          { transform: 'translateY(0px)', offset: 0.1 },
        ],
        {
          duration: 2000,
          easing: 'ease-in-out',
          delay: index * 80,
          iterations: Infinity,
        }
      );
      animations.push(animation);
    }

    return () => {
      for (const animation of animations) animation.cancel();
    };
  });

  return (
    <div ref={containerRef}>
      {[...msg].map((char, index) => (
        <span key={index} class={styles.char}>
          {char}
        </span>
      ))}
    </div>
  );
};

export default Wave;
