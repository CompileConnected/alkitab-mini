import React from 'react';

export function SearchForm({ input, onChange, onSubmit, loading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="w-full flex gap-2 animate-fade-up delay-300 fixed sm:static bottom-0 left-0 right-0 sm:bottom-auto px-4 sm:px-0 pb-safe-bottom sm:pb-0 bg-[#fafaf7]/80 sm:bg-transparent backdrop-blur-md sm:backdrop-blur-none z-40 pt-3 sm:pt-0 border-t border-black/5 sm:border-t-0"
    >
      <input
        type="text"
        value={input}
        onChange={onChange}
        placeholder="Search… e.g. John 3:16, Psalm 23, random"
        className="flex-1 glass rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-amber-500/40 transition bg-transparent"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-5 py-3 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-black font-bold text-sm hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        →
      </button>
    </form>
  );
}
