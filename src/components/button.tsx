type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
  isLoading?: boolean;
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  isLoading = false,
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={() => {
        if (isDisabled) return;
        onClick?.();
      }}
      disabled={isDisabled}
      style={{
        position: "relative",

        padding: "10px 14px",
        borderRadius: 8,
        border: variant === "primary" ? "none" : "1px solid #e2e8f0",

        cursor: isDisabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,

        background: variant === "primary" ? "#3b82f6" : "#1f2937",
        color: "#f9fafb",
        fontWeight: 500,

        transition: "all 0.2s ease",
      }}
    >
      {/* TEXT */}
      <span
        style={{
          opacity: isLoading ? 0.3 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {children}
      </span>

      {/* SPINNER OVERLAY */}
      {isLoading && (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTop: "2px solid white",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
        </span>
      )}
    </button>
  );
}
