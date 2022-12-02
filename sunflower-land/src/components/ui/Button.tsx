import React from "react";
import classnames from "classnames";
import { pixelLightBorderStyle } from "features/game/lib/style";

interface Props {
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | undefined;
}
export const Button: React.FC<Props> = ({
  children,
  onClick,
  disabled,
  className,
  type,
}) => {
  return (
    <button
      className={classnames(
        "bg-brown-200 w-full p-1 text-white text-shadow text-sm object-contain justify-center items-center hover:bg-brown-300 cursor-pointer flex disabled:opacity-50 ",
        className
      )}
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={pixelLightBorderStyle}
    >
      <div className="mb-1">{children}</div>
    </button>
  );
};
