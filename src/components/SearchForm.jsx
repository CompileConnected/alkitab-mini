import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';

export function SearchForm({ input, onChange, onSubmit, loading }) {
  const formRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  // 1. Springy Entry Animation (Slides down from top)
  useEffect(() => {
    if (formRef.current) {
      animate(
        formRef.current,
        { translateY: [-50, 0], opacity: [0, 1] },
        { duration: 1000, ease: 'easeOutElastic(1, 0.8)', delay: 100 }
      );
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Quick pop animation on submit
    if (formRef.current) {
      animate(
        formRef.current,
        { scale: [1, 0.98, 1] },
        { duration: 300, ease: 'easeOutQuad' }
      );
    }

    onSubmit(e);
  };

  return (
    <div className="sticky top-0 z-50 w-full px-4 pt-4 pb-2 bg-gradient-to-b from-white via-white/90 to-transparent">
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className={`relative mx-auto max-w-lg transition-all duration-300 rounded-2xl p-1.5 backdrop-blur-xl bg-white/80 border shadow-lg ${
          isFocused
            ? 'border-amber-400/50 shadow-amber-400/20'
            : 'border-white/40 shadow-gray-200/50'
        }`}
      >
        <div className="flex items-center gap-3 px-3 py-1">
          {/* Static Search Icon matching your original amber style */}
          <div className="shrink-0 flex items-center justify-center pl-1">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="w-4 h-4 text-amber-400"
            />
          </div>

          <input
            type="text"
            value={input}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="John 3:16 · Psalm 23 · random"
            className="flex-1 bg-transparent py-2 text-base text-gray-800 placeholder-gray-400 outline-none min-w-0"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-black hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-md"
            aria-label="Search"
          >
            <FontAwesomeIcon
              icon={faArrowRight}
              className={`w-4 h-4 transition-transform duration-300 ${
                loading ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
              }`}
            />
            {loading && (
              <span className="absolute inset-0 m-auto w-4 h-4 rounded-full border-[2.5px] border-black/20 border-t-black animate-spin" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
