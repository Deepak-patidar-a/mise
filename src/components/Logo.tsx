

const Logo = () => {
  return (
    <>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 160 40"
        fill="none"
        className="h-8 w-auto" 
      >
        {/* Flame mark */}
        <g transform="translate(0, 4)">
          <path d="M16 2 C16 2, 8 10, 8 18 C8 24.627 11.582 30 16 30 C20.418 30 24 24.627 24 18 C24 10 16 2 16 2Z" fill="#E8520A" opacity="0.15"/>
          <path d="M16 8 C16 8, 11 15, 11 20 C11 23.866 13.239 27 16 27 C18.761 27 21 23.866 21 20 C21 15 16 8 16 8Z" fill="#E8520A" opacity="0.4"/>
          <path d="M16 14 C16 14, 13 18, 13 21.5 C13 23.985 14.343 26 16 26 C17.657 26 19 23.985 19 21.5 C19 18 16 14 16 14Z" fill="#E8520A"/>
        </g>

        {/* Wordmark */}
        <text
          x="36"
          y="28"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="26"
          fontWeight="700"
          letterSpacing="-0.5"
          fill="#1A1410"
        >
          Mise
        </text>

        {/* Dot accent */}
        <circle cx="150" cy="10" r="4" fill="#E8520A"/>
      </svg>
    </>
  )
}

export default Logo