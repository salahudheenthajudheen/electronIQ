interface AvatarProps {
  seed: string
  size?: number
  className?: string
}

export function Avatar({ seed, size = 40, className }: AvatarProps) {
  return (
    <img
      src={`https://api.dicebear.com/7.x/thumbs/svg?seed=${seed}`}
      alt="Avatar"
      width={size}
      height={size}
      className={`rounded-full ${className || ''}`}
    />
  )
}
