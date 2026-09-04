import { motion } from 'motion/react'

// Consistent page shell used by every section: an optional eyebrow label,
// a title, a short description, and the page content below.
export function PageContainer({ eyebrow, title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="mx-auto w-full max-w-7xl px-5 py-7 sm:px-8 lg:py-9"
    >
      <div className="mb-8 border-b border-border/70 pb-7">
        {eyebrow && (
          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-semibold tracking-[-0.025em] text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </motion.div>
  )
}
