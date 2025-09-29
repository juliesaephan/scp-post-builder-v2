const TikTokIcon = ({ size = 16, color = "#3A3A3A", ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.2802 0C11.5432 2.27047 12.8054 3.62412 15 3.76812V6.32181C13.7282 6.44661 12.6142 6.029 11.3185 5.24177V10.0179C11.3185 16.0853 4.72994 17.9814 2.08115 13.6324C0.379038 10.834 1.42134 5.92339 6.88149 5.72659V8.41947C6.46553 8.48668 6.02087 8.59228 5.61447 8.73148C4.40004 9.1443 3.71155 9.91712 3.90279 11.2804C4.27095 13.8917 9.0426 14.6645 8.64576 9.56191V0.00480016H11.2802V0Z"
      fill={color}
    />
  </svg>
)

export default TikTokIcon