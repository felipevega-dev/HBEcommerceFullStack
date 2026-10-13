export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 min-h-full bg-[var(--color-canvas)] px-4 sm:-mx-[5vw] sm:px-[5vw] md:-mx-[7vw] md:px-[7vw] lg:-mx-[9vw] lg:px-[9vw]">
      {children}
    </div>
  )
}
