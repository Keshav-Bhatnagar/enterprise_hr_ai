import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ChevronRight, Key, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';

export default function RoleThrowableDeck({ personas, onSelectPersona, activePersonaId }) {
  const [deckList, setDeckList] = useState(personas);
  const deckRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const topCardRef = useRef(null);

  useEffect(() => {
    // If external active persona changes, rotate it to the top
    const idx = deckList.findIndex(p => p.id === activePersonaId);
    if (idx > 0) {
      const copy = [...deckList];
      const selected = copy.splice(idx, 1)[0];
      setDeckList([selected, ...copy]);
    }
  }, [activePersonaId]);

  const topPersona = deckList[0];

  const handlePointerDown = (e) => {
    if (e.target.closest('button')) {
      return; // Do not hijack pointer capture when clicking the action button
    }
    const cardEl = topCardRef.current;
    if (!cardEl) return;
    setIsDragging(true);
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    try { cardEl.setPointerCapture(e.pointerId); } catch {}
    cardEl.style.transition = 'none';
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const cardEl = topCardRef.current;
    if (!cardEl) return;
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    const rot = dx * 0.075;
    cardEl.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(1.02)`;
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    const cardEl = topCardRef.current;
    if (!cardEl) return;
    try { cardEl.releasePointerCapture(e.pointerId); } catch {}

    const dx = e.clientX - startXRef.current;
    const deckWidth = deckRef.current?.offsetWidth || 340;
    const threshold = deckWidth * 0.12;

    if (Math.abs(dx) > threshold) {
      throwCard(dx > 0 ? 1 : -1);
    } else {
      cardEl.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
      cardEl.style.transform = 'translate(0px, 0px) rotate(0deg) scale(1)';
    }
  };

  const throwCard = (dir = 1) => {
    const cardEl = topCardRef.current;
    if (!cardEl) return;

    cardEl.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease';
    cardEl.style.transform = `translate(${dir * 140}%, -20px) rotate(${dir * 20}deg) scale(0.9)`;
    cardEl.style.opacity = '0';

    setTimeout(() => {
      setDeckList(prev => {
        const copy = [...prev];
        const thrown = copy.shift();
        copy.push(thrown);
        return copy;
      });
    }, 320);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      throwCard(1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      throwCard(-1);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Physical Throwable Deck Stage */}
      <div
        ref={deckRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative w-[340px] h-[400px] outline-none select-none cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'pan-y' }}
        aria-label="Throwable Role Persona Deck. Press Left or Right Arrow to throw card aside."
      >
        {deckList.map((persona, index) => {
          const isTop = index === 0;
          const offsetX = index * 12;
          const offsetY = -index * 10;
          const rot = isTop ? 0 : (index % 2 === 1 ? index * 2.5 : -index * 2);
          const scale = 1 - index * 0.045;
          const zIndex = deckList.length - index;

          return (
            <div
              key={persona.id}
              ref={isTop ? topCardRef : null}
              onPointerDown={isTop ? handlePointerDown : null}
              onPointerMove={isTop ? handlePointerMove : null}
              onPointerUp={isTop ? handlePointerUp : null}
              onPointerCancel={isTop ? handlePointerUp : null}
              className="absolute inset-0 rounded-2xl bg-[#0A0C0E] border border-[rgba(237,231,220,0.16)] flex flex-col justify-between p-6 shadow-2xl"
              style={{
                transform: isTop ? 'translate(0,0) rotate(0deg) scale(1)' : `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg) scale(${scale})`,
                zIndex,
                boxShadow: isTop ? '0 25px 50px -12px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(237, 231, 220, 0.08)' : 'none',
                transition: isTop && isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.3s ease'
              }}
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[rgba(237,231,220,0.13)]">
                  <span className="font-mono text-[10.5px] uppercase font-bold tracking-[0.14em] text-[#E8913C]">
                    IDENTITY CARD #{persona.id.toUpperCase()}
                  </span>
                  <span className="text-[10px] font-mono tracking-widest uppercase border border-[rgba(237,231,220,0.15)] text-[#9EA5A8] px-2 py-0.5 rounded">
                    {persona.role}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="text-[10.5px] font-mono text-[#9EA5A8] uppercase tracking-[0.12em]">
                    Enterprise Persona
                  </div>
                  <h3 className="font-display font-extrabold text-xl text-[#EDE7DC] mt-0.5 tracking-[-0.02em]">
                    {persona.name}
                  </h3>
                  <div className="text-xs text-[#9EA5A8] mt-0.5 font-body">
                    {persona.title}
                  </div>
                </div>

                {/* Clearance & Scope */}
                <div className="mt-4 p-3 rounded-xl bg-[#101317] border border-[rgba(237,231,220,0.08)] space-y-1.5 text-[11px] font-body">
                  <div className="flex justify-between text-[#9EA5A8]">
                    <span>Security Clearance:</span>
                    <strong className="text-[#EDE7DC] font-mono">{persona.badge}</strong>
                  </div>
                  <div className="flex justify-between text-[#9EA5A8]">
                    <span>Default Modules:</span>
                    <span className="text-[#2E6B72] font-semibold">{persona.desc.split(':')[0]}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#9EA5A8] mt-3 line-clamp-2 leading-relaxed">
                  {persona.desc}
                </p>
              </div>

              {/* Card Action */}
              <div className="pt-4 border-t border-[rgba(237,231,220,0.13)]">
                <button
                  type="button"
                  onClick={() => onSelectPersona(persona)}
                  className="w-full py-2.5 rounded-full bg-[#EDE7DC] text-[#0A0C0E] hover:text-[#E8913C] hover:bg-transparent border border-[#EDE7DC] hover:border-[#E8913C] font-mono text-[11px] font-bold tracking-[0.14em] uppercase transition flex items-center justify-center gap-2"
                >
                  <span>Sign In As {persona.name.split(' ')[0]}</span>
                  <ArrowRight className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deck Navigation & Progress Dots */}
      <div className="mt-6 flex flex-col items-center gap-2.5">
        <div className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-[#6C7378]">
          [ ← DRAG OR USE ARROW KEYS TO THROW CARDS → ]
        </div>
        <div className="flex items-center gap-2">
          {personas.map((p, idx) => {
            const isActive = topPersona?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const copy = [...deckList];
                  const i = copy.findIndex(item => item.id === p.id);
                  if (i > 0) {
                    const picked = copy.splice(i, 1)[0];
                    setDeckList([picked, ...copy]);
                  }
                }}
                className={`size-2 rounded-full transition-all ${
                  isActive ? 'bg-[#E8913C] scale-125' : 'bg-[rgba(237,231,220,0.16)] hover:bg-[#9EA5A8]'
                }`}
                title={`View ${p.name}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

