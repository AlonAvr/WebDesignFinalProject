import { motion } from 'motion/react'

// Consistent page shell used by every section: an optional eyebrow label,
// a title, a short description, and the page content below.
export function PageContainer({ eyebrow, title, description, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="mx-auto w-full max-w-6xl px-8 py-8"
    >
      <div className="mb-8">
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </motion.div>
  )
}
