interface Props {
  size?: number
  color?: string
  className?: string
}

export function LogoShuriken({ size = 24, color = 'currentColor', className }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shuriken THW — 4 lames en rotation */}
      <g fill={color}>
        {/* Lame haut-droite */}
        <path d="M16 16 L20 4 L24 8 Z" opacity="1" />
        {/* Lame droite-bas */}
        <path d="M16 16 L28 20 L24 24 Z" opacity="1" />
        {/* Lame bas-gauche */}
        <path d="M16 16 L12 28 L8 24 Z" opacity="1" />
        {/* Lame gauche-haut */}
        <path d="M16 16 L4 12 L8 8 Z" opacity="1" />
        {/* Corps central */}
        <circle cx="16" cy="16" r="3" />
      </g>
    </svg>
  )
}
