import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = "", onClick }: CardProps) => {
  return (
    <div
      onClick={onClick}
      className={`overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 ${
        onClick ? "cursor-pointer hover:shadow-md hover:border-gray-200" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface CardImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: "square" | "video" | "wide" | "auto";
  zoomOnHover?: boolean;
}

export const CardImage = ({
  src,
  alt,
  className = "",
  aspectRatio = "video",
  zoomOnHover = true,
}: CardImageProps) => {
  const aspectStyles = {
    square: "aspect-square",
    video: "aspect-video",
    wide: "aspect-[21/9]",
    auto: "h-auto",
  };

  return (
    <div className={`overflow-hidden relative ${aspectStyles[aspectRatio]} ${className}`}>
      <img
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-transform duration-500 ${
          zoomOnHover ? "hover:scale-105" : ""
        }`}
        loading="lazy"
      />
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => {
  return <div className={`p-4 pb-2 ${className}`}>{children}</div>;
};

interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export const CardBody = ({ children, className = "" }: CardBodyProps) => {
  return <div className={`p-4 pt-2 pb-2 text-gray-700 ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = "" }: CardFooterProps) => {
  return (
    <div className={`p-4 pt-2 border-t border-gray-50 bg-gray-50/50 ${className}`}>
      {children}
    </div>
  );
};

