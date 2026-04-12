import { theme } from "@/styles/theme";

export default function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: theme.colors.card,
        border: `1px solid ${theme.colors.border}`,
        borderRadius: 12,
        padding: 16,

        // 🔥 key change
        height: "100%",
        display: "flex",
        flexDirection: "column",

        transition: "all 0.2s ease",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 25px rgba(0,0,0,0.3)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {children}
    </div>
  );
}
