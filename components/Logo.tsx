import Link from "next/link";
import Image from "next/image";

const LOGO_SRC = "/images/logo.jpg";

const SIZES = {
  sm: 36,
  md: 48,
  lg: 64,
  xl: 88,
} as const;

const NAME_SIZES: Record<keyof typeof SIZES, string> = {
  sm: "1.1rem",
  md: "1.35rem",
  lg: "1.6rem",
  xl: "2rem",
};

type LogoSize = keyof typeof SIZES;

interface LogoProps {
  size?: LogoSize;
  href?: string | null;
  className?: string;
  priority?: boolean;
  showName?: boolean;
  nameTheme?: "dark" | "light";
  layout?: "inline" | "stack";
  imageFrame?: boolean;
}

function BrandName({
  size,
  theme,
}: {
  size: LogoSize;
  theme: "dark" | "light";
}) {
  const stockColor = theme === "light" ? "#93c5fd" : undefined;

  return (
    <span
      className={`fw-extrabold tracking-tight ${theme === "light" ? "text-white" : "text-dark"}`}
      style={{ fontFamily: "var(--heading-font)", fontSize: NAME_SIZES[size], lineHeight: 1.1 }}
    >
      SMART
      <span style={stockColor ? { color: stockColor } : undefined} className={theme === "dark" ? "text-primary" : ""}>
        STOCK
      </span>
    </span>
  );
}

export default function Logo({
  size = "md",
  href = "/",
  className = "",
  priority = false,
  showName = false,
  nameTheme = "dark",
  layout = "inline",
  imageFrame = false,
}: LogoProps) {
  const height = SIZES[size];
  const width = Math.round(height * 2.4);

  const image = (
    <Image
      src={LOGO_SRC}
      alt="Smart Stock"
      width={width}
      height={height}
      priority={priority}
      className="d-block object-fit-contain flex-shrink-0"
      style={{ height, width: "auto", maxWidth: "100%" }}
    />
  );

  const content = (
    <span
      className={`d-inline-flex gap-2 ${className} ${
        layout === "stack"
          ? "flex-column align-items-start"
          : "flex-row align-items-center"
      }`}
    >
      {imageFrame ? (
        <span className="logo-image-frame d-inline-block rounded-3 bg-white p-2">
          {image}
        </span>
      ) : (
        image
      )}
      {showName && <BrandName size={size} theme={nameTheme} />}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="d-inline-flex align-items-center text-decoration-none">
        {content}
      </Link>
    );
  }

  return content;
}
