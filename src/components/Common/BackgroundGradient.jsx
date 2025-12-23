import { motion } from"framer-motion"
import { cn } from"../../lib/utils"

export const BackgroundGradient = ({
  children,
  className,
  containerClassName,
  borderRadius ="rounded-xl",
  animate = true,
}) => {
  const variants = {
    initial: {
      backgroundPosition:"0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%","100% 50%","0 50%"],
    },
  }

  return (
    <div className={cn("relative group", containerClassName)}>
      {/* Gradient border - only visible as thin border around content */}
      <motion.div
        variants={animate ? variants : undefined}
        initial={animate ?"initial" : undefined}
        animate={animate ?"animate" : undefined}
        transition={
          animate
            ? {
                duration: 5,
                repeat: Infinity,
                repeatType:"reverse",
              }
            : undefined
        }
        style={{
          backgroundSize: animate ?"400% 400%" : undefined,
        }}
        className={cn("absolute inset-0 z-[1]",
          borderRadius,"p-[1px]", // Border thickness - matches standard border width"bg-[conic-gradient(from_var(--gradient-angle,0deg),#00ccb1,#7b61ff,#1ca0fb,#00ccb1)]",
          animate &&"animate-gradient-rotate"
        )}
      >
        {/* Inner mask to create border effect */}
        <div className={cn("w-full h-full bg-bg-primary",
          borderRadius
        )} />
      </motion.div>

      {/* Content */}
      <div className={cn("relative z-10", className)}>{children}</div>
      
      {/* CSS for gradient rotation animation */}
      <style>{`
        @property --gradient-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        
        .animate-gradient-rotate {
          animation: gradient-rotate 3s linear infinite;
        }
        
        @keyframes gradient-rotate {
          0% { --gradient-angle: 0deg; }
          100% { --gradient-angle: 360deg; }
        }
      `}</style>
    </div>
  )
}

export default BackgroundGradient
